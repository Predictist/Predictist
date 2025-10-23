import "dotenv/config";
import pkg from "@polymarket/clob-client";
const { ClobClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";
import fetch from "node-fetch";

const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(process.env.PRIVATE_KEY, provider);
const HOST = "https://clob.polymarket.com";

async function fetchMarkets() {
  const client = new ClobClient(HOST, signer);

  console.log("🌐 Fetching Polymarket markets...");
  const result = await client.getMarkets({ limit: 1000, closed: "false", active: "true" });
  const markets = result?.data || result?.markets || [];
  console.log(`✅ Pulled ${markets.length} markets`);

  // Collect market IDs
  const ids = markets.map((m) => m.id).filter(Boolean).slice(0, 50); // first 50 for speed

  // Fetch market states directly
    // ✅ Newer API path — note singular and condition_ids param
  const stateURL = `${HOST}/market_state?condition_ids=${ids.join(",")}`;
  const res = await fetch(stateURL, {
    headers: {
      accept: "application/json",
    },
  });

  // Handle non-JSON errors safely
  if (!res.ok) {
    const text = await res.text();
    console.error("❌ HTTP error:", res.status, res.statusText, "\nResponse:", text.slice(0,200));
    return;
  }

  const states = await res.json();

  // Map id → mid price
  const priceMap = {};
  for (const s of states) {
    priceMap[s.market_id] = s.mid ?? s.bestBid ?? s.bestAsk ?? null;
  }

  // Show results
  for (let i = 0; i < Math.min(markets.length, 5); i++) {
    const m = markets[i];
    const yes = priceMap[m.id] ? (priceMap[m.id] * 100).toFixed(0) : "N/A";
    console.log(`• [${i + 1}] ${m.question || m.title || "Untitled"} (${yes}%)`);
  }
}

fetchMarkets();




