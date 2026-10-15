import { Icon } from "./Icon";

export function Notice({ tone = "error", children, onDismiss }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="notice-icon"><Icon name={tone === "error" ? "close" : "check"} size={16} /></span>
      <span>{children}</span>
      {onDismiss && <button className="notice-dismiss" onClick={onDismiss} aria-label="Dismiss message"><Icon name="close" size={15} /></button>}
    </div>
  );
}
