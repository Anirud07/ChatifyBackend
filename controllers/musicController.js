const https = require('https');

const searchMusic = (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`;

    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            try {
                const json = JSON.parse(data);
                res.json(json);
            } catch (e) {
                console.error("iTunes parse error:", e);
                res.status(500).json({ message: "Error parsing iTunes response" });
            }
        });
    }).on('error', (err) => {
        console.error("iTunes fetch error:", err);
        res.status(500).json({ message: "Failed to fetch from iTunes" });
    });
};

module.exports = { searchMusic };
