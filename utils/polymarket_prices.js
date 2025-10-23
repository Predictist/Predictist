import pkg from "@polymarket/clob-client";
const { CLOBClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";

const PRIVATE_KEY = "d211e96230f8e924dc939e961ff49a1eeda6394ce2c26dca3214d394bd2e4fde"; // Use env var in production
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


