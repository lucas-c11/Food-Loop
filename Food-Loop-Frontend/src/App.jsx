import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useFoodLoop } from "./hooks/useFoodLoop";
import { AuthPage } from "./components/AuthPage";
import { AppSidebar } from "./components/AppSidebar";
import { PageHeader } from "./components/PageHeader";
import { MetricCard } from "./components/MetricCard";
import { DonationCard } from "./components/DonationCard";
import { DonationForm } from "./components/DonationForm";
import { EmptyState } from "./components/EmptyState";
import { Notice } from "./components/Notice";
import { Icon } from "./components/Icon";

function LoadingRows() { return <div className="loading-list" aria-label="Loading donations"><span /><span /><span /></div>; }
function SectionTitle({ eyebrow, title, count, action, onAction }) {
  return <div className="section-title"><div><span className="section-eyebrow">{eyebrow}</span><h2>{title}{count !== undefined && <span className="count-pill">{count}</span>}</h2></div>{action && <button className="text-button" onClick={onAction}>{action}<Icon name="arrow" size={15} /></button>}</div>;
}

export default function App() {
  const auth = useAuth();
  const [showDonationForm, setShowDonationForm] = useState(false);
  const mode = auth.user?.role || "restaurant";
  const organization = auth.user?.organization;
  const restaurantId = mode === "restaurant" ? organization?._id : "";
  const pantryId = mode === "pantry" ? organization?._id : "";
  const data = useFoodLoop({ mode, restaurantId, pantryId });
  if (auth.loading) return <div className="page-loading auth-loading"><span className="loading-orb" /> Loading your FoodLoop account…</div>;
  if (!auth.user) return <AuthPage />;

  const availableCount = data.restaurantDonations.filter((item) => item.status === "available").length;
  const claimedCount = data.restaurantDonations.filter((item) => item.status === "claimed").length;
  const completedCount = data.restaurantDonations.filter((item) => item.status === "done").length;
  const ownDonations = [...data.restaurantDonations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  async function safely(action) { try { await action(); } catch {} }

  return <div className="app-shell" id="top">
    <AppSidebar mode={mode} organization={organization} email={auth.user.email} onLogout={auth.logout} />
    <main className="main-content">
      <PageHeader mode={mode} title={mode === "restaurant" ? "Good food, shared." : "Your neighborhood, nourished."} description={mode === "restaurant" ? "Make surplus a little more meaningful." : "Find fresh food and keep every pickup moving."} organization={organization} email={auth.user.email} onPrimaryAction={mode === "restaurant" ? () => setShowDonationForm((value) => !value) : null} />
      <div className="page-body">
        {data.error && <Notice onDismiss={() => data.setError("")}>{data.error}</Notice>}
        {!organization ? <EmptyState icon="store" title="Organization details are unavailable" description="Sign out and sign in again to refresh your account." action="Sign out" onAction={auth.logout} /> : mode === "restaurant" ? <>
          <div className="welcome-strip"><div className="strip-mark"><Icon name="leaf" size={21} /></div><div><strong>Your food can do more.</strong><span>Share surplus with a pantry in your community.</span></div><span className="strip-decoration">✳</span></div>
          <div className="metric-grid"><MetricCard label="Donations posted" value={data.restaurantDonations.length} note="All time" icon="box" tone="green" /><MetricCard label="Available now" value={availableCount} note="Ready for pickup" icon="clock" tone="orange" /><MetricCard label="In good hands" value={claimedCount + completedCount} note={`${claimedCount} on the way · ${completedCount} completed`} icon="heart" tone="lavender" /></div>
          {showDonationForm && <DonationForm busy={data.busyId === "new"} onClose={() => setShowDonationForm(false)} onSubmit={data.createDonation} />}
          <section className="content-section"><SectionTitle eyebrow="YOUR CONTRIBUTION" title="Recent donations" count={ownDonations.length} action="Add a donation" onAction={() => setShowDonationForm((value) => !value)} />{data.loadingDonations ? <LoadingRows /> : ownDonations.length ? <div className="donation-list">{ownDonations.map((donation) => <DonationCard key={donation._id} donation={donation} mode="restaurant" busy={data.busyId === donation._id} onCancel={(id) => safely(() => data.cancelDonation(id))} />)}</div> : <EmptyState icon="box" title="Nothing shared just yet" description="When you post a donation, it will show up here for your team." action="Post your first donation" onAction={() => setShowDonationForm(true)} />}</section>
        </> : <>
          <div className="welcome-strip pantry-strip"><div className="strip-mark"><Icon name="heart" size={21} /></div><div><strong>Fresh food, close to home.</strong><span>Claim a donation and help it reach your community.</span></div><span className="strip-decoration">✳</span></div>
          <div className="metric-grid pantry-metrics"><MetricCard label="Ready to claim" value={data.availableDonations.length} note="Fresh opportunities nearby" icon="box" tone="orange" /><MetricCard label="Your active pickups" value={data.activeClaims.length} note="Claimed and on the way" icon="clock" tone="green" /><MetricCard label="Your pantry" value="Connected" note={organization.address?.city || "Local community"} icon="pin" tone="lavender" /></div>
          <div className="pantry-columns"><section className="content-section compact-section"><SectionTitle eyebrow="YOUR NEXT PICKUP" title="Active claims" count={data.activeClaims.length} />{data.loadingDonations ? <LoadingRows /> : data.activeClaims.length ? <div className="donation-list">{data.activeClaims.map((donation) => <DonationCard key={donation._id} donation={donation} mode="pantry" busy={data.busyId === donation._id} onComplete={(id) => safely(() => data.completeDonation(id))} onRelease={(id) => safely(() => data.releaseDonation(id))} />)}</div> : <EmptyState icon="check" title="All caught up" description="Claim a donation when your pantry is ready for its next pickup." />}</section><section className="content-section compact-section"><SectionTitle eyebrow="FROM LOCAL RESTAURANTS" title="Available food" count={data.availableDonations.length} />{data.loadingDonations ? <LoadingRows /> : data.availableDonations.length ? <div className="donation-list">{data.availableDonations.map((donation) => <DonationCard key={donation._id} donation={donation} mode="pantry" busy={data.busyId === donation._id} onClaim={(id) => safely(() => data.claimDonation(id))} />)}</div> : <EmptyState icon="leaf" title="No donations nearby right now" description="Check back soon. Restaurants add new food as it becomes available." />}</section></div>
        </>}
        <footer className="page-footer"><span>Made for neighbors, by neighbors.</span><span><Icon name="leaf" size={14} /> FoodLoop</span></footer>
      </div>
    </main>
  </div>;
}


