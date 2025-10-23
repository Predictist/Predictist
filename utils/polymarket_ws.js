// utils/polymarket_ws.js
import WebSocket from "ws";
import fs from "fs";

const WS_URL = "wss://clob.polymarket.com/ws";
const CACHE_FILE = "./polymarket_prices.json";

// keep last-known prices here
let prices = {};

// connect and subscribe
function connect() {
  console.log("🔌 Connecting to Polymarket WebSocket…");
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected");
    // subscribe to all market_state updates
    ws.send(JSON.stringify({ type: "subscribe", channel: "market_state" }));
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type !== "market_state" || !data.market) return;

      const m = data.market;
      const id = m.id || m.slug || m.conditionId;

      // midPrice or bestBid/Ask → yesPrice
      const yes =
        typeof m.midPrice === "number"
          ? m.midPrice
          : typeof m.bestBid === "number" && typeof m.bestAsk === "number"
          ? (m.bestBid + m.bestAsk) / 2
          : null;

      if (yes == null) return;
      const no = 1 - yes;

      prices[id] = {
        id,
        slug: m.slug,
        yesPrice: yes,
        noPrice: no,
        updated: Date.now(),
      };

      // periodically dump to disk
      if (Object.keys(prices).length % 50 === 0) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(prices, null, 2));
        console.log(`💾 Saved ${Object.keys(prices).length} prices`);
      }
    } catch (_) {}
  });

  ws.on("close", () => {
    console.log("⚠️ WS closed — reconnecting in 5 s");
    setTimeout(connect, 5000);
  });

  ws.on("error", (err) => {
    console.error("❌ WS error:", err.message);
    ws.close();
  });
}

connect();
