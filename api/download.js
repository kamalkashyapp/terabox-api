const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    // Extract shareId from TeraBox link
    const match = url.match(/\/s\/([a-zA-Z0-9]+)/);
    if (!match) {
      return res.status(400).json({ error: "Invalid TeraBox link" });
    }

    const shareId = match[1];

    // Replace this API with your working scraper or friend's API
    const apiURL = `https://api.ronnieverse.site/api?link=${encodeURIComponent(url)}`;

    const response = await fetch(apiURL);
    const data = await response.json();

    if (!data || data.error) {
      return res.status(404).json({ error: "Video not found or unsupported content." });
    }

    // Send back the response
    return res.status(200).json({
      shareId,
      ...data,
    });

  } catch (err) {
    console.error("Error in /api/download:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
