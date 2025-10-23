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
    limit: 1000,
    closed: "false",
    active: "true",
    archived: "false",
  };

  console.log("🌐 Fetching Polymarket markets...");
  const result = await client.getMarkets(params);
  const markets = result?.data || result?.markets || [];

  console.log(`✅ Pulled ${markets.length} markets`);

  markets.slice(0, 5).forEach((m, i) => {
    const yesOutcome =
      m.outcomes?.find((o) => /yes/i.test(o.name)) || m.outcomes?.[0];
    const yes = yesOutcome?.price
      ? (yesOutcome.price * 100).toFixed(0)
      : "N/A";
    console.log(`• [${i + 1}] ${m.question || m.title || "Untitled"} (${yes}%)`);
  });

  if (markets.length === 0) {
    console.log("⚠️ Raw response keys:", Object.keys(result || {}));
  }
}

fetchMarkets();



