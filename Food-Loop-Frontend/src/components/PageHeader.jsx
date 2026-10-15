import { Icon } from "./Icon";
export function PageHeader({ mode, title, description, organization, email, onPrimaryAction }) {
  return <header className="page-header"><div className="heading-copy"><div className="eyebrow"><span className="eyebrow-dot" /> {mode === "restaurant" ? "RESTAURANT / STORE WORKSPACE" : "PANTRY WORKSPACE"}</div><h1>{title}</h1><p>{description}</p></div><div className="header-actions"><span className="account-email">{email}</span>{onPrimaryAction && <button className="button button-primary" onClick={onPrimaryAction}><Icon name="plus" size={18} /><span>Add donation</span></button>}</div></header>;
}
