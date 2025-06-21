
// api/download.js
const axios = require("axios");
const cheerio = require("cheerio");

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes("terabox.com") && !url.includes("1024terabox.com")) {
    return res.status(400).json({ error: "Invalid TeraBox URL" });
  }

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(response.data);
    const scriptTags = $("script");
    let pageData = {};

    scriptTags.each((i, el) => {
      const content = $(el).html() || "";
      const match = content.match(/window\.pageData\s*=\s*(\{.*\});/);
      if (match && match[1]) {
        pageData = JSON.parse(match[1]);
      }
    });

    const videoInfo = pageData?.videoPreviewPlayInfo?.meta?.mediaInfo?.[0];
    if (!videoInfo) {
      return res
        .status(404)
        .json({ error: "Video not found or link is not a video file." });
    }

    res.status(200).json({
      title: pageData.share?.share_title || "unknown",
      size: videoInfo.size,
      m3u8: videoInfo.play_url,
      type: videoInfo.type,
    });
  } catch (err) {
    console.error("Error parsing TeraBox page:", err.message);
    res.status(500).json({ error: "Failed to extract video info." });
  }
      }
      
