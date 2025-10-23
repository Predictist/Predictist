import "dotenv/config";
import pkg from "@polymarket/clob-client";
const { ClobClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

// Base API host
const HOST = "https://clob.polymarket.com";

async function fetchMarkets() {
  const client = new ClobClient(HOST, signer);

  // Fetch markets
  const result = await client.getMarkets({ limit: 50, closed: false });
  const markets = result?.markets || [];

  console.log(`✅ Pulled ${markets.length} markets`);

  markets.slice(0, 5).forEach((m) =>
    console.log(`${m.question} — ${(m.yesPrice * 100).toFixed(0)}%`)
  );
}

fetchMarkets();



