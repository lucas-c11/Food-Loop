import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Icon } from "./Icon";

export function AuthPage() {
  const { login, register, error: sessionError } = useAuth();
  const [creating, setCreating] = useState(false);
  const [role, setRole] = useState("restaurant");
  const [form, setForm] = useState({ name: "", email: "", password: "", line1: "", city: "", state: "", postalCode: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isPantry = role === "pantry";
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (creating) await register({ role, name: form.name.trim(), email: form.email.trim(), password: form.password, address: { line1: form.line1.trim(), city: form.city.trim(), state: form.state.trim(), postalCode: form.postalCode.trim() } });
      else await login({ email: form.email.trim(), password: form.password });
    } catch (cause) { setError(cause.message); } finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand"><span className="brand-mark"><Icon name="leaf" size={22} /></span><span>food<span className="brand-accent">loop</span></span></div>
    <span className="form-kicker">GOOD FOOD, GOING FURTHER</span>
    <h1>{creating ? "Join your local food loop." : "Welcome back."}</h1>
    <p className="auth-intro">{creating ? "Create an account for your restaurant, store, or community pantry." : "Sign in to manage your FoodLoop workspace."}</p>
    {creating && <div className="role-switch" role="group" aria-label="Organization type"><button type="button" className={!isPantry ? "active" : ""} onClick={() => setRole("restaurant")}><Icon name="store" size={16} /> Restaurant / Store</button><button type="button" className={isPantry ? "active" : ""} onClick={() => setRole("pantry")}><Icon name="heart" size={16} /> Pantry</button></div>}
    <form className="auth-form" onSubmit={submit}>
      {creating && <><label>{isPantry ? "Pantry name" : "Restaurant or store name"}<input required autoComplete="organization" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isPantry ? "Verona Neighborhood Pantry" : "Harvest Table"} /></label><label>Street address<input required autoComplete="street-address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></label><div className="form-row"><label>City<input required autoComplete="address-level2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label><label>State<input required autoComplete="address-level1" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label><label>ZIP<input required autoComplete="postal-code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></label></div></>}
      <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required type="password" minLength={creating ? 8 : undefined} autoComplete={creating ? "new-password" : "current-password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{creating && <small>Use at least 8 characters.</small>}</label>
      {(error || sessionError) && <p className="form-error" role="alert">{error || sessionError}</p>}
      <button className="button button-primary button-full" disabled={busy}>{busy ? "Please wait…" : creating ? "Create account" : "Sign in"}<Icon name="arrow" size={17} /></button>
    </form>
    <p className="auth-switch">{creating ? "Already have an account?" : "New to FoodLoop?"} <button type="button" onClick={() => { setCreating(!creating); setError(""); }}>{creating ? "Sign in" : "Create an account"}</button></p>
    <p className="auth-note"><Icon name="leaf" size={15} /> One account for your organization.</p>
  </section></main>;
}
