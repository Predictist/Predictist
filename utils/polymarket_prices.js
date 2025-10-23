import "dotenv/config";
import pkg from "@polymarket/clob-client";
const { ClobClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

// ✅ Polymarket CLOB API base URL
const HOST = "https://clob.polymarket.com";

async function fetchMarkets() {
  // Pass the host as first argument, signer as second
  const client = new ClobClient(HOST, signer);

  const markets = await client.getMarkets({ limit: 50, closed: false });

  console.log(`✅ Pulled ${markets.length} markets`);
  markets.slice(0, 5).forEach((m) =>
    console.log(`${m.question} — ${Math.round(m.yesPrice * 100)}%`)
  );
}

fetchMarkets();


