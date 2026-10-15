import { Icon } from "./Icon";
import { StatusBadge } from "./StatusBadge";

function formatDate(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function DonationCard({ donation, mode, busy, onClaim, onComplete, onRelease, onCancel }) {
  const item = donation.foodItem || {};
  const otherParty = mode === "pantry" ? donation.restaurantId?.name : donation.pantryId?.name;
  const status = donation.status || "available";
  return (
    <article className="donation-card">
      <div className={`food-art food-art-${(item.name || "food").toLowerCase().charCodeAt(0) % 4}`}>
        {item.picture && <img src={item.picture} alt="" onError={(event) => { event.currentTarget.remove(); }} />}<span className="food-art-fallback">{(item.name || "F").trim().charAt(0).toUpperCase()}</span>
        <span className="food-art-spark">✳</span>
      </div>
      <div className="donation-main">
        <div className="donation-card-top"><StatusBadge status={status} /><time>{formatDate(donation.createdAt)}</time></div>
        <h3>{item.name || "Food donation"}</h3>
        <p className="donation-meta"><strong>{item.amount ?? "—"}</strong> portions <span>·</span> {otherParty || (mode === "pantry" ? "Local restaurant" : "Not claimed yet")}</p>
        {item.ingredients?.length > 0 && <div className="ingredient-list">{item.ingredients.slice(0, 3).map((ingredient) => <span key={ingredient}>{ingredient}</span>)}{item.ingredients.length > 3 && <span>+{item.ingredients.length - 3}</span>}</div>}
      </div>
      <div className="donation-actions">
        {mode === "pantry" && status === "available" && <button className="button button-primary button-small" disabled={busy} onClick={() => onClaim(donation._id)}>Claim food <Icon name="arrow" size={15} /></button>}
        {mode === "pantry" && status === "claimed" && <><button className="button button-primary button-small" disabled={busy} onClick={() => onComplete(donation._id)}><Icon name="check" size={15} /> Complete</button><button className="button button-quiet button-small" disabled={busy} onClick={() => onRelease(donation._id)}>Release</button></>}
        {mode === "restaurant" && status === "available" && <button className="button button-quiet button-small" disabled={busy} onClick={() => onCancel(donation._id)}>Cancel donation</button>}
        {busy && <span className="action-progress">Saving…</span>}
      </div>
    </article>
  );
}
