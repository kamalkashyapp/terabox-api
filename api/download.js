const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || (!url.includes("terabox.com") && !url.includes("1024terabox.com"))) {
    return res.status(400).json({ error: "Invalid or missing TeraBox URL." });
  }

  try {
    const page = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(page.data);
    let pageData = {};

    $("script").each((i, el) => {
      const content = $(el).html();
      const match = content && content.match(/window\.pageData\s*=\s*(\{.*?\});/s);
      if (match && match[1]) {
        pageData = JSON.parse(match[1]);
      }
    });

    const videoInfo = pageData?.videoPreviewPlayInfo?.meta?.mediaInfo?.[0];

    if (!videoInfo) {
      return res.status(404).json({ error: "Video not found or unsupported file." });
    }

    return res.status(200).json({
      title: pageData.share?.share_title || "Untitled",
      size: videoInfo.size,
      m3u8: videoInfo.play_url,
      type: videoInfo.type,
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Failed to extract video data." });
  }
};
                                
