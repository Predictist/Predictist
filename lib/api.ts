// predictist/lib/api.ts
export const DASHBOARD_API = 
  process.env.NEXT_PUBLIC_DASHBOARD_API || "http://localhost:3000";

export async function getMarkets(limit = 100) {
  const res = await fetch(`${DASHBOARD_API}/api/markets?limit=${limit}`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.markets || [];
}