"""Manual local backend smoke test.

Uses the local Steam installation and real account data.
Designed primarily for macOS development.
Does not modify production Steam data.
Uses a temporary plugin settings directory.
Network-dependent integrations such as ProtonDB/HLTB
may fail gracefully.

Run: python3 tests/manual/local_backend_test.py
"""
import sys
import os
import asyncio
import tempfile
import types

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO_ROOT, "backend"))

# ─── Mock the `decky` module (only available inside Decky Loader runtime) ──
settings_dir = tempfile.mkdtemp(prefix="backlog_picker_test_")
decky_mock = types.ModuleType("decky")
decky_mock.DECKY_PLUGIN_SETTINGS_DIR = settings_dir
sys.modules["decky"] = decky_mock

import main  # noqa: E402

# main.get_steam_path() only checks Linux/SteamOS paths. On macOS, point it at
# the real local Steam install so this smoke test exercises real data.
MAC_STEAM_PATH = os.path.expanduser("~/Library/Application Support/Steam")
if sys.platform == "darwin" and os.path.isdir(MAC_STEAM_PATH):
    main.get_steam_path = lambda: MAC_STEAM_PATH


def hltb_summary(entry: dict) -> str:
    if entry.get("hours") is not None:
        return f"{entry['hours']}h (matched: {entry.get('matched_title')})"
    return "unavailable (expected fallback)"


async def run():
    plugin = main.Plugin()
    print(f"[settings dir] {settings_dir}")
    print(f"[steam path]   {main.get_steam_path()}")

    steam_id = main.get_steam_id()
    print(f"\n[steam id] {steam_id}")

    installed = main.get_installed_app_ids()
    print(f"[installed app ids] {sorted(installed)}")

    filters = {
        "installed_only": True,
        "never_played": False,
        "max_playtime_hours": 0,
        "min_playtime_hours": 0,
        "blacklist": [],
        "proton_filter": "any",  # "any" so results aren't hidden by an empty ProtonDB cache
    }
    library = await plugin.get_library(filters)
    print(f"\n[get_library] {len(library)} games")
    for g in library[:5]:
        print(f"  - {g['name']} ({g['app_id']}) {g['playtime_hours']}h installed={g['is_installed']}")

    if len(library) < 1:
        print("\nNo installed games found on this machine — skipping pick/order/network checks.")
        print("(This is not a failure: get_library/pick_random still ran without errors.)")
        return

    pick = await plugin.pick_random(filters)
    print(f"\n[pick_random] {pick['name'] if pick else None}")
    assert pick is not None, "pick_random returned None despite a non-empty library"

    sample = library[0]
    app_id, name = sample["app_id"], sample["name"]

    print(f"\n[protondb] fetching for {name} ({app_id}) ...")
    proton = await plugin.get_protondb_tier(app_id)
    print(f"  -> {proton}")
    assert proton.get("tier") is not None, "ProtonDB response missing 'tier' field"

    print(f"\n[hltb] fetching for {name} ...")
    hltb = await plugin.get_hltb_estimate(app_id, name)
    print(f"  -> HLTB: {hltb_summary(hltb)}")
    assert "hours" in hltb, "HLTB response malformed (missing 'hours' key even on fallback)"

    print(f"\n[add_to_order] {name}")
    added = await plugin.add_to_order(app_id)
    assert added is True, "add_to_order should succeed for a game not already in the order"
    dup = await plugin.add_to_order(app_id)
    assert dup is False, "add_to_order should refuse a duplicate app_id"
    print(f"  -> added={added}, duplicate rejected={not dup}")

    second = library[1] if len(library) > 1 else None
    if second:
        added2 = await plugin.add_to_order(second["app_id"])
        print(f"[add_to_order] {second['name']} -> added={added2}")

    order = await plugin.get_order()
    print(f"\n[get_order] {len(order)} items")
    for item in order:
        print(f"  {item['position']}: {item['name']} status={item['status']} "
              f"remaining={item.get('remaining_hours')} reached={item.get('reached_estimate')}")
    assert order[0]["status"] == "playing", "first item added to an empty order should start as 'playing'"

    if len(order) > 1:
        moved = await plugin.move_order_item(order[1]["app_id"], "up")
        print(f"\n[move_order_item up] {order[1]['name']} -> {moved}")
        assert moved is True, "move_order_item should succeed for a valid swap"

    completed = await plugin.set_order_status(app_id, "completed")
    print(f"[set_order_status completed] {name} -> {completed}")
    assert completed is True

    order_after = await plugin.get_order()
    print("[get_order after complete]")
    for item in order_after:
        print(f"  {item['position']}: {item['name']} status={item['status']}")
    completed_entry = next(i for i in order_after if i["app_id"] == app_id)
    assert completed_entry["status"] == "completed", "completed item should stay marked completed"
    if len(order_after) > 1:
        auto_advanced = [i for i in order_after if i["app_id"] != app_id]
        assert any(i["status"] == "playing" for i in auto_advanced), (
            "completing the active game should auto-advance the next queued item to 'playing'"
        )

    next_app_id = order_after[0]["app_id"]
    deadline_set = await plugin.set_order_deadline(next_app_id, "2026-10-01")
    print(f"\n[set_order_deadline] -> {deadline_set}")
    assert deadline_set is True

    order_final = await plugin.get_order()
    final_entry = next(i for i in order_final if i["app_id"] == next_app_id)
    print(f"[get_order deadline] {final_entry['name']} deadline={final_entry.get('deadline')}")
    assert final_entry.get("deadline") == "2026-10-01"

    print("\n[settings files written]")
    for fname in os.listdir(settings_dir):
        print(f"  - {fname}")

    print("\nAll checks passed.")


if __name__ == "__main__":
    asyncio.run(run())
