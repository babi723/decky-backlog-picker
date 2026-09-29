"""Local preview backend bridge.

Exposes main.py's Plugin methods over a tiny local HTTP JSON-RPC endpoint so
the browser UI preview (preview/main.tsx via Vite) can drive the real
backend logic against this machine's real local Steam data.

Not part of the shipped plugin. Development tool only.

Run: python3 preview/backend_server.py
Then: pnpm run preview   (in another terminal)
"""
import sys
import os
import json
import asyncio
import tempfile
import types
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO_ROOT)

PORT = 8765

# ─── Mock the `decky` module (only available inside Decky Loader runtime) ──
settings_dir = tempfile.mkdtemp(prefix="backlog_picker_preview_")
decky_mock = types.ModuleType("decky")
decky_mock.DECKY_PLUGIN_SETTINGS_DIR = settings_dir
sys.modules["decky"] = decky_mock

import main  # noqa: E402

# main.get_steam_path() only checks Linux/SteamOS paths. On macOS, point it at
# the real local Steam install so the preview reflects real local data.
MAC_STEAM_PATH = os.path.expanduser("~/Library/Application Support/Steam")
if sys.platform == "darwin" and os.path.isdir(MAC_STEAM_PATH):
    main.get_steam_path = lambda: MAC_STEAM_PATH

plugin = main.Plugin()


class RpcHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(200, {})

    def do_POST(self):
        if self.path != "/rpc":
            self._send_json(404, {"error": "not found"})
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            request = json.loads(self.rfile.read(length))
            method_name = request["method"]
            args = request.get("args", [])
        except Exception as e:
            self._send_json(400, {"error": f"bad request: {e}"})
            return

        method = getattr(plugin, method_name, None)
        if method is None:
            self._send_json(404, {"error": f"unknown method: {method_name}"})
            return

        try:
            result = asyncio.run(method(*args))
            self._send_json(200, {"result": result})
        except Exception as e:
            print(f"[preview backend] {method_name}{tuple(args)} failed: {e}")
            self._send_json(500, {"error": str(e)})

    def log_message(self, fmt, *fmt_args):
        print(f"[preview backend] {fmt % fmt_args}")


def main_entry():
    print(f"[preview backend] settings dir: {settings_dir}")
    print(f"[preview backend] steam path:   {main.get_steam_path()}")
    print(f"[preview backend] listening on http://127.0.0.1:{PORT}/rpc")
    server = ThreadingHTTPServer(("127.0.0.1", PORT), RpcHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main_entry()
