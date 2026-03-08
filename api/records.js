export default async function handler(req, res) {
  // Use Vercel environment variable for GAS API URL
  const API_URL = process.env.GAS_API_URL || process.env.VITE_GAS_API_URL;

  if (!API_URL) {
    return res.status(500).json({ error: "GAS_API_URL is not configured on Vercel" });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(API_URL);
      const data = await response.json();
      return res.status(200).json(data);
    } else if (req.method === 'POST') {
      // Forward the request body to Google Apps Script
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      // Acknowledge success
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API proxy error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
