export default async function handler(req, res) {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).end("Method Not Allowed");
    }
  
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwPeM6Z8P58vrlx_p2ffwit4ApbwH0UqcY7g8Sqc-bVNI8zIl0aXDUJcPw8qtXwtYw/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
  
      const text = await response.text();
      return res.status(200).send(text);
    } catch (err) {
      console.error("Proxy error:", err);
      return res.status(500).json({ error: "Failed to forward request" });
    }
  }
  