const manifest = {"name":"Backlog Picker","version":"1.1.3","author":"babi723","flags":[],"license":"MIT","api_version":1};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const toaster = api.toaster;

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaSteam (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z"},"child":[]}]})(props);
}function FaSortAmountDown (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M304 416h-64a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-128-64h-48V48a16 16 0 0 0-16-16H80a16 16 0 0 0-16 16v304H16c-14.19 0-21.37 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96C197.35 369.26 190.22 352 176 352zm256-192H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm-64 128H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zM496 32H240a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h256a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"},"child":[]}]})(props);
}function FaPlay (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
}function FaListUl (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M48 48a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm0 160a48 48 0 1 0 48 48 48 48 0 0 0-48-48zm448 16H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16zm0-320H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm0 160H176a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h320a16 16 0 0 0 16-16v-32a16 16 0 0 0-16-16z"},"child":[]}]})(props);
}function FaDice (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M592 192H473.26c12.69 29.59 7.12 65.2-17 89.32L320 417.58V464c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48V240c0-26.51-21.49-48-48-48zM480 376c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm-46.37-186.7L258.7 14.37c-19.16-19.16-50.23-19.16-69.39 0L14.37 189.3c-19.16 19.16-19.16 50.23 0 69.39L189.3 433.63c19.16 19.16 50.23 19.16 69.39 0L433.63 258.7c19.16-19.17 19.16-50.24 0-69.4zM96 248c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"},"child":[]}]})(props);
}function FaClock (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"},"child":[]}]})(props);
}function FaCheck (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"},"child":[]}]})(props);
}function FaBan (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z"},"child":[]}]})(props);
}function FaArrowUp (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z"},"child":[]}]})(props);
}function FaArrowDown (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z"},"child":[]}]})(props);
}

// ─── Backend callables ────────────────────────────────────────────────────────
const pickRandom = callable("pick_random");
const launchGame = callable("launch_game");
const addToBlacklist = callable("add_to_blacklist");
const removeFromBlacklist = callable("remove_from_blacklist");
const getBlacklist = callable("get_blacklist");
const getLibrary = callable("get_library");
const getCollections = callable("get_collections");
const refreshMetadata = callable("refresh_metadata");
const refreshHltb = callable("refresh_hltb");
const getOrder = callable("get_order");
const addToOrder = callable("add_to_order");
callable("remove_from_order");
const moveOrderItem = callable("move_order_item");
const setOrderStatus = callable("set_order_status");
const setOrderDeadline = callable("set_order_deadline");
// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPlaytime(hours) {
    if (hours === 0)
        return "Never played";
    if (hours < 1)
        return `${Math.round(hours * 60)}m played`;
    return `${hours.toFixed(1)}h played`;
}
function getHeaderUrl(app_id) {
    return `https://cdn.akamai.steamstatic.com/steam/apps/${app_id}/header.jpg`;
}
function getCapsuleUrl(app_id) {
    return `https://cdn.akamai.steamstatic.com/steam/apps/${app_id}/capsule_184x69.jpg`;
}
const PROTON_TIER_RANK = {
    Platinum: 0,
    Gold: 1,
    Silver: 2,
    Bronze: 3,
    Native: 4,
    Pending: 5,
    Borked: 6,
};
function protonTierRank(tier) {
    if (!tier)
        return 99; // Unknown sorts last
    return PROTON_TIER_RANK[tier] ?? 98;
}
const PROTON_TIER_COLORS = {
    Platinum: "#b0c4de",
    Gold: "#ffd700",
    Silver: "#c0c0c0",
    Bronze: "#cd7f32",
    Borked: "#e57373",
    Pending: "#8b9ba8",
    Native: "#4caf50",
};
const ProtonBadge = ({ tier }) => {
    const label = tier || "Unknown";
    const color = tier ? PROTON_TIER_COLORS[tier] || "#8b9ba8" : "#8b9ba8";
    return (SP_JSX.jsx("span", { style: {
            fontSize: "10px",
            color,
            border: `1px solid ${color}`,
            borderRadius: "4px",
            padding: "1px 5px",
            marginLeft: "6px",
        }, children: label }));
};
function formatDeadline(deadline) {
    if (!deadline)
        return null;
    const due = new Date(deadline);
    if (isNaN(due.getTime()))
        return null;
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / msPerDay);
    if (daysLeft < 0)
        return { text: "Overdue", overdue: true };
    if (daysLeft === 0)
        return { text: "Due today", overdue: false };
    if (daysLeft === 1)
        return { text: "Due tomorrow", overdue: false };
    return { text: `${daysLeft} days left`, overdue: false };
}
function formatRemaining(item) {
    if (item.reached_estimate)
        return "Main story estimate reached";
    if (item.remaining_hours != null)
        return `~${item.remaining_hours}h remaining`;
    return "HLTB: Unknown";
}
function isoDateInDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
function endOfMonthIso() {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return d.toISOString().slice(0, 10);
}
// ─── Spin animation component ─────────────────────────────────────────────────
const SpinningDice = ({ spinning }) => (SP_JSX.jsxs("div", { style: {
        display: "inline-block",
        animation: spinning ? "spin 0.4s linear infinite" : "none",
    }, children: [SP_JSX.jsx(FaDice, {}), SP_JSX.jsx("style", { children: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    ` })] }));
const TabNav = ({ active, onChange }) => {
    const tabs = [
        { id: "pick", label: "Pick", icon: SP_JSX.jsx(FaDice, {}) },
        { id: "library", label: "Library", icon: SP_JSX.jsx(FaListUl, {}) },
        { id: "order", label: "Order", icon: SP_JSX.jsx(FaSortAmountDown, {}) },
    ];
    return (SP_JSX.jsx(DFL.Focusable, { style: {
            display: "flex",
            gap: "6px",
            padding: "0 4px 8px 4px",
        }, "flow-children": "horizontal", children: tabs.map((t) => (SP_JSX.jsxs(DFL.DialogButton, { onClick: () => onChange(t.id), style: {
                flex: 1,
                textAlign: "center",
                padding: "10px 4px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                background: active === t.id ? "#66c0f4" : "#2a2f37",
                color: active === t.id ? "#0e141b" : "#c6d4df",
            }, children: [SP_JSX.jsx("div", { style: { fontSize: "14px", marginBottom: "2px" }, children: t.icon }), t.label] }, t.id))) }));
};
// ─── Picked game card ─────────────────────────────────────────────────────────
const GameCard = ({ game, onReroll, onLaunch, onBlacklist, onAddToOrder, loading }) => (SP_JSX.jsxs("div", { style: { marginTop: "8px" }, children: [SP_JSX.jsx("div", { style: {
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "8px",
                background: "#1a1a2e",
                minHeight: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }, children: SP_JSX.jsx("img", { src: getHeaderUrl(game.app_id), onError: (e) => {
                    e.target.style.display = "none";
                }, style: {
                    width: "100%",
                    display: "block",
                    borderRadius: "8px",
                }, alt: game.name }) }), SP_JSX.jsxs("div", { style: { marginBottom: "8px", padding: "0 4px" }, children: [SP_JSX.jsx("div", { style: {
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#c6d4df",
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }, children: game.name }), SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8", display: "flex", alignItems: "center" }, children: [formatPlaytime(game.playtime_hours), game.is_installed && (SP_JSX.jsx("span", { style: {
                                marginLeft: "8px",
                                color: "#4caf50",
                                fontSize: "10px",
                            }, children: "\u25CF Installed" })), SP_JSX.jsx(ProtonBadge, { tier: game.proton_tier })] })] }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: onLaunch, style: { flex: 1, marginRight: "4px" }, children: [SP_JSX.jsx("span", { style: { marginRight: "6px" }, children: SP_JSX.jsx(FaPlay, {}) }), "Play Now"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: onReroll, disabled: loading, children: [SP_JSX.jsx(SpinningDice, { spinning: loading }), SP_JSX.jsx("span", { style: { marginLeft: "6px" }, children: "Reroll" })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: onAddToOrder, children: [SP_JSX.jsx("span", { style: { marginRight: "6px" }, children: SP_JSX.jsx(FaSortAmountDown, {}) }), game.order_position != null ? `In Order #${game.order_position + 1}` : "Add to Order"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: onBlacklist, style: { color: "#e57373" }, children: [SP_JSX.jsx("span", { style: { marginRight: "6px" }, children: SP_JSX.jsx(FaBan, {}) }), "Never Pick This"] }) })] }));
// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (SP_JSX.jsxs("div", { style: {
        textAlign: "center",
        padding: "24px 16px",
        color: "#8b9ba8",
        fontSize: "12px",
    }, children: [SP_JSX.jsx("span", { style: { fontSize: "32px", marginBottom: "8px", opacity: 0.4, display: "block" }, children: SP_JSX.jsx(FaSteam, {}) }), SP_JSX.jsx("div", { children: message })] }));
// ─── Pick tab ───────────────────────────────────────────────────────────────
const PROTON_FILTER_OPTIONS = [
    { data: "any", label: "Any" },
    { data: "gold_plus", label: "Gold+" },
    { data: "platinum_only", label: "Platinum Only" },
];
const PickTab = () => {
    const [filters, setFilters] = SP_REACT.useState({
        installed_only: true,
        never_played: false,
        max_playtime_hours: 0,
        min_playtime_hours: 0,
        blacklist: [],
        proton_filter: "gold_plus",
        collection_id: null,
    });
    const [pickedGame, setPickedGame] = SP_REACT.useState(null);
    const [loading, setLoading] = SP_REACT.useState(false);
    const [libraryCount, setLibraryCount] = SP_REACT.useState(null);
    const [collections, setCollections] = SP_REACT.useState([]);
    // Load blacklist + collections on mount
    SP_REACT.useEffect(() => {
        getBlacklist().then((bl) => {
            setFilters((f) => ({ ...f, blacklist: bl }));
        });
        getCollections().then(setCollections);
    }, []);
    // Refresh library count when filters change
    SP_REACT.useEffect(() => {
        let cancelled = false;
        getLibrary(filters).then((games) => {
            if (!cancelled)
                setLibraryCount(games.length);
        });
        return () => { cancelled = true; };
    }, [filters]);
    const handlePick = SP_REACT.useCallback(async () => {
        setLoading(true);
        try {
            const game = await pickRandom(filters);
            if (game) {
                setPickedGame(game);
            }
            else {
                toaster.toast({
                    title: "Backlog Picker",
                    body: "No games found matching your filters!",
                    duration: 3000,
                });
            }
        }
        catch (e) {
            toaster.toast({
                title: "Backlog Picker",
                body: "Something went wrong. Check logs.",
                duration: 3000,
            });
        }
        setLoading(false);
    }, [filters]);
    const handleLaunch = SP_REACT.useCallback(async () => {
        if (!pickedGame)
            return;
        await launchGame(pickedGame.app_id);
        toaster.toast({
            title: "Backlog Picker",
            body: `Launching ${pickedGame.name}...`,
            duration: 2000,
        });
    }, [pickedGame]);
    const handleBlacklist = SP_REACT.useCallback(async () => {
        if (!pickedGame)
            return;
        await addToBlacklist(pickedGame.app_id);
        toaster.toast({
            title: "Backlog Picker",
            body: `"${pickedGame.name}" will never be picked again.`,
            duration: 3000,
        });
        setFilters((f) => ({
            ...f,
            blacklist: [...f.blacklist, pickedGame.app_id],
        }));
        setPickedGame(null);
        // Auto-pick a new one
        handlePick();
    }, [pickedGame, handlePick]);
    const handleAddToOrder = SP_REACT.useCallback(async () => {
        if (!pickedGame)
            return;
        const added = await addToOrder(pickedGame.app_id);
        toaster.toast({
            title: "Backlog Picker",
            body: added ? `"${pickedGame.name}" added to your order.` : `Already in your order.`,
            duration: 2500,
        });
        if (added) {
            const games = await getLibrary(filters);
            const updated = games.find((g) => g.app_id === pickedGame.app_id);
            if (updated)
                setPickedGame(updated);
        }
    }, [pickedGame, filters]);
    return (SP_JSX.jsxs("div", { children: [SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsxs("div", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "4px",
                        }, children: [SP_JSX.jsx("span", { style: { fontSize: "20px", color: "#66c0f4" }, children: SP_JSX.jsx(FaDice, {}) }), SP_JSX.jsx("span", { style: { fontSize: "16px", fontWeight: "bold", color: "#c6d4df" }, children: "Backlog Picker" })] }), libraryCount !== null && (SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8" }, children: [libraryCount, " game", libraryCount !== 1 ? "s" : "", " in pool"] }))] }), SP_JSX.jsxs(DFL.PanelSection, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: handlePick, disabled: loading, children: [SP_JSX.jsx(SpinningDice, { spinning: loading }), SP_JSX.jsx("span", { style: { marginLeft: "8px", fontSize: "14px" }, children: loading ? "Picking..." : pickedGame ? "Pick Again" : "Pick For Me!" })] }) }), pickedGame && !loading && (SP_JSX.jsx(GameCard, { game: pickedGame, onReroll: handlePick, onLaunch: handleLaunch, onBlacklist: handleBlacklist, onAddToOrder: handleAddToOrder, loading: loading })), !pickedGame && !loading && (SP_JSX.jsx(EmptyState, { message: "Hit the button and let fate decide what you play next!" }))] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Filters", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Installed Games Only", description: "Only pick games you can play right now", checked: filters.installed_only, onChange: (v) => setFilters((f) => ({ ...f, installed_only: v })) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Never Played Only", description: "Only pick games with 0 hours", checked: filters.never_played, onChange: (v) => setFilters((f) => ({
                                ...f,
                                never_played: v,
                                // Reset playtime filters if switching to never played
                                max_playtime_hours: v ? 0 : f.max_playtime_hours,
                                min_playtime_hours: v ? 0 : f.min_playtime_hours,
                            })) }) }), !filters.never_played && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Max Playtime", description: filters.max_playtime_hours === 0
                                        ? "No limit"
                                        : `Up to ${filters.max_playtime_hours}h played`, value: filters.max_playtime_hours, min: 0, max: 100, step: 1, onChange: (v) => setFilters((f) => ({ ...f, max_playtime_hours: v })) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Min Playtime", description: filters.min_playtime_hours === 0
                                        ? "No minimum"
                                        : `At least ${filters.min_playtime_hours}h played`, value: filters.min_playtime_hours, min: 0, max: 100, step: 1, onChange: (v) => setFilters((f) => ({ ...f, min_playtime_hours: v })) }) })] })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "ProtonDB Filter", description: "Only pick games that run well on Deck", rgOptions: PROTON_FILTER_OPTIONS.map((o) => ({ data: o.data, label: o.label })), selectedOption: filters.proton_filter, onChange: (o) => setFilters((f) => ({ ...f, proton_filter: o.data })) }) }), collections.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Collection", description: "Only pick from one of your Steam collections", rgOptions: [
                                { data: null, label: "All Collections" },
                                ...collections.map((c) => ({ data: c.id, label: `${c.name} (${c.count})` })),
                            ], selectedOption: filters.collection_id ?? null, onChange: (o) => setFilters((f) => ({ ...f, collection_id: o.data })) }) }))] }), filters.blacklist.length > 0 && (SP_JSX.jsx(DFL.PanelSection, { title: `Blacklist (${filters.blacklist.length})`, children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: async () => {
                            for (const id of filters.blacklist) {
                                await removeFromBlacklist(id);
                            }
                            setFilters((f) => ({ ...f, blacklist: [] }));
                            toaster.toast({
                                title: "Backlog Picker",
                                body: "Blacklist cleared!",
                                duration: 2000,
                            });
                        }, style: { color: "#e57373" }, children: "Clear Blacklist" }) }) }))] }));
};
// ─── Library tab ────────────────────────────────────────────────────────────
const LIBRARY_BASE_FILTERS = {
    never_played: false,
    max_playtime_hours: 0,
    min_playtime_hours: 0,
    blacklist: [],
    proton_filter: "any",
};
const LibraryTab = () => {
    const [installedOnly, setInstalledOnly] = SP_REACT.useState(true);
    const [collectionId, setCollectionId] = SP_REACT.useState(null);
    const [collections, setCollections] = SP_REACT.useState([]);
    const [games, setGames] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    SP_REACT.useEffect(() => {
        getCollections().then(setCollections);
    }, []);
    const load = SP_REACT.useCallback(async () => {
        setLoading(true);
        const bl = await getBlacklist();
        const filters = {
            ...LIBRARY_BASE_FILTERS,
            installed_only: installedOnly,
            collection_id: collectionId,
            blacklist: bl,
        };
        const list = await getLibrary(filters);
        setGames(list);
        setLoading(false);
        // Warm the ProtonDB + HLTB caches for what's visible, then refresh once done.
        Promise.all([
            refreshMetadata(list.map((g) => g.app_id)),
            refreshHltb(list.map((g) => ({ app_id: g.app_id, name: g.name }))),
        ]).then(async () => {
            const refreshed = await getLibrary(filters);
            setGames(refreshed);
        });
    }, [installedOnly, collectionId]);
    SP_REACT.useEffect(() => {
        load();
    }, [load]);
    // In the "All" scope the list is large and unsorted (raw Steam order), so
    // rank by ProtonDB compatibility to surface the games worth playing on Deck.
    // The small "Installed" list keeps its natural order.
    const displayedGames = SP_REACT.useMemo(() => {
        if (installedOnly)
            return games;
        return [...games].sort((a, b) => protonTierRank(a.proton_tier) - protonTierRank(b.proton_tier));
    }, [games, installedOnly]);
    const handleAddToOrder = SP_REACT.useCallback(async (game) => {
        const added = await addToOrder(game.app_id);
        toaster.toast({
            title: "Backlog Picker",
            body: added ? `"${game.name}" added to your order.` : "Already in your order.",
            duration: 2500,
        });
        if (added)
            load();
    }, [load]);
    const scopeToggle = (SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", gap: "6px", padding: "0 4px 8px 4px" }, "flow-children": "horizontal", children: [SP_JSX.jsx("div", { style: { flex: 1 }, children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setInstalledOnly(true), style: {
                        background: installedOnly ? "#66c0f4" : "#2a2f37",
                        color: installedOnly ? "#0e141b" : "#c6d4df",
                    }, children: "Installed" }) }), SP_JSX.jsx("div", { style: { flex: 1 }, children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => setInstalledOnly(false), style: {
                        background: !installedOnly ? "#66c0f4" : "#2a2f37",
                        color: !installedOnly ? "#0e141b" : "#c6d4df",
                    }, children: "All" }) })] }));
    const collectionFilter = collections.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Collection", rgOptions: [
                { data: null, label: "All Collections" },
                ...collections.map((c) => ({ data: c.id, label: `${c.name} (${c.count})` })),
            ], selectedOption: collectionId, onChange: (o) => setCollectionId(o.data) }) }));
    const header = (SP_JSX.jsxs(SP_JSX.Fragment, { children: [scopeToggle, collectionFilter] }));
    if (loading && games.length === 0) {
        return (SP_JSX.jsxs("div", { children: [header, SP_JSX.jsx(EmptyState, { message: "Loading your library..." })] }));
    }
    if (games.length === 0) {
        return (SP_JSX.jsxs("div", { children: [header, SP_JSX.jsx(EmptyState, { message: installedOnly ? "No installed games found." : "No games found." })] }));
    }
    return (SP_JSX.jsxs("div", { children: [header, SP_JSX.jsx(DFL.PanelSection, { title: `Library (${games.length})`, children: displayedGames.map((game) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { width: "100%", padding: "4px 0" }, children: [SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "6px" }, children: [SP_JSX.jsx("img", { src: getCapsuleUrl(game.app_id), onError: (e) => {
                                            e.target.style.display = "none";
                                        }, style: {
                                            width: "64px",
                                            height: "24px",
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                            flexShrink: 0,
                                            background: "#1a1a2e",
                                        }, alt: "" }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center" }, children: [SP_JSX.jsx("span", { style: {
                                                            fontSize: "13px",
                                                            fontWeight: "bold",
                                                            color: "#c6d4df",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            flex: 1,
                                                        }, children: game.name }), SP_JSX.jsx(ProtonBadge, { tier: game.proton_tier })] }), SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8" }, children: [formatPlaytime(game.playtime_hours), SP_JSX.jsx("span", { style: { marginLeft: "8px" }, children: game.hltb_main_story_hours != null
                                                            ? `HLTB: ${game.hltb_main_story_hours}h`
                                                            : "HLTB: Unknown" })] })] })] }), SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => handleAddToOrder(game), children: game.order_position != null ? `In Order #${game.order_position + 1}` : "Add to Order" })] }) }, game.app_id))) })] }));
};
// ─── Order tab ──────────────────────────────────────────────────────────────
const DEADLINE_OPTIONS = [
    { label: "1 Week", value: isoDateInDays(7) },
    { label: "2 Weeks", value: isoDateInDays(14) },
    { label: "This Month", value: endOfMonthIso() },
    { label: "No Deadline", value: null },
];
const STATUS_LABEL = {
    playing: "Playing",
    queued: "Queued",
    completed: "Completed",
};
const OrderRow = ({ item, index, isFirst, isLast, onMove, onLaunch, onComplete, onSetDeadline }) => {
    const deadlineInfo = formatDeadline(item.deadline);
    const primary = item.status === "playing";
    return (SP_JSX.jsxs("div", { style: {
            padding: "8px 4px",
            marginBottom: "6px",
            borderRadius: "6px",
            background: primary ? "#1e2b38" : "transparent",
            borderLeft: primary ? "3px solid #66c0f4" : "3px solid transparent",
        }, children: [SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "4px" }, children: [SP_JSX.jsx("img", { src: getCapsuleUrl(item.app_id), onError: (e) => {
                            e.target.style.display = "none";
                        }, style: {
                            width: "64px",
                            height: "24px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            flexShrink: 0,
                            background: "#1a1a2e",
                        }, alt: "" }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center" }, children: [SP_JSX.jsxs("span", { style: {
                                            fontSize: primary ? "14px" : "12px",
                                            fontWeight: "bold",
                                            color: "#c6d4df",
                                            flex: 1,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }, children: [index + 1, ". ", item.name] }), SP_JSX.jsx(ProtonBadge, { tier: item.proton_tier })] }), SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8" }, children: [STATUS_LABEL[item.status], " \u00B7 ", formatPlaytime(item.playtime_hours), item.status !== "completed" && SP_JSX.jsxs("span", { children: [" \u00B7 ", formatRemaining(item)] }), deadlineInfo && (SP_JSX.jsxs("span", { style: { marginLeft: "8px", color: deadlineInfo.overdue ? "#e57373" : "#8b9ba8" }, children: [SP_JSX.jsx("span", { style: { marginRight: "3px" }, children: SP_JSX.jsx(FaClock, {}) }), deadlineInfo.text] }))] })] })] }), item.status !== "completed" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: onLaunch, children: [SP_JSX.jsx("span", { style: { marginRight: "6px" }, children: SP_JSX.jsx(FaPlay, {}) }), "Launch"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", onClick: onComplete, children: [SP_JSX.jsx("span", { style: { marginRight: "6px" }, children: SP_JSX.jsx(FaCheck, {}) }), "Mark Completed"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Deadline", rgOptions: DEADLINE_OPTIONS.map((o) => ({ data: o.value, label: o.label })), selectedOption: item.deadline ?? null, onChange: (o) => onSetDeadline(o.data) }) })] })), SP_JSX.jsxs(DFL.Focusable, { style: { display: "flex", gap: "6px" }, "flow-children": "horizontal", children: [SP_JSX.jsx("div", { style: { flex: 1 }, children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => onMove("up"), disabled: isFirst, children: SP_JSX.jsx(FaArrowUp, {}) }) }), SP_JSX.jsx("div", { style: { flex: 1 }, children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => onMove("down"), disabled: isLast, children: SP_JSX.jsx(FaArrowDown, {}) }) })] })] }));
};
const OrderTab = () => {
    const [order, setOrder] = SP_REACT.useState([]);
    const [loading, setLoading] = SP_REACT.useState(true);
    const load = SP_REACT.useCallback(async () => {
        const list = await getOrder();
        setOrder(list);
        setLoading(false);
        // Warm the HLTB cache for what's in the order, then refresh once done.
        const unknown = list.filter((i) => i.hltb_main_story_hours == null);
        if (unknown.length > 0) {
            refreshHltb(unknown.map((i) => ({ app_id: i.app_id, name: i.name }))).then(async () => {
                setOrder(await getOrder());
            });
        }
    }, []);
    SP_REACT.useEffect(() => {
        load();
    }, [load]);
    const handleMove = SP_REACT.useCallback(async (app_id, dir) => {
        await moveOrderItem(app_id, dir);
        load();
    }, [load]);
    const handleLaunch = SP_REACT.useCallback(async (item) => {
        await launchGame(item.app_id);
        toaster.toast({ title: "Backlog Picker", body: `Launching ${item.name}...`, duration: 2000 });
    }, []);
    const handleComplete = SP_REACT.useCallback(async (item) => {
        await setOrderStatus(item.app_id, "completed");
        toaster.toast({ title: "Backlog Picker", body: `"${item.name}" marked completed!`, duration: 2500 });
        load();
    }, [load]);
    const handleDeadline = SP_REACT.useCallback(async (app_id, deadline) => {
        await setOrderDeadline(app_id, deadline);
        load();
    }, [load]);
    if (loading) {
        return SP_JSX.jsx(EmptyState, { message: "Loading your order..." });
    }
    if (order.length === 0) {
        return SP_JSX.jsx(EmptyState, { message: "Your backlog order is empty. Add games from the Library tab." });
    }
    const activeItems = order.filter((i) => i.status !== "completed");
    const totalRemaining = activeItems.length;
    const knownRemaining = activeItems.filter((i) => i.remaining_hours != null);
    const totalHours = knownRemaining.reduce((sum, i) => sum + (i.remaining_hours || 0), 0);
    return (SP_JSX.jsxs(DFL.PanelSection, { title: "My Order", children: [order.map((item, idx) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(OrderRow, { item: item, index: idx, isFirst: idx === 0, isLast: idx === order.length - 1, onMove: (dir) => handleMove(item.app_id, dir), onLaunch: () => handleLaunch(item), onComplete: () => handleComplete(item), onSetDeadline: (d) => handleDeadline(item.app_id, d) }) }, item.app_id))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8", textAlign: "center", padding: "4px" }, children: [totalRemaining, " game", totalRemaining !== 1 ? "s" : "", " remaining", knownRemaining.length > 0 && SP_JSX.jsxs(SP_JSX.Fragment, { children: [" \u00B7 ~", totalHours.toFixed(0), " hours remaining"] })] }) })] }));
};
// ─── Main plugin content ──────────────────────────────────────────────────────
const Content = () => {
    const [activeTab, setActiveTab] = SP_REACT.useState("pick");
    return (SP_JSX.jsxs("div", { children: [SP_JSX.jsx(TabNav, { active: activeTab, onChange: setActiveTab }), activeTab === "pick" && SP_JSX.jsx(PickTab, {}), activeTab === "library" && SP_JSX.jsx(LibraryTab, {}), activeTab === "order" && SP_JSX.jsx(OrderTab, {})] }));
};
// ─── Plugin entry point ───────────────────────────────────────────────────────
var index = DFL.definePlugin(() => {
    return {
        title: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Backlog Picker" }),
        content: SP_JSX.jsx(Content, {}),
        icon: SP_JSX.jsx(FaDice, {}),
        onDismount() { },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
