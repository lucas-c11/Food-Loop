import { useState } from "react";
import { Icon } from "./Icon";
export function DonationForm({ busy, onSubmit, onClose }) {
  const [form, setForm] = useState({ name: "", amount: "", ingredients: "" });
  const [formError, setFormError] = useState("");
  async function handleSubmit(event) {
    event.preventDefault(); const amount = Number(form.amount);
    if (!form.name.trim() || !Number.isFinite(amount) || amount <= 0) { setFormError("Add a food name and a quantity greater than zero."); return; }
    setFormError("");
    try { await onSubmit({ foodItem: { name: form.name.trim(), amount, ingredients: form.ingredients.split(",").map((part) => part.trim()).filter(Boolean) } }); setForm({ name: "", amount: "", ingredients: "" }); onClose(); } catch {}
  }
  return <form className="donation-form" onSubmit={handleSubmit}><div className="form-heading"><div><span className="form-kicker">SHARE THE GOOD STUFF</span><h3>Post a food donation</h3></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><Icon name="close" size={18} /></button></div><label>What are you sharing?<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Fresh vegetable soup" /></label><div className="form-row"><label>Portions available<input type="number" min="0.1" step="any" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="12" /></label><label>Ingredients <span className="optional-label">optional</span><input value={form.ingredients} onChange={(event) => setForm({ ...form, ingredients: event.target.value })} placeholder="Carrots, beans…" /></label></div>{formError && <p className="form-error">{formError}</p>}<div className="form-footer"><span><Icon name="clock" size={15} /> Your donation is listed right away</span><button className="button button-primary" disabled={busy}><Icon name="plus" size={17} /> {busy ? "Posting…" : "Post donation"}</button></div></form>;
}
