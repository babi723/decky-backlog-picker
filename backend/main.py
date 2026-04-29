import os
import json
import random
import subprocess
import logging
from typing import Any

# Decky imports
import decky

logger = logging.getLogger("BacklogPicker")


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


class Plugin:
    async def get_library(self, filters: dict) -> list[dict]:
        """
        Returns a filtered list of games from the Steam library.

        filters:
          - installed_only: bool
          - never_played: bool       (playtime == 0)
          - max_playtime_hours: int  (0 = no limit)
          - min_playtime_hours: int
        """
        try:
            steam_id = get_steam_id()
            installed_ids = get_installed_app_ids()
            playtimes = parse_localconfig_playtimes(steam_id) if steam_id else {}

            installed_only = filters.get("installed_only", True)
            never_played = filters.get("never_played", False)
            max_playtime = filters.get("max_playtime_hours", 0)  # 0 = no limit
            min_playtime = filters.get("min_playtime_hours", 0)
            blacklist = set(filters.get("blacklist", []))

            # Build candidate list
            if installed_only:
                candidates = list(installed_ids)
            else:
                # All apps we have playtime data for + installed
                candidates = list(set(playtimes.keys()) | installed_ids)

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

                is_installed = app_id in installed_ids
                name = get_game_name_from_manifest(app_id) if is_installed else None
                if not name:
                    name = f"App {app_id}"

                games.append({
                    "app_id": app_id,
                    "name": name,
                    "playtime_hours": round(playtime_hours, 1),
                    "last_played": last_played,
                    "is_installed": is_installed,
                })

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

    async def get_blacklist(self) -> list[str]:
        """Return the current blacklist of app IDs."""
        try:
            path = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "blacklist.json")
            if os.path.exists(path):
                with open(path, "r") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"get_blacklist error: {e}")
        return []

    async def add_to_blacklist(self, app_id: str) -> bool:
        """Add an app ID to the blacklist."""
        try:
            blacklist = await self.get_blacklist()
            if app_id not in blacklist:
                blacklist.append(app_id)
            path = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "blacklist.json")
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as f:
                json.dump(blacklist, f)
            return True
        except Exception as e:
            logger.error(f"add_to_blacklist error: {e}")
            return False

    async def remove_from_blacklist(self, app_id: str) -> bool:
        """Remove an app ID from the blacklist."""
        try:
            blacklist = await self.get_blacklist()
            blacklist = [x for x in blacklist if x != app_id]
            path = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "blacklist.json")
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w") as f:
                json.dump(blacklist, f)
            return True
        except Exception as e:
            logger.error(f"remove_from_blacklist error: {e}")
            return False

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

    async def _main(self):
        """Called on plugin load."""
        logger.info("Backlog Picker loaded.")

    async def _unload(self):
        """Called on plugin unload."""
        logger.info("Backlog Picker unloaded.")
