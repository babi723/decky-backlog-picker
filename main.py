import os
import json
import random
import struct
import subprocess
import logging
import time
import asyncio
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any

# Decky imports
import decky

logger = logging.getLogger("BacklogPicker")

PROTONDB_CACHE_TTL = 24 * 3600  # 24 hours
HLTB_CACHE_TTL = 14 * 24 * 3600  # 14 days


def get_steam_path() -> str:
    """Find the Steam installation path."""
    candidates = [
        os.path.expanduser("~/.steam/steam"),
        os.path.expanduser("~/.local/share/Steam"),
        "/home/deck/.steam/steam",
        "/home/deck/.local/share/Steam",
    ]
    for path in candidates:
        if os.path.isdir(path):
            return path
    return os.path.expanduser("~/.steam/steam")


def get_steam_id() -> str | None:
    """Get the most recently used Steam user ID."""
    steam_path = get_steam_path()
    loginusers = os.path.join(steam_path, "config", "loginusers.vdf")
    if not os.path.exists(loginusers):
        return None
    try:
        with open(loginusers, "r") as f:
            content = f.read()
        # Find all steam IDs
        import re
        ids = re.findall(r'"(\d{17})"', content)
        return ids[0] if ids else None
    except Exception as e:
        logger.error(f"Failed to get Steam ID: {e}")
        return None


def steam_id_to_accountid(steam_id: str) -> str:
    """Convert SteamID64 to accountID (used in localconfig.vdf)."""
    return str(int(steam_id) - 76561197960265728)


def get_installed_app_ids() -> set[str]:
    """Get app IDs of installed games from steamapps manifests."""
    steam_path = get_steam_path()
    installed = set()

    # Check all library folders
    library_folders_vdf = os.path.join(steam_path, "steamapps", "libraryfolders.vdf")
    library_paths = [os.path.join(steam_path, "steamapps")]

    if os.path.exists(library_folders_vdf):
        try:
            with open(library_folders_vdf, "r") as f:
                content = f.read()
            import re
            # Find paths in libraryfolders.vdf
            paths = re.findall(r'"path"\s+"([^"]+)"', content)
            for p in paths:
                steamapps = os.path.join(p, "steamapps")
                if os.path.isdir(steamapps):
                    library_paths.append(steamapps)
        except Exception as e:
            logger.error(f"Failed to parse libraryfolders.vdf: {e}")

    for steamapps in library_paths:
        if not os.path.isdir(steamapps):
            continue
        for fname in os.listdir(steamapps):
            if fname.startswith("appmanifest_") and fname.endswith(".acf"):
                app_id = fname.replace("appmanifest_", "").replace(".acf", "")
                installed.add(app_id)

    return installed


def parse_localconfig_playtimes(steam_id: str) -> dict[str, dict]:
    """
    Parse localconfig.vdf for per-app playtime data.
    Returns dict of appid -> {playtime_forever, playtime_last_two_weeks, last_played}
    """
    steam_path = get_steam_path()
    account_id = steam_id_to_accountid(steam_id)
    localconfig_path = os.path.join(
        steam_path, "userdata", account_id, "config", "localconfig.vdf"
    )

    if not os.path.exists(localconfig_path):
        logger.warning(f"localconfig.vdf not found at {localconfig_path}")
        return {}

    try:
        with open(localconfig_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        import re
        playtimes = {}

        # Find the "apps" section in Software > Valve > Steam > apps
        apps_match = re.search(
            r'"apps"\s*\{(.*?)\n\t\t\t\}', content, re.DOTALL | re.IGNORECASE
        )
        if not apps_match:
            # Try alternative structure
            apps_match = re.search(r'"Apps"\s*\{(.*?)\n\t\t\}', content, re.DOTALL)

        if apps_match:
            apps_block = apps_match.group(1)
            # Find each app entry
            app_blocks = re.findall(
                r'"(\d+)"\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}', apps_block, re.DOTALL
            )
            for app_id, app_data in app_blocks:
                playtime = re.search(
                    r'"Playtime"\s+"(\d+)"', app_data, re.IGNORECASE
                )
                last_played = re.search(
                    r'"LastPlayed"\s+"(\d+)"', app_data, re.IGNORECASE
                )
                playtimes[app_id] = {
                    "playtime_forever": int(playtime.group(1)) if playtime else 0,
                    "last_played": int(last_played.group(1)) if last_played else 0,
                }

        return playtimes
    except Exception as e:
        logger.error(f"Failed to parse localconfig.vdf: {e}")
        return {}


def _parse_collections_from_cloud_storage(steam_id: str) -> dict[str, dict]:
    """
    Parse Steam collections from the current per-account cloud storage cache:
    userdata/<accountid>/config/cloudstorage/cloud-storage-namespace-1.json

    This is where modern Steam clients actually keep collections — each
    entry is keyed "user-collections.<id>" with its definition JSON-encoded
    in an inner "value" string. The older "user-collections" key in
    localconfig.vdf (see _parse_collections_from_localconfig) is stale/legacy
    once a client has migrated to this cache (marked by a
    "collection-bootstrap-complete" entry).

    Only static (handpicked) collections are supported — ones with an
    explicit "added" app ID list. Dynamic/rule-based collections (defined by
    a "filterSpec" instead) are skipped, since replicating Steam's
    filter-rule engine is out of scope. This format is undocumented/
    reverse-engineered and may change between Steam client versions;
    failures degrade to no collections rather than breaking the plugin.

    Returns {collection_id: {"name": str, "app_ids": set[str]}}.
    """
    steam_path = get_steam_path()
    account_id = steam_id_to_accountid(steam_id)
    namespace_path = os.path.join(
        steam_path, "userdata", account_id, "config", "cloudstorage",
        "cloud-storage-namespace-1.json",
    )

    if not os.path.exists(namespace_path):
        return {}

    try:
        with open(namespace_path, "r", encoding="utf-8", errors="replace") as f:
            entries = json.load(f)

        collections = {}
        for item in entries:
            if not isinstance(item, list) or len(item) != 2:
                continue
            key, entry = item
            if not isinstance(key, str) or not key.startswith("user-collections."):
                continue
            if not isinstance(entry, dict) or entry.get("is_deleted") or "value" not in entry:
                continue  # tombstoned/deleted collection

            try:
                value = json.loads(entry["value"])
            except Exception:
                continue

            added = value.get("added")
            if not isinstance(added, list):
                continue  # dynamic/rule-based collection, unsupported

            cid = value.get("id") or key[len("user-collections."):]
            collections[cid] = {
                "name": value.get("name") or cid,
                "app_ids": {str(a) for a in added},
            }
        return collections
    except Exception as e:
        logger.warning(f"Failed to parse cloud storage collections: {e}")
        return {}


def _parse_collections_from_localconfig(steam_id: str) -> dict[str, dict]:
    """
    Legacy fallback: parse localconfig.vdf's "user-collections" key (a JSON
    blob embedded as a VDF string value). Kept in case some Steam client
    versions/installs still hold collections here instead of the cloud
    storage cache. See _parse_collections_from_cloud_storage for the format
    Steam actually uses today.
    """
    steam_path = get_steam_path()
    account_id = steam_id_to_accountid(steam_id)
    localconfig_path = os.path.join(
        steam_path, "userdata", account_id, "config", "localconfig.vdf"
    )

    if not os.path.exists(localconfig_path):
        return {}

    try:
        with open(localconfig_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        import re
        match = re.search(r'"user-collections"\s+"((?:[^"\\]|\\.)*)"', content)
        if not match:
            return {}

        raw_json = match.group(1).replace('\\"', '"').replace("\\\\", "\\")
        if not raw_json.strip() or raw_json.strip() == "{}":
            return {}

        data = json.loads(raw_json)
        collections = {}
        for cid, entry in data.items():
            if not isinstance(entry, dict):
                continue
            added = entry.get("added")
            if not isinstance(added, list):
                continue  # dynamic/rule-based collection, unsupported
            collections[cid] = {
                "name": entry.get("name") or cid,
                "app_ids": {str(a) for a in added},
            }
        return collections
    except Exception as e:
        logger.warning(f"Failed to parse legacy user-collections: {e}")
        return {}


def parse_user_collections(steam_id: str) -> dict[str, dict]:
    """
    Return the user's static (handpicked) Steam collections, trying the
    modern cloud storage cache first and falling back to the legacy
    localconfig.vdf location. See the two helpers above for format details.
    """
    collections = _parse_collections_from_cloud_storage(steam_id)
    if collections:
        return collections
    return _parse_collections_from_localconfig(steam_id)


def get_game_name_from_manifest(app_id: str) -> str | None:
    """Get game name from its appmanifest .acf file."""
    steam_path = get_steam_path()
    library_paths = [os.path.join(steam_path, "steamapps")]

    library_folders_vdf = os.path.join(steam_path, "steamapps", "libraryfolders.vdf")
    if os.path.exists(library_folders_vdf):
        try:
            with open(library_folders_vdf, "r") as f:
                content = f.read()
            import re
            paths = re.findall(r'"path"\s+"([^"]+)"', content)
            for p in paths:
                library_paths.append(os.path.join(p, "steamapps"))
        except Exception:
            pass

    import re
    for steamapps in library_paths:
        manifest = os.path.join(steamapps, f"appmanifest_{app_id}.acf")
        if os.path.exists(manifest):
            try:
                with open(manifest, "r") as f:
                    content = f.read()
                name_match = re.search(r'"name"\s+"([^"]+)"', content)
                if name_match:
                    return name_match.group(1)
            except Exception:
                pass
    return None


# Steam compatibility tools/runtimes (Proton, Steam Linux Runtime, etc.) get
# their own appmanifest_*.acf just like real games, so installed-app
# detection picks them up too. Filtering by app ID is unreliable since new
# Proton versions ship regularly with new IDs — match by name prefix
# instead, since Valve keeps these names consistent across versions.
_NON_GAME_NAME_PREFIXES = (
    "Proton",
    "Steam Linux Runtime",
    "SteamVR",
    "Steamworks Common Redistributables",
)


def is_non_game_tool(name: str) -> bool:
    return any(name.startswith(prefix) for prefix in _NON_GAME_NAME_PREFIXES)


# ─── appinfo.vdf (names for non-installed games) ───────────────────────────
#
# get_game_name_from_manifest() only works for installed games (it reads
# appmanifest_*.acf, which only exists once a game is installed). Games
# found via a Steam collection or the "All" library scope but not installed
# otherwise show up as "App <id>". Steam separately maintains a local cache
# of metadata (including names) for every app it has ever shown the user —
# <steam_path>/appcache/appinfo.vdf — a binary KeyValues format, needing no
# Steam Web API key. This format is undocumented/reverse-engineered (fields
# verified by hand against a real local file) and may change between Steam
# client versions; failures degrade to no name (falls back to "App <id>")
# rather than breaking the plugin.

_APPINFO_TYPE_NONE = 0x00
_APPINFO_TYPE_STRING = 0x01
_APPINFO_TYPE_INT32 = 0x02
_APPINFO_TYPE_FLOAT32 = 0x03
_APPINFO_TYPE_POINTER = 0x04
_APPINFO_TYPE_WIDESTRING = 0x05
_APPINFO_TYPE_COLOR = 0x06
_APPINFO_TYPE_UINT64 = 0x07
_APPINFO_TYPE_END = 0x08
_APPINFO_TYPE_INT64 = 0x0A

_APPINFO_MAGICS = (0x07564427, 0x07564428, 0x07564429)

# Per-entry header (state + last_updated + access_token + hash(es) +
# change_number) length in bytes, before the binary KeyValues tree starts.
# Varies slightly across Steam client format revisions; 60 is current as of
# writing. Tried in order per entry; whichever fully parses the entry's KV
# tree and lands exactly on that entry's known end offset is correct.
_APPINFO_HEADER_LEN_CANDIDATES = (60, 40, 68, 44, 48, 52, 56, 64)


def _appinfo_read_cstring(buf: bytes, offset: int) -> tuple[str, int]:
    end = buf.index(b"\x00", offset)
    return buf[offset:end].decode("utf-8", errors="replace"), end + 1


def _appinfo_parse_kv_object(buf: bytes, offset: int, strings: list[str]) -> tuple[dict, int]:
    """Parse one binary KeyValues object. Keys are indices into `strings`
    (a shared string table); string values remain inline/null-terminated."""
    result: dict[str, Any] = {}
    while True:
        type_byte = buf[offset]
        offset += 1
        if type_byte == _APPINFO_TYPE_END:
            return result, offset

        key_index = struct.unpack_from("<I", buf, offset)[0]
        offset += 4
        if key_index >= len(strings):
            raise ValueError(f"key index {key_index} out of range")
        key = strings[key_index]

        if type_byte == _APPINFO_TYPE_NONE:
            value, offset = _appinfo_parse_kv_object(buf, offset, strings)
        elif type_byte in (_APPINFO_TYPE_STRING, _APPINFO_TYPE_WIDESTRING):
            value, offset = _appinfo_read_cstring(buf, offset)
        elif type_byte in (_APPINFO_TYPE_INT32, _APPINFO_TYPE_COLOR, _APPINFO_TYPE_POINTER):
            value = struct.unpack_from("<i", buf, offset)[0]
            offset += 4
        elif type_byte == _APPINFO_TYPE_FLOAT32:
            value = struct.unpack_from("<f", buf, offset)[0]
            offset += 4
        elif type_byte == _APPINFO_TYPE_UINT64:
            value = struct.unpack_from("<Q", buf, offset)[0]
            offset += 8
        elif type_byte == _APPINFO_TYPE_INT64:
            value = struct.unpack_from("<q", buf, offset)[0]
            offset += 8
        else:
            raise ValueError(f"unknown KV type byte {type_byte:#x}")

        result[key] = value


def _appinfo_load_string_table(buf: bytes) -> tuple[list[str], int]:
    """Skip past all app entries (using each entry's size field) to reach
    the trailing string table, then parse it. Returns (strings, apps_end)."""
    offset = 8  # past magic(4) + universe(4)
    while True:
        appid = struct.unpack_from("<I", buf, offset)[0]
        offset += 4
        if appid == 0:
            break
        size = struct.unpack_from("<I", buf, offset)[0]
        offset += 4
        offset += size

    apps_end = offset
    count = struct.unpack_from("<I", buf, offset)[0]
    offset += 4
    strings = []
    for _ in range(count):
        s, offset = _appinfo_read_cstring(buf, offset)
        strings.append(s)
    return strings, apps_end


def get_names_from_appinfo(app_ids: set[str]) -> dict[str, str]:
    """Look up display names for the given app IDs from appinfo.vdf. Only
    apps found in the cache are included in the returned dict."""
    steam_path = get_steam_path()
    appinfo_path = os.path.join(steam_path, "appcache", "appinfo.vdf")
    if not os.path.isfile(appinfo_path):
        return {}

    try:
        with open(appinfo_path, "rb") as f:
            buf = f.read()

        magic = struct.unpack_from("<I", buf, 0)[0]
        if magic not in _APPINFO_MAGICS:
            return {}

        strings, apps_end = _appinfo_load_string_table(buf)

        offset = 8
        wanted = set(app_ids)
        names: dict[str, str] = {}
        while offset < apps_end and wanted:
            appid = struct.unpack_from("<I", buf, offset)[0]
            offset += 4
            if appid == 0:
                break
            size = struct.unpack_from("<I", buf, offset)[0]
            offset += 4
            entry_end = offset + size

            app_id_str = str(appid)
            if app_id_str in wanted:
                for header_len in _APPINFO_HEADER_LEN_CANDIDATES:
                    try:
                        obj, final_offset = _appinfo_parse_kv_object(
                            buf, offset + header_len, strings
                        )
                        if final_offset != entry_end:
                            continue
                        name = obj.get("appinfo", {}).get("common", {}).get("name")
                        if isinstance(name, str) and name:
                            names[app_id_str] = name
                            wanted.discard(app_id_str)
                        break
                    except Exception:
                        continue

            offset = entry_end

        return names
    except Exception as e:
        logger.warning(f"Failed to parse appinfo.vdf: {e}")
        return {}


def resolve_missing_names(app_ids: set[str]) -> dict[str, str]:
    """
    Resolve display names for non-installed app IDs (which have no
    appmanifest to read from) via appinfo.vdf, backed by a persistent
    on-disk cache — names don't change, so once resolved they're cached
    indefinitely (no TTL, unlike the ProtonDB/HLTB caches).
    """
    cache = _load_json("appinfo_names_cache.json", {})
    missing = {aid for aid in app_ids if aid not in cache}
    if missing:
        resolved = get_names_from_appinfo(missing)
        if resolved:
            cache.update(resolved)
            _save_json("appinfo_names_cache.json", cache)
    return {aid: cache[aid] for aid in app_ids if aid in cache}


# ─── Generic JSON persistence helpers ──────────────────────────────────────

def _settings_path(filename: str) -> str:
    return os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, filename)


def _load_json(filename: str, default: Any) -> Any:
    try:
        path = _settings_path(filename)
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"_load_json({filename}) error: {e}")
    return default


def _save_json(filename: str, data: Any) -> bool:
    try:
        path = _settings_path(filename)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f)
        return True
    except Exception as e:
        logger.error(f"_save_json({filename}) error: {e}")
        return False


# ─── Order (backlog queue) persistence ─────────────────────────────────────

def _load_order() -> list[dict]:
    return _load_json("order.json", [])


def _save_order(order: list[dict]) -> bool:
    return _save_json("order.json", order)


# ─── ProtonDB integration ──────────────────────────────────────────────────

def _fetch_protondb(app_id: str) -> dict:
    """Fetch ProtonDB compatibility summary for an app ID. Never raises."""
    url = f"https://www.protondb.com/api/v1/reports/summaries/{app_id}.json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        raw_tier = data.get("tier")
        tier = raw_tier.capitalize() if isinstance(raw_tier, str) and raw_tier else "Unknown"
        return {
            "tier": tier,
            "confidence": data.get("confidence", "unknown"),
            "reports": data.get("total", 0),
            "cached_at": int(time.time()),
        }
    except Exception as e:
        logger.warning(f"ProtonDB fetch failed for {app_id}: {e}")
        return {
            "tier": "Unknown",
            "confidence": "unknown",
            "reports": 0,
            "cached_at": int(time.time()),
        }


def _get_cached_protondb(app_id: str, protondb_cache: dict) -> dict | None:
    """Read-only cache lookup, no network. Returns None if missing/stale."""
    entry = protondb_cache.get(app_id)
    if not entry:
        return None
    if int(time.time()) - entry.get("cached_at", 0) > PROTONDB_CACHE_TTL:
        return None
    return entry


# ─── HowLongToBeat integration ──────────────────────────────────────────────

_HLTB_STRIP_SUFFIXES = [
    "Game of the Year Edition",
    "Definitive Edition",
    "Digital Deluxe Edition",
    "Digital Deluxe",
    "Deluxe Edition",
    "Ultimate Edition",
    "Complete Edition",
    "Enhanced Edition",
    "Remastered",
    "GOTY Edition",
    "GOTY",
]


def _normalize_title(name: str) -> str:
    """Strip trademark symbols, punctuation and common edition suffixes for HLTB search."""
    import re
    title = name.replace("™", "").replace("®", "")
    for suffix in _HLTB_STRIP_SUFFIXES:
        title = re.sub(rf"[:\-–]?\s*{re.escape(suffix)}\s*$", "", title, flags=re.IGNORECASE)
    title = re.sub(r"[^\w\s]", " ", title)
    title = re.sub(r"\s+", " ", title)
    return title.strip()


def _fetch_hltb(name: str) -> dict:
    """Search HowLongToBeat for a normalized title. Never raises."""
    now = int(time.time())
    query = _normalize_title(name)
    if not query:
        return {"hours": None, "hltb_game_id": None, "matched_title": None, "cached_at": now}

    try:
        payload = {
            "searchType": "games",
            "searchTerms": query.split(),
            "searchPage": 1,
            "size": 5,
            "searchOptions": {
                "games": {
                    "userId": 0,
                    "platform": "",
                    "sortCategory": "popular",
                    "rangeCategory": "main",
                    "rangeTime": {"min": 0, "max": 0},
                    "gameplay": {"perspective": "", "flow": "", "genre": ""},
                    "modifier": "",
                },
                "users": {"sortCategory": "postcount"},
                "filter": "",
                "sort": 0,
                "randomizer": 0,
            },
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            "https://howlongtobeat.com/api/search",
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://howlongtobeat.com/",
            },
        )
        with urllib.request.urlopen(req, timeout=6) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        entries = result.get("data", [])
        if not entries:
            return {"hours": None, "hltb_game_id": None, "matched_title": None, "cached_at": now}

        best = entries[0]
        main_seconds = best.get("comp_main", 0)
        hours = round(main_seconds / 3600.0, 1) if main_seconds else None
        return {
            "hours": hours,
            "hltb_game_id": best.get("game_id"),
            "matched_title": best.get("game_name"),
            "cached_at": now,
        }
    except Exception as e:
        logger.warning(f"HLTB fetch failed for '{name}': {e}")
        return {"hours": None, "hltb_game_id": None, "matched_title": None, "cached_at": now}


def _get_cached_hltb(app_id: str, hltb_cache: dict) -> dict | None:
    """Read-only cache lookup, no network. Returns None if missing/stale."""
    entry = hltb_cache.get(app_id)
    if not entry:
        return None
    if int(time.time()) - entry.get("cached_at", 0) > HLTB_CACHE_TTL:
        return None
    return entry


class Plugin:
    async def get_library(self, filters: dict) -> list[dict]:
        """
        Returns a filtered list of games from the Steam library.

        filters:
          - installed_only: bool
          - never_played: bool       (playtime == 0)
          - max_playtime_hours: int  (0 = no limit)
          - min_playtime_hours: int
          - proton_filter: "any" | "gold_plus" | "platinum_only"
          - collection_id: str | None (from get_collections())
        """
        try:
            steam_id = get_steam_id()
            installed_ids = get_installed_app_ids()
            logger.info(
                f"get_library: steam_path={get_steam_path()!r} steam_id={steam_id!r} "
                f"installed_count={len(installed_ids)} filters={filters}"
            )
            playtimes = parse_localconfig_playtimes(steam_id) if steam_id else {}
            protondb_cache = _load_json("protondb_cache.json", {})
            hltb_cache = _load_json("hltb_cache.json", {})
            order_positions = {
                item["app_id"]: item["position"] for item in _load_order()
            }

            installed_only = filters.get("installed_only", True)
            never_played = filters.get("never_played", False)
            max_playtime = filters.get("max_playtime_hours", 0)  # 0 = no limit
            min_playtime = filters.get("min_playtime_hours", 0)
            blacklist = set(filters.get("blacklist", []))
            proton_filter = filters.get("proton_filter", "gold_plus")
            collection_id = filters.get("collection_id")

            # Build candidate list
            if installed_only:
                candidates = list(installed_ids)
            else:
                # All apps we have playtime data for + installed
                candidates = list(set(playtimes.keys()) | installed_ids)

            if collection_id:
                collections = parse_user_collections(steam_id) if steam_id else {}
                collection = collections.get(collection_id)
                collection_app_ids = collection["app_ids"] if collection else set()
                if installed_only:
                    candidates = [a for a in candidates if a in collection_app_ids]
                else:
                    # Trust the collection's own app ID list as ground truth: it
                    # can reference games this device has never installed or
                    # launched (no local playtime record), which the
                    # playtime-derived candidate set above would otherwise hide.
                    candidates = list(collection_app_ids)

            games = []
            for app_id in candidates:
                if app_id in blacklist:
                    continue

                # Skip non-game app IDs (tools, redistributables, etc.)
                # App IDs < 10 are usually invalid
                if not app_id.isdigit() or int(app_id) < 10:
                    continue

                playtime_data = playtimes.get(app_id, {})
                playtime_minutes = playtime_data.get("playtime_forever", 0)
                playtime_hours = playtime_minutes / 60.0
                last_played = playtime_data.get("last_played", 0)

                # Apply filters
                if never_played and playtime_minutes > 0:
                    continue
                if max_playtime > 0 and playtime_hours > max_playtime:
                    continue
                if min_playtime > 0 and playtime_hours < min_playtime:
                    continue

                proton_entry = _get_cached_protondb(app_id, protondb_cache)
                proton_tier = proton_entry["tier"] if proton_entry else None

                if proton_filter == "gold_plus" and proton_tier not in ("Gold", "Platinum"):
                    continue
                if proton_filter == "platinum_only" and proton_tier != "Platinum":
                    continue
                # "any" -> no proton filtering

                is_installed = app_id in installed_ids
                name = get_game_name_from_manifest(app_id) if is_installed else None
                if not name:
                    name = f"App {app_id}"
                if is_non_game_tool(name):
                    continue

                hltb_entry = _get_cached_hltb(app_id, hltb_cache)

                games.append({
                    "app_id": app_id,
                    "name": name,
                    "playtime_hours": round(playtime_hours, 1),
                    "last_played": last_played,
                    "is_installed": is_installed,
                    "proton_tier": proton_tier,
                    "proton_confidence": proton_entry["confidence"] if proton_entry else None,
                    "proton_reports": proton_entry["reports"] if proton_entry else None,
                    "order_position": order_positions.get(app_id),
                    "hltb_main_story_hours": hltb_entry["hours"] if hltb_entry else None,
                })

            # Non-installed games have no appmanifest to read a real name
            # from (placeholder "App <id>" above) — batch-resolve them all
            # in one appinfo.vdf pass rather than one file scan per game.
            missing_name_ids = {
                g["app_id"] for g in games
                if not g["is_installed"] and g["name"] == f"App {g['app_id']}"
            }
            if missing_name_ids:
                resolved_names = resolve_missing_names(missing_name_ids)
                for g in games:
                    if g["app_id"] in resolved_names:
                        g["name"] = resolved_names[g["app_id"]]

            return games

        except Exception as e:
            logger.error(f"get_library error: {e}")
            return []

    async def pick_random(self, filters: dict) -> dict | None:
        """Pick a random game matching the given filters."""
        games = await self.get_library(filters)
        if not games:
            return None
        return random.choice(games)

    async def get_collections(self) -> list[dict]:
        """
        Return the user's locally-created (static) Steam collections, for use
        as a filter option. Dynamic/rule-based collections are excluded (see
        parse_user_collections). Returns [{"id", "name", "count"}, ...].
        """
        steam_id = get_steam_id()
        if not steam_id:
            return []
        collections = parse_user_collections(steam_id)
        return [
            {"id": cid, "name": entry["name"], "count": len(entry["app_ids"])}
            for cid, entry in collections.items()
        ]

    async def get_blacklist(self) -> list[str]:
        """Return the current blacklist of app IDs."""
        return _load_json("blacklist.json", [])

    async def add_to_blacklist(self, app_id: str) -> bool:
        """Add an app ID to the blacklist."""
        blacklist = await self.get_blacklist()
        if app_id not in blacklist:
            blacklist.append(app_id)
        return _save_json("blacklist.json", blacklist)

    async def remove_from_blacklist(self, app_id: str) -> bool:
        """Remove an app ID from the blacklist."""
        blacklist = await self.get_blacklist()
        blacklist = [x for x in blacklist if x != app_id]
        return _save_json("blacklist.json", blacklist)

    async def launch_game(self, app_id: str) -> bool:
        """Launch a game by its app ID."""
        try:
            subprocess.Popen(
                ["steam", f"steam://rungameid/{app_id}"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            return True
        except Exception as e:
            logger.error(f"launch_game error: {e}")
            return False

    # ─── ProtonDB ───────────────────────────────────────────────────────────

    async def get_protondb_tier(self, app_id: str) -> dict:
        """Return cached ProtonDB info for one app, fetching if missing/stale."""
        protondb_cache = _load_json("protondb_cache.json", {})
        entry = _get_cached_protondb(app_id, protondb_cache)
        if entry:
            return entry
        entry = _fetch_protondb(app_id)
        protondb_cache[app_id] = entry
        _save_json("protondb_cache.json", protondb_cache)
        return entry

    async def refresh_metadata(self, app_ids: list[str]) -> bool:
        """
        Warm the ProtonDB cache for a batch of app IDs (e.g. the Library tab's
        visible list). Fire-and-forget from the frontend's point of view: it
        should re-fetch get_library()/get_order() afterwards to see updates.
        """
        protondb_cache = _load_json("protondb_cache.json", {})
        changed = False
        for app_id in app_ids:
            if _get_cached_protondb(app_id, protondb_cache):
                continue
            protondb_cache[app_id] = _fetch_protondb(app_id)
            changed = True
            await asyncio.sleep(0.15)  # avoid hammering protondb.com
        if changed:
            _save_json("protondb_cache.json", protondb_cache)
        return True

    # ─── HowLongToBeat ──────────────────────────────────────────────────────

    async def get_hltb_estimate(self, app_id: str, name: str) -> dict:
        """Return cached HLTB info for one app, fetching if missing/stale."""
        hltb_cache = _load_json("hltb_cache.json", {})
        entry = _get_cached_hltb(app_id, hltb_cache)
        if entry:
            return entry
        entry = _fetch_hltb(name)
        hltb_cache[app_id] = entry
        _save_json("hltb_cache.json", hltb_cache)
        return entry

    async def refresh_hltb(self, games: list[dict]) -> bool:
        """
        Warm the HLTB cache for a batch of games (each {"app_id", "name"}).
        Fire-and-forget: the frontend should re-fetch get_library()/get_order()
        afterwards to see updated estimates.
        """
        hltb_cache = _load_json("hltb_cache.json", {})
        changed = False
        for g in games:
            app_id = g.get("app_id")
            name = g.get("name", "")
            if not app_id or _get_cached_hltb(app_id, hltb_cache):
                continue
            hltb_cache[app_id] = _fetch_hltb(name)
            changed = True
            await asyncio.sleep(0.2)  # avoid hammering howlongtobeat.com
        if changed:
            _save_json("hltb_cache.json", hltb_cache)
        return True

    # ─── Backlog order ──────────────────────────────────────────────────────

    async def get_order(self) -> list[dict]:
        """Return the user's backlog order, enriched with game metadata."""
        order = _load_order()
        order.sort(key=lambda item: item["position"])

        installed_ids = get_installed_app_ids()
        steam_id = get_steam_id()
        playtimes = parse_localconfig_playtimes(steam_id) if steam_id else {}
        protondb_cache = _load_json("protondb_cache.json", {})
        hltb_cache = _load_json("hltb_cache.json", {})

        result = []
        for item in order:
            app_id = item["app_id"]
            is_installed = app_id in installed_ids
            name = get_game_name_from_manifest(app_id) if is_installed else None
            if not name:
                name = f"App {app_id}"
            playtime_hours = round(playtimes.get(app_id, {}).get("playtime_forever", 0) / 60.0, 1)
            proton_entry = _get_cached_protondb(app_id, protondb_cache)
            hltb_entry = _get_cached_hltb(app_id, hltb_cache)
            hltb_hours = hltb_entry["hours"] if hltb_entry else None

            # Remaining = HLTB Main Story - Steam playtime. Steam playtime can
            # include replays/idle/multiplayer, so once it meets or exceeds the
            # estimate we report "reached" instead of a misleading "0h left".
            remaining_hours = None
            reached_estimate = False
            if hltb_hours is not None:
                if playtime_hours >= hltb_hours:
                    reached_estimate = True
                else:
                    remaining_hours = round(hltb_hours - playtime_hours, 1)

            result.append({
                **item,
                "name": name,
                "is_installed": is_installed,
                "playtime_hours": playtime_hours,
                "proton_tier": proton_entry["tier"] if proton_entry else None,
                "hltb_main_story_hours": hltb_hours,
                "remaining_hours": remaining_hours,
                "reached_estimate": reached_estimate,
            })

        missing_name_ids = {
            r["app_id"] for r in result
            if not r["is_installed"] and r["name"] == f"App {r['app_id']}"
        }
        if missing_name_ids:
            resolved_names = resolve_missing_names(missing_name_ids)
            for r in result:
                if r["app_id"] in resolved_names:
                    r["name"] = resolved_names[r["app_id"]]

        return result

    async def add_to_order(self, app_id: str) -> bool:
        """Add a game to the end of the backlog order. No duplicates."""
        order = _load_order()
        if any(item["app_id"] == app_id for item in order):
            return False

        position = max((item["position"] for item in order), default=-1) + 1
        # First item in an empty order starts as the active game.
        status = "playing" if not order else "queued"

        order.append({
            "app_id": app_id,
            "position": position,
            "added_at": datetime.now(timezone.utc).isoformat(),
            "status": status,
            "deadline": None,
        })
        return _save_order(order)

    async def remove_from_order(self, app_id: str) -> bool:
        """Remove a game from the backlog order and compact positions."""
        order = [item for item in _load_order() if item["app_id"] != app_id]
        order.sort(key=lambda item: item["position"])
        for i, item in enumerate(order):
            item["position"] = i
        return _save_order(order)

    async def move_order_item(self, app_id: str, direction: str) -> bool:
        """Move a backlog item up or down one position (controller-friendly reorder)."""
        order = _load_order()
        order.sort(key=lambda item: item["position"])

        idx = next((i for i, item in enumerate(order) if item["app_id"] == app_id), None)
        if idx is None:
            return False

        swap_idx = idx - 1 if direction == "up" else idx + 1
        if swap_idx < 0 or swap_idx >= len(order):
            return False

        order[idx]["position"], order[swap_idx]["position"] = (
            order[swap_idx]["position"],
            order[idx]["position"],
        )
        return _save_order(order)

    async def set_order_status(self, app_id: str, status: str) -> bool:
        """
        Set a backlog item's status ("queued" | "playing" | "completed").
        Completing a game auto-advances the next queued item to "playing".
        """
        order = _load_order()
        order.sort(key=lambda item: item["position"])

        target = next((item for item in order if item["app_id"] == app_id), None)
        if not target:
            return False

        target["status"] = status
        if status == "completed":
            next_queued = next((item for item in order if item["status"] == "queued"), None)
            if next_queued:
                next_queued["status"] = "playing"

        return _save_order(order)

    async def set_order_deadline(self, app_id: str, deadline: str | None) -> bool:
        """Set or clear a backlog item's optional deadline (ISO date string)."""
        order = _load_order()
        target = next((item for item in order if item["app_id"] == app_id), None)
        if not target:
            return False
        target["deadline"] = deadline
        return _save_order(order)

    async def _main(self):
        """Called on plugin load."""
        steam_path = get_steam_path()
        installed_ids = get_installed_app_ids()
        logger.info(
            f"Backlog Picker loaded. steam_path={steam_path!r} "
            f"(exists={os.path.isdir(steam_path)}) steam_id={get_steam_id()!r} "
            f"installed_count={len(installed_ids)}"
        )

    async def _unload(self):
        """Called on plugin unload."""
        logger.info("Backlog Picker unloaded.")
