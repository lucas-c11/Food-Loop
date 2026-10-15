const paths = {
  leaf: <><path d="M20 4c-8 0-14 4-14 11a5 5 0 0 0 5 5c7 0 11-6 9-16Z"/><path d="M5 21c2-5 6-9 12-12"/></>,
  grid: <><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></>,
  box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9"/></>,
  store: <><path d="M3 10v10h18V10"/><path d="m3 10 2-6h14l2 6M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-6h6v6"/></>,
  heart: <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  fork: <><path d="M6 3v6a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v4"/><path d="M6 3v18M18 3v4"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
};

export function Icon({ name, size = 20, className = "" }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.leaf}</svg>;
}
