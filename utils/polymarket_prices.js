import { CLOBClient } from "@polymarket/clob-client";
import { ethers } from "ethers";

const PRIVATE_KEY = "0xYOUR_WALLET_PRIVATE_KEY"; // for signing only, no funds needed
const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

async function fetchMarkets() {
  const client = new CLOBClient({ signer });
  const markets = await client.getMarkets({ limit: 50, closed: false });

  console.log(`✅ Pulled ${markets.length} markets`);
  markets.slice(0, 5).forEach((m) =>
    console.log(`${m.question} — ${Math.round(m.yesPrice * 100)}%`)
  );
}

fetchMarkets();
