import "dotenv/config";
import pkg from "@polymarket/clob-client";
const { ClobClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

const HOST = "https://clob.polymarket.com";

async function fetchMarkets() {
  const client = new ClobClient(HOST, signer);

  // 🔍 Explicit parameters — sometimes the SDK ignores booleans
  const params = {
    limit: 1000,
    closed: "false", // make sure it's a string, not boolean
    active: "true",
    archived: "false",
  };

  console.log("🌐 Fetching Polymarket markets...");
  const result = await client.getMarkets(params);

  // The SDK returns { markets, meta }
  const markets = result?.data || result?.markets || [];
  console.log(`✅ Pulled ${markets.length} markets`);

  // Print first few examples
  markets.slice(0, 5).forEach((m, i) => {
    const yes = (m.yesPrice * 100).toFixed(0);
    console.log(`• [${i + 1}] ${m.question} (${yes}%)`);
  });

  // Optional: print raw keys to inspect
  if (markets.length === 0) {
    console.log("⚠️ No markets found. Raw response keys:", Object.keys(result || {}));
  }
}

fetchMarkets();



