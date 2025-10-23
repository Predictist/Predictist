import "dotenv/config";
import pkg from "@polymarket/clob-client";
const { ClobClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(process.env.PRIVATE_KEY, provider);
const HOST = "https://clob.polymarket.com";

async function fetchMarkets() {
  const client = new ClobClient(HOST, signer);

  const params = {
    limit: 10, // temporarily small to avoid overloading
    closed: "false",
    active: "true",
    archived: "false",
  };

  console.log("🌐 Fetching Polymarket markets...");
  const result = await client.getMarkets(params);
  const markets = result?.data || result?.markets || [];

  console.log(`✅ Pulled ${markets.length} markets\n`);

  for (let i = 0; i < Math.min(markets.length, 5); i++) {
    const m = markets[i];
    const state = await client.getMarketState(m.id).catch(() => null);

    const yesPrice = state?.mid ?? state?.bestBid ?? state?.yes_price ?? null;
    const pct = yesPrice ? (yesPrice * 100).toFixed(0) : "N/A";

    console.log(`• [${i + 1}] ${m.question || m.title || "Untitled"} (${pct}%)`);
  }
}

fetchMarkets();



