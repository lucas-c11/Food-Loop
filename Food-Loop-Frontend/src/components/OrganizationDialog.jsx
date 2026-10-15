import { useState } from "react";
import { Icon } from "./Icon";

export function OrganizationDialog({ initialMode = "restaurant", busy, onClose, onCreate }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", line1: "", city: "", state: "", postalCode: "" });
  const [formError, setFormError] = useState("");
  const isRestaurant = mode === "restaurant";

  async function handleSubmit(event) {
    event.preventDefault();
    if (Object.values(form).some((value) => !value.trim())) {
      setFormError("Fill in each field so your community can find you.");
      return;
    }
    setFormError("");
    const body = {
      name: form.name.trim(),
      address: { line1: form.line1.trim(), city: form.city.trim(), state: form.state.trim(), postalCode: form.postalCode.trim() },
      contacts: [],
      foodItems: [],
    };
    try {
      await onCreate(mode, isRestaurant ? body : { ...body, certification: false });
      onClose();
    } catch {
      // Shared page notice displays API errors.
    }
  }

  return (
    <div className="modal-scrim" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="org-dialog-title">
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" size={19} /></button>
        <div className="modal-symbol"><Icon name={isRestaurant ? "store" : "heart"} size={22} /></div>
        <span className="form-kicker">JOIN YOUR LOCAL FOOD LOOP</span>
        <h2 id="org-dialog-title">Add your organization</h2>
        <p className="modal-copy">Set up a workspace to share or find good food nearby.</p>
        <div className="role-switch" role="tablist" aria-label="Organization type">
          <button type="button" role="tab" aria-selected={isRestaurant} className={isRestaurant ? "active" : ""} onClick={() => setMode("restaurant")}><Icon name="store" size={16} /> Restaurant</button>
          <button type="button" role="tab" aria-selected={!isRestaurant} className={!isRestaurant ? "active" : ""} onClick={() => setMode("pantry")}><Icon name="heart" size={16} /> Pantry</button>
        </div>
        <form className="org-form" onSubmit={handleSubmit}>
          <label>Organization name<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={isRestaurant ? "e.g. Harvest Table" : "e.g. Verona Neighborhood Pantry"} /></label>
          <label>Street address<input value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} placeholder="Street and number" /></label>
          <div className="form-row location-fields">
            <label>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" /></label>
            <label>State<input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} placeholder="State" /></label>
            <label>ZIP<input value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} placeholder="ZIP" /></label>
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <button className="button button-primary button-full" disabled={busy}>{busy ? "Setting up…" : "Create workspace"}<Icon name="arrow" size={17} /></button>
        </form>
      </section>
    </div>
  );
}
