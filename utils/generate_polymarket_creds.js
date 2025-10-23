// utils/generate_polymarket_creds.js
// ✅ Manual credential creation for Polymarket v4.22.8 (Oct 2025)

import dotenv from "dotenv";
import { Wallet, JsonRpcProvider } from "ethers";
import fetch from "node-fetch";

dotenv.config();

async function generateCreds() {
  try {
    const PRIVATE_KEY = process.env.POLY_PRIVATE_KEY;
    if (!PRIVATE_KEY) throw new Error("Missing POLY_PRIVATE_KEY in .env");

    const provider = new JsonRpcProvider("https://polygon-rpc.com");
    const wallet = new Wallet(PRIVATE_KEY, provider);

    console.log("🔑 Connected wallet:", await wallet.getAddress());

    // Step 1: Create message
    const timestamp = Date.now();
    const message = `Generate API creds at ${timestamp}`;
    const signature = await wallet.signMessage(message);

    // Step 2: Send to Polymarket auth endpoint
    console.log("🪄 Requesting new credentials from Polymarket...");

    const res = await fetch("https://clob.polymarket.com/auth/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signer: await wallet.getAddress(),
        signature,
        message,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API request failed: ${res.status} ${errText}`);
    }

    const creds = await res.json();

    console.log("\n✅ Your Polymarket API Credentials:");
    console.log("-----------------------------------");
    console.log("API Key:", creds.apiKey || creds.api_key);
    console.log("API Secret:", creds.apiSecret || creds.api_secret);
    console.log("API Passphrase:", creds.apiPassphrase || creds.api_passphrase);
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


