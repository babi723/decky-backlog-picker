/**
 * Minimal stand-ins for the @decky/ui components this plugin uses, so the
 * real src/index.tsx can render in a plain browser for local UI/logic
 * preview. Styling approximates the Steam Deck QAM sidebar look — it is NOT
 * pixel-accurate to real Decky UI. For real visuals, deploy to an actual
 * Decky Loader / Steam Deck.
 */
import { FC, ReactNode, CSSProperties } from "react";

export const staticClasses = { Title: "preview-title" };

export const definePlugin = (fn: any) => fn;

// Real @decky/ui's Tabs is pulled from Steam's own webpack module at runtime
// (its actual controller/focus behavior can't be approximated in a browser
// preview at all) — this stub only reproduces the header + content-switch
// logic for layout/logic testing.
export interface StubTab {
  id: string;
  title: string;
  content: ReactNode;
}
export const Tabs: FC<{ tabs: StubTab[]; activeTab: string; onShowTab: (id: string) => void }> = ({
  tabs,
  activeTab,
  onShowTab,
}) => (
  <div>
    <div style={{ display: "flex", gap: "6px", padding: "0 4px 8px 4px" }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onShowTab(t.id)}
          style={{
            flex: 1,
            padding: "10px 4px",
            borderRadius: "6px",
            border: "1px solid #3a4450",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            background: activeTab === t.id ? "#66c0f4" : "#2a2f37",
            color: activeTab === t.id ? "#0e141b" : "#c6d4df",
          }}
        >
          {t.title}
        </button>
      ))}
    </div>
    {tabs.find((t) => t.id === activeTab)?.content}
  </div>
);

export const PanelSection: FC<{ title?: ReactNode; children?: ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: "12px" }}>
    {title && (
      <div style={{ fontSize: "11px", color: "#8b9ba8", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>
        {title}
      </div>
    )}
    <div>{children}</div>
  </div>
);

export const PanelSectionRow: FC<{ children?: ReactNode }> = ({ children }) => (
  <div style={{ marginBottom: "6px" }}>{children}</div>
);

export const ButtonItem: FC<{
  layout?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({ onClick, disabled, style, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: "100%",
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1px solid #3a4450",
      background: disabled ? "#20242b" : "#2a2f37",
      color: disabled ? "#5a6672" : "#c6d4df",
      fontSize: "13px",
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </button>
);

// Real @decky/ui DialogButton is a lower-level focusable button (no
// PanelSectionRow wrapper needed); the stub styling is close enough to
// ButtonItem's for local layout/logic preview purposes.
export const DialogButton = ButtonItem;

export const ToggleField: FC<{
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 2px", cursor: "pointer" }}>
    <div>
      <div style={{ fontSize: "13px", color: "#c6d4df" }}>{label}</div>
      {description && <div style={{ fontSize: "11px", color: "#8b9ba8" }}>{description}</div>}
    </div>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: "18px", height: "18px" }} />
  </label>
);

export const SliderField: FC<{
  label: ReactNode;
  description?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({ label, description, value, min, max, step, onChange }) => (
  <div style={{ padding: "6px 2px" }}>
    <div style={{ fontSize: "13px", color: "#c6d4df" }}>{label}</div>
    {description && <div style={{ fontSize: "11px", color: "#8b9ba8", marginBottom: "4px" }}>{description}</div>}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%" }}
    />
  </div>
);

export interface StubDropdownOption {
  data: any;
  label: ReactNode;
}

export const DropdownItem: FC<{
  label?: ReactNode;
  description?: ReactNode;
  rgOptions: StubDropdownOption[];
  selectedOption: any;
  onChange: (o: StubDropdownOption) => void;
}> = ({ label, description, rgOptions, selectedOption, onChange }) => (
  <div style={{ padding: "6px 2px" }}>
    {label && <div style={{ fontSize: "13px", color: "#c6d4df" }}>{label}</div>}
    {description && <div style={{ fontSize: "11px", color: "#8b9ba8", marginBottom: "4px" }}>{description}</div>}
    <select
      value={JSON.stringify(selectedOption)}
      onChange={(e) => {
        const match = rgOptions.find((o) => JSON.stringify(o.data) === e.target.value);
        if (match) onChange(match);
      }}
      style={{
        width: "100%",
        padding: "8px",
        borderRadius: "6px",
        background: "#2a2f37",
        color: "#c6d4df",
        border: "1px solid #3a4450",
      }}
    >
      {rgOptions.map((o) => (
        <option key={JSON.stringify(o.data)} value={JSON.stringify(o.data)}>
          {String(o.label)}
        </option>
      ))}
    </select>
  </div>
);

export const Focusable: FC<{ children?: ReactNode; style?: CSSProperties; [key: string]: any }> = ({
  children,
  style,
  "flow-children": _flowChildren,
  ...rest
}) => (
  <div style={style} {...rest}>
    {children}
  </div>
);
