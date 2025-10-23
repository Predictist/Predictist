// utils/generate_polymarket_creds.js
// ✅ Generate Polymarket L2 API credentials (Node.js version)

import dotenv from "dotenv";
import { Wallet, providers } from "ethers";
import pkg from "@polymarket/clob-client";

dotenv.config();

const { ClobClient } = pkg;

async function generateCreds() {
  try {
    const PRIVATE_KEY = process.env.POLY_PRIVATE_KEY;
    if (!PRIVATE_KEY) {
      throw new Error("Missing POLY_PRIVATE_KEY in .env");
    }

    console.log("🔑 Initializing Polymarket client...");

    // Connect to Polygon mainnet
    const provider = new providers.JsonRpcProvider("https://polygon-rpc.com");
    const signer = new Wallet(PRIVATE_KEY, provider);

    // Initialize the CLOB client (this signs messages under the hood)
    const client = new ClobClient({
      signer,
      chainId: 137,
      host: "https://clob.polymarket.com",
    });

    console.log("🪄 Generating new API credentials...");
    const creds = await client.createOrDeriveApiCreds();

    console.log("\n✅ Your Polymarket API Credentials:");
    console.log("-----------------------------------");
    console.log("API Key:", creds.api_key);
    console.log("API Secret:", creds.api_secret);
    console.log("API Passphrase:", creds.api_passphrase);
    console.log("-----------------------------------\n");

    console.log("💾 Add these to your .env file as:");
    console.log("POLY_API_KEY=...");
    console.log("POLY_API_SECRET=...");
    console.log("POLY_API_PASSPHRASE=...");
  } catch (err) {
    console.error("❌ Error generating credentials:", err);
  }
}

generateCreds();
