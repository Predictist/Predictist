// utils/polymarket_ws.js
import WebSocket from "ws";
import fs from "fs";

const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/";
const CACHE_FILE = "./polymarket_prices.json";
let prices = {};

function connect() {
  console.log("🔌 Connecting to Polymarket WebSocket…");
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected");
    ws.send(
      JSON.stringify({
        type: "subscribe",
        channels: [{ name: "market_state" }],
      })
    );
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type !== "update" || data.channel !== "market_state") return;
      const m = data.data;
      const id = m.id || m.slug || m.conditionId;
      if (!id || typeof m.midPrice !== "number") return;

      prices[id] = {
        id,
        slug: m.slug,
        yesPrice: m.midPrice,
        noPrice: 1 - m.midPrice,
        updated: Date.now(),
      };

      if (Object.keys(prices).length % 50 === 0) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(prices, null, 2));
        console.log(`💾 Saved ${Object.keys(prices).length} prices`);
      }
    } catch (err) {
      console.error("parse error", err);
    }
  });

  ws.on("close", () => {
    console.log("⚠️ WS closed — reconnecting in 5s");
    setTimeout(connect, 5000);
  });

  ws.on("error", (err) => {
    console.error("❌ WS error:", err.message);
    ws.close();
  });
}

connect();
