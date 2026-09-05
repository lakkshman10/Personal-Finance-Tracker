const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'News API key is not configured.' });
  }

  try {
    const params = new URLSearchParams({
      function: 'NEWS_SENTIMENT',
      topics: 'finance',
      limit: '50',
      apikey: apiKey,
    });
    let response;
    let data;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await fetch(`https://www.alphavantage.co/query?${params}`);
        data = await response.json();
        break;
      } catch (error) {
        if (attempt === 1) throw error;
      }
    }

    if (!response.ok || data.Note || data.Information || data['Error Message']) {
      return res.status(response.ok ? 502 : response.status).json({
        message: data.Note || data.Information || data['Error Message'] || 'News provider request failed.',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('News provider error:', error);
    return res.status(502).json({ message: 'Unable to load finance news.' });
  }
});

module.exports = router;