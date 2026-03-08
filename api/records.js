export default async function handler(req, res) {
  const rawUrl = process.env.GAS_API_URL || process.env.VITE_GAS_API_URL;

  if (!rawUrl) {
    return res.status(500).json({ error: "GAS_API_URL is not configured on Vercel" });
  }

  const API_URL = rawUrl.trim();

  try {
    if (req.method === 'GET') {
      const response = await fetch(API_URL);
      const text = await response.text();

      try {
        const data = JSON.parse(text);
        return res.status(200).json(data);
      } catch (e) {
        return res.status(502).json({
          error: "Failed to parse JSON from GAS",
          status: response.status,
          details: text.substring(0, 500)
        });
      }
    } else if (req.method === 'POST') {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      const text = await response.text();
      return res.status(200).json({ success: true, status: response.status, details: text.substring(0, 200) });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API proxy error:", error);
    return res.status(500).json({ error: "Internal Proxy Error", message: String(error) });
  }
}
