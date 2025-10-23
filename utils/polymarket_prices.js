import pkg from "@polymarket/clob-client";
const { CLOBClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";

const PRIVATE_KEY = "0xYOUR_WALLET_PRIVATE_KEY"; // Use env var in production
const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(PRIVATE_KEY, provider);

async function fetchMarkets() {
  const client = new CLOBClient({ signer });
  const markets = await client.getMarkets({ limit: 50, closed: false });

  console.log(`✅ Pulled ${markets.length} markets`);
  markets.slice(0, 5).forEach((m) =>
    console.log(`${m.question} — ${Math.round(m.yesPrice * 100)}%`)
  );
}

fetchMarkets();


