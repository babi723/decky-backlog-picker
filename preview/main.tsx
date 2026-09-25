import ReactDOM from "react-dom";
import definePlugin from "../src/index";

const shell = document.getElementById("sidebar-shell")!;

// src/index.tsx exports only `default` (definePlugin(...)), unmodified from
// production. The decky-ui-stub's definePlugin() is the identity function,
// so the default export here is still the raw callback — call it ourselves
// to get the plugin descriptor and render its `content` node directly.
const descriptor = (definePlugin as any)();

// This project pins react/react-dom to ^17 (Decky's runtime version), so we
// use the legacy render API rather than React 18's createRoot.
ReactDOM.render(descriptor.content, document.getElementById("root"));

// Cosmetic reminder that this is an approximation, not real Decky UI chrome.
shell.title = "Approximate Steam Deck QAM sidebar width — not pixel-accurate to real Decky UI";
