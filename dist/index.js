(function (React, ui, api) {
	'use strict';

	var jsxRuntime = {exports: {}};

	var reactJsxRuntime_production_min = {};

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/

	var objectAssign;
	var hasRequiredObjectAssign;

	function requireObjectAssign () {
		if (hasRequiredObjectAssign) return objectAssign;
		hasRequiredObjectAssign = 1;
		/* eslint-disable no-unused-vars */
		var getOwnPropertySymbols = Object.getOwnPropertySymbols;
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var propIsEnumerable = Object.prototype.propertyIsEnumerable;

		function toObject(val) {
			if (val === null || val === undefined) {
				throw new TypeError('Object.assign cannot be called with null or undefined');
			}

			return Object(val);
		}

		function shouldUseNative() {
			try {
				if (!Object.assign) {
					return false;
				}

				// Detect buggy property enumeration order in older V8 versions.

				// https://bugs.chromium.org/p/v8/issues/detail?id=4118
				var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
				test1[5] = 'de';
				if (Object.getOwnPropertyNames(test1)[0] === '5') {
					return false;
				}

				// https://bugs.chromium.org/p/v8/issues/detail?id=3056
				var test2 = {};
				for (var i = 0; i < 10; i++) {
					test2['_' + String.fromCharCode(i)] = i;
				}
				var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
					return test2[n];
				});
				if (order2.join('') !== '0123456789') {
					return false;
				}

				// https://bugs.chromium.org/p/v8/issues/detail?id=3056
				var test3 = {};
				'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
					test3[letter] = letter;
				});
				if (Object.keys(Object.assign({}, test3)).join('') !==
						'abcdefghijklmnopqrst') {
					return false;
				}

				return true;
			} catch (err) {
				// We don't expect any of the above to throw, but better to be safe.
				return false;
			}
		}

		objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
			var from;
			var to = toObject(target);
			var symbols;

			for (var s = 1; s < arguments.length; s++) {
				from = Object(arguments[s]);

				for (var key in from) {
					if (hasOwnProperty.call(from, key)) {
						to[key] = from[key];
					}
				}

				if (getOwnPropertySymbols) {
					symbols = getOwnPropertySymbols(from);
					for (var i = 0; i < symbols.length; i++) {
						if (propIsEnumerable.call(from, symbols[i])) {
							to[symbols[i]] = from[symbols[i]];
						}
					}
				}
			}

			return to;
		};
		return objectAssign;
	}

	/** @license React v17.0.2
	 * react-jsx-runtime.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var hasRequiredReactJsxRuntime_production_min;

	function requireReactJsxRuntime_production_min () {
		if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
		hasRequiredReactJsxRuntime_production_min = 1;
	requireObjectAssign();var f=React,g=60103;reactJsxRuntime_production_min.Fragment=60107;if("function"===typeof Symbol&&Symbol.for){var h=Symbol.for;g=h("react.element");reactJsxRuntime_production_min.Fragment=h("react.fragment");}var m=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,n=Object.prototype.hasOwnProperty,p={key:!0,ref:!0,__self:!0,__source:!0};
		function q(c,a,k){var b,d={},e=null,l=null;void 0!==k&&(e=""+k);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(l=a.ref);for(b in a)n.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:g,type:c,key:e,ref:l,props:d,_owner:m.current}}reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
		return reactJsxRuntime_production_min;
	}

	{
	  jsxRuntime.exports = requireReactJsxRuntime_production_min();
	}

	var jsxRuntimeExports = jsxRuntime.exports;

	var DefaultContext = {
	  color: undefined,
	  size: undefined,
	  className: undefined,
	  style: undefined,
	  attr: undefined
	};
	var IconContext = React.createContext && /*#__PURE__*/React.createContext(DefaultContext);

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
	  return tree && tree.map((node, i) => /*#__PURE__*/React.createElement(node.tag, _objectSpread({
	    key: i
	  }, node.attr), Tree2Element(node.child)));
	}
	function GenIcon(data) {
	  return props => /*#__PURE__*/React.createElement(IconBase, _extends({
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
	    return /*#__PURE__*/React.createElement("svg", _extends({
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
	    }), title && /*#__PURE__*/React.createElement("title", null, title), props.children);
	  };
	  return IconContext !== undefined ? /*#__PURE__*/React.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
	}

	// THIS FILE IS AUTO GENERATED
	function FaSteam (props) {
	  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z"},"child":[]}]})(props);
	}function FaPlay (props) {
	  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"},"child":[]}]})(props);
	}function FaDice (props) {
	  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M592 192H473.26c12.69 29.59 7.12 65.2-17 89.32L320 417.58V464c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48V240c0-26.51-21.49-48-48-48zM480 376c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm-46.37-186.7L258.7 14.37c-19.16-19.16-50.23-19.16-69.39 0L14.37 189.3c-19.16 19.16-19.16 50.23 0 69.39L189.3 433.63c19.16 19.16 50.23 19.16 69.39 0L433.63 258.7c19.16-19.17 19.16-50.24 0-69.4zM96 248c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm0-128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24zm128 128c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z"},"child":[]}]})(props);
	}function FaBan (props) {
	  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z"},"child":[]}]})(props);
	}

	// ─── Backend callables ────────────────────────────────────────────────────────
	const pickRandom = api.callable("pick_random");
	const launchGame = api.callable("launch_game");
	const addToBlacklist = api.callable("add_to_blacklist");
	const removeFromBlacklist = api.callable("remove_from_blacklist");
	const getBlacklist = api.callable("get_blacklist");
	const getLibrary = api.callable("get_library");
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
	// ─── Spin animation component ─────────────────────────────────────────────────
	const SpinningDice = ({ spinning }) => (jsxRuntimeExports.jsxs("div", { style: {
	        display: "inline-block",
	        animation: spinning ? "spin 0.4s linear infinite" : "none",
	    }, children: [jsxRuntimeExports.jsx(FaDice, {}), jsxRuntimeExports.jsx("style", { children: `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    ` })] }));
	// ─── Picked game card ─────────────────────────────────────────────────────────
	const GameCard = ({ game, onReroll, onLaunch, onBlacklist, loading }) => (jsxRuntimeExports.jsxs("div", { style: { marginTop: "8px" }, children: [jsxRuntimeExports.jsx("div", { style: {
	                position: "relative",
	                borderRadius: "8px",
	                overflow: "hidden",
	                marginBottom: "8px",
	                background: "#1a1a2e",
	                minHeight: "120px",
	                display: "flex",
	                alignItems: "center",
	                justifyContent: "center",
	            }, children: jsxRuntimeExports.jsx("img", { src: getHeaderUrl(game.app_id), onError: (e) => {
	                    e.target.style.display = "none";
	                }, style: {
	                    width: "100%",
	                    display: "block",
	                    borderRadius: "8px",
	                }, alt: game.name }) }), jsxRuntimeExports.jsxs("div", { style: { marginBottom: "8px", padding: "0 4px" }, children: [jsxRuntimeExports.jsx("div", { style: {
	                        fontSize: "14px",
	                        fontWeight: "bold",
	                        color: "#c6d4df",
	                        marginBottom: "2px",
	                        overflow: "hidden",
	                        textOverflow: "ellipsis",
	                        whiteSpace: "nowrap",
	                    }, children: game.name }), jsxRuntimeExports.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8" }, children: [formatPlaytime(game.playtime_hours), game.is_installed && (jsxRuntimeExports.jsx("span", { style: {
	                                marginLeft: "8px",
	                                color: "#4caf50",
	                                fontSize: "10px",
	                            }, children: "\u25CF Installed" }))] })] }), jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsxs(ui.ButtonItem, { layout: "below", onClick: onLaunch, style: { flex: 1, marginRight: "4px" }, children: [jsxRuntimeExports.jsx(FaPlay, { style: { marginRight: "6px" } }), "Play Now"] }) }), jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsxs(ui.ButtonItem, { layout: "below", onClick: onReroll, disabled: loading, children: [jsxRuntimeExports.jsx(SpinningDice, { spinning: loading }), jsxRuntimeExports.jsx("span", { style: { marginLeft: "6px" }, children: "Reroll" })] }) }), jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsxs(ui.ButtonItem, { layout: "below", onClick: onBlacklist, style: { color: "#e57373" }, children: [jsxRuntimeExports.jsx(FaBan, { style: { marginRight: "6px" } }), "Never Pick This"] }) })] }));
	// ─── Empty state ──────────────────────────────────────────────────────────────
	const EmptyState = ({ message }) => (jsxRuntimeExports.jsxs("div", { style: {
	        textAlign: "center",
	        padding: "24px 16px",
	        color: "#8b9ba8",
	        fontSize: "12px",
	    }, children: [jsxRuntimeExports.jsx(FaSteam, { style: { fontSize: "32px", marginBottom: "8px", opacity: 0.4 } }), jsxRuntimeExports.jsx("div", { children: message })] }));
	// ─── Main plugin content ──────────────────────────────────────────────────────
	const Content = () => {
	    const [filters, setFilters] = React.useState({
	        installed_only: true,
	        never_played: false,
	        max_playtime_hours: 0,
	        min_playtime_hours: 0,
	        blacklist: [],
	    });
	    const [pickedGame, setPickedGame] = React.useState(null);
	    const [loading, setLoading] = React.useState(false);
	    const [libraryCount, setLibraryCount] = React.useState(null);
	    React.useState(false);
	    // Load blacklist on mount
	    React.useEffect(() => {
	        getBlacklist().then((bl) => {
	            setFilters((f) => ({ ...f, blacklist: bl }));
	        });
	    }, []);
	    // Refresh library count when filters change
	    React.useEffect(() => {
	        let cancelled = false;
	        getLibrary(filters).then((games) => {
	            if (!cancelled)
	                setLibraryCount(games.length);
	        });
	        return () => { cancelled = true; };
	    }, [filters]);
	    const handlePick = React.useCallback(async () => {
	        setLoading(true);
	        try {
	            const game = await pickRandom(filters);
	            if (game) {
	                setPickedGame(game);
	            }
	            else {
	                api.toaster.toast({
	                    title: "Backlog Picker",
	                    body: "No games found matching your filters!",
	                    duration: 3000,
	                });
	            }
	        }
	        catch (e) {
	            api.toaster.toast({
	                title: "Backlog Picker",
	                body: "Something went wrong. Check logs.",
	                duration: 3000,
	            });
	        }
	        setLoading(false);
	    }, [filters]);
	    const handleLaunch = React.useCallback(async () => {
	        if (!pickedGame)
	            return;
	        await launchGame(pickedGame.app_id);
	        api.toaster.toast({
	            title: "Backlog Picker",
	            body: `Launching ${pickedGame.name}...`,
	            duration: 2000,
	        });
	    }, [pickedGame]);
	    const handleBlacklist = React.useCallback(async () => {
	        if (!pickedGame)
	            return;
	        await addToBlacklist(pickedGame.app_id);
	        api.toaster.toast({
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
	    return (jsxRuntimeExports.jsxs("div", { children: [jsxRuntimeExports.jsxs(ui.PanelSection, { children: [jsxRuntimeExports.jsxs("div", { style: {
	                            display: "flex",
	                            alignItems: "center",
	                            gap: "8px",
	                            marginBottom: "4px",
	                        }, children: [jsxRuntimeExports.jsx(FaDice, { style: { fontSize: "20px", color: "#66c0f4" } }), jsxRuntimeExports.jsx("span", { style: { fontSize: "16px", fontWeight: "bold", color: "#c6d4df" }, children: "Backlog Picker" })] }), libraryCount !== null && (jsxRuntimeExports.jsxs("div", { style: { fontSize: "11px", color: "#8b9ba8" }, children: [libraryCount, " game", libraryCount !== 1 ? "s" : "", " in pool"] }))] }), jsxRuntimeExports.jsxs(ui.PanelSection, { children: [jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsxs(ui.ButtonItem, { layout: "below", onClick: handlePick, disabled: loading, children: [jsxRuntimeExports.jsx(SpinningDice, { spinning: loading }), jsxRuntimeExports.jsx("span", { style: { marginLeft: "8px", fontSize: "14px" }, children: loading ? "Picking..." : pickedGame ? "Pick Again" : "Pick For Me!" })] }) }), pickedGame && !loading && (jsxRuntimeExports.jsx(GameCard, { game: pickedGame, onReroll: handlePick, onLaunch: handleLaunch, onBlacklist: handleBlacklist, loading: loading })), !pickedGame && !loading && (jsxRuntimeExports.jsx(EmptyState, { message: "Hit the button and let fate decide what you play next!" }))] }), jsxRuntimeExports.jsxs(ui.PanelSection, { title: "Filters", children: [jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsx(ui.ToggleField, { label: "Installed Games Only", description: "Only pick games you can play right now", checked: filters.installed_only, onChange: (v) => setFilters((f) => ({ ...f, installed_only: v })) }) }), jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsx(ui.ToggleField, { label: "Never Played Only", description: "Only pick games with 0 hours", checked: filters.never_played, onChange: (v) => setFilters((f) => ({
	                                ...f,
	                                never_played: v,
	                                // Reset playtime filters if switching to never played
	                                max_playtime_hours: v ? 0 : f.max_playtime_hours,
	                                min_playtime_hours: v ? 0 : f.min_playtime_hours,
	                            })) }) }), !filters.never_played && (jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsx(ui.SliderField, { label: "Max Playtime", description: filters.max_playtime_hours === 0
	                                        ? "No limit"
	                                        : `Up to ${filters.max_playtime_hours}h played`, value: filters.max_playtime_hours, min: 0, max: 100, step: 5, onChange: (v) => setFilters((f) => ({ ...f, max_playtime_hours: v })) }) }), jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsx(ui.SliderField, { label: "Min Playtime", description: filters.min_playtime_hours === 0
	                                        ? "No minimum"
	                                        : `At least ${filters.min_playtime_hours}h played`, value: filters.min_playtime_hours, min: 0, max: 100, step: 5, onChange: (v) => setFilters((f) => ({ ...f, min_playtime_hours: v })) }) })] }))] }), filters.blacklist.length > 0 && (jsxRuntimeExports.jsx(ui.PanelSection, { title: `Blacklist (${filters.blacklist.length})`, children: jsxRuntimeExports.jsx(ui.PanelSectionRow, { children: jsxRuntimeExports.jsx(ui.ButtonItem, { layout: "below", onClick: async () => {
	                            for (const id of filters.blacklist) {
	                                await removeFromBlacklist(id);
	                            }
	                            setFilters((f) => ({ ...f, blacklist: [] }));
	                            api.toaster.toast({
	                                title: "Backlog Picker",
	                                body: "Blacklist cleared!",
	                                duration: 2000,
	                            });
	                        }, style: { color: "#e57373" }, children: "Clear Blacklist" }) }) }))] }));
	};
	// ─── Plugin entry point ───────────────────────────────────────────────────────
	var index = ui.definePlugin(() => {
	    return {
	        title: jsxRuntimeExports.jsx("div", { className: ui.staticClasses.Title, children: "Backlog Picker" }),
	        content: jsxRuntimeExports.jsx(Content, {}),
	        icon: jsxRuntimeExports.jsx(FaDice, {}),
	        onDismount() { },
	    };
	});

	return index;

})(SP_REACT, DFL, DeckyAPI);
