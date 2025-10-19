// pages/api/polymarket.js

export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.polymarket.com/markets");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Polymarket data" });
  }
}
