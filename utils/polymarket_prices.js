import pkg from "@polymarket/clob-client";
const { ClobClient } = pkg;
import { Wallet, JsonRpcProvider } from "ethers";
import "dotenv/config";

const provider = new JsonRpcProvider("https://polygon-rpc.com");
const signer = new Wallet(process.env.PRIVATE_KEY, provider);

async function fetchMarkets() {
  const client = new ClobClient({ signer }); // 👈 correct constructor name
  const markets = await client.getMarkets({ limit: 50, closed: false });

  console.log(`✅ Pulled ${markets.length} markets`);
  markets.slice(0, 5).forEach((m) =>
    console.log(`${m.question} — ${Math.round(m.yesPrice * 100)}%`)
  );
}

fetchMarkets();


