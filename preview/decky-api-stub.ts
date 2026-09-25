/**
 * Stand-in for @decky/api. `callable()` forwards RPC calls to the local
 * preview backend bridge (preview/backend_server.py) over HTTP, so the
 * frontend runs against real Plugin methods (real local Steam data) instead
 * of fake fixtures.
 */
const BACKEND_URL = "http://127.0.0.1:8765/rpc";

export function callable<Args extends any[], Ret>(method: string) {
  return async (...args: Args): Promise<Ret> => {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, args }),
    });
    if (!res.ok) {
      throw new Error(`preview backend error for ${method}: HTTP ${res.status}`);
    }
    const body = await res.json();
    if (body.error) {
      throw new Error(`preview backend error for ${method}: ${body.error}`);
    }
    return body.result as Ret;
  };
}

export const toaster = {
  toast(opts: { title?: string; body?: string; duration?: number }) {
    // eslint-disable-next-line no-console
    console.log(`[toast] ${opts.title ?? ""}: ${opts.body ?? ""}`);
    const el = document.createElement("div");
    el.textContent = `${opts.title ?? ""}: ${opts.body ?? ""}`;
    Object.assign(el.style, {
      position: "fixed",
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#2a2f37",
      color: "#c6d4df",
      padding: "8px 14px",
      borderRadius: "6px",
      fontSize: "12px",
      zIndex: "9999",
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    } as CSSStyleDeclaration);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), opts.duration ?? 2500);
  },
};
