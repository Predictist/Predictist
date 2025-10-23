// utils/polymarket_auth.js
// ✅ EIP-712 signing to generate Polymarket API credentials (L1 auth)

import dotenv from "dotenv";
import { Wallet, JsonRpcProvider } from "ethers";
import fetch from "node-fetch";

dotenv.config();

const CHAIN_ID = 137; // Polygon Mainnet
const CLOB_ENDPOINT = "https://clob.polymarket.com";

async function generatePolymarketCreds() {
  try {
    const PRIVATE_KEY = process.env.POLY_PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error("Missing POLY_PRIVATE_KEY in .env");

    const provider = new JsonRpcProvider("https://polygon-rpc.com");
    const wallet = new Wallet(PRIVATE_KEY, provider);
    const address = await wallet.getAddress();

    console.log("🔑 Connected wallet:", address);

    // 1️⃣ Create EIP-712 typed data
    const timestamp = Date.now().toString();
    const nonce = 0;

    const domain = {
      name: "ClobAuthDomain",
      version: "1",
      chainId: CHAIN_ID,
    };

    const types = {
      ClobAuth: [
        { name: "address", type: "address" },
        { name: "timestamp", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "message", type: "string" },
      ],
    };

    const value = {
      address,
      timestamp,
      nonce,
      message: "This message attests that I control the given wallet",
    };

    // 2️⃣ Sign the typed data
    const signature = await wallet.signTypedData(domain, types, value);
    console.log("🖋️ Signature generated.");

    // 3️⃣ Send signed payload to Polymarket /auth/api-key
    const res = await fetch(`${CLOB_ENDPOINT}/auth/api-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        POLY_ADDRESS: address,
        POLY_SIGNATURE: signature,
        POLY_TIMESTAMP: timestamp,
        POLY_NONCE: nonce.toString(),
      },
      body: JSON.stringify({
        message: value.message,
      }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`❌ ${res.status} ${text}`);

    const creds = JSON.parse(text);

    console.log("\n✅ Your Polymarket API Credentials:");
    console.log("-----------------------------------");
    console.log("API Key:", creds.apiKey || creds.api_key);
    console.log("API Secret:", creds.apiSecret || creds.api_secret);
    console.log("API Passphrase:", creds.apiPassphrase || creds.api_passphrase);
    console.log("-----------------------------------\n");
  } catch (err) {
    console.error("❌ Error generating credentials:", err);
  }
}

generatePolymarketCreds();
