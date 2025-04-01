export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).end("Method Not Allowed");
    }
  
    try {
      // Forward the request to Google Apps Script
      const response = await fetch("https://script.google.com/macros/s/AKfycbwKCPH4_d0tvzfHYv_Gaef7JSzLBXAo95ACd8PADtjta2i0WZxo74o4U1edpEvovS0/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
  
      // Always return Success if the verification was valid
      // The Google Sheet will still track unique wallets but won't reject repeats
      return res.status(200).send("Success");
    } catch (err) {
      console.error("Proxy error:", err);
      return res.status(500).json({ error: "Failed to forward request" });
    }
  }