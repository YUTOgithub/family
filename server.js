require('dotenv').config();
const express = require('express');
const path = require('path');
const { scrape } = require('./scraper');
const { generatePosts } = require('./generator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({ success: false, error: 'URLを入力してください' });
  }

  let scraped;
  try {
    scraped = await scrape(url.trim());
  } catch (err) {
    console.error('Scraping error:', err.message);
    const isTimeout = err.code === 'ECONNABORTED' || err.message.includes('timeout');
    return res.status(502).json({
      success: false,
      error: isTimeout
        ? 'タイムアウトしました。再試行してください'
        : 'ページの取得に失敗しました。URLを確認してください',
    });
  }

  let posts;
  try {
    posts = await generatePosts(scraped);
  } catch (err) {
    console.error('Generation error:', err.message);
    const isTimeout = err.message.includes('timeout');
    return res.status(502).json({
      success: false,
      error: isTimeout
        ? 'タイムアウトしました。再試行してください'
        : '投稿文の生成に失敗しました。しばらくしてから再試行してください',
    });
  }

  res.json({
    success: true,
    posts,
    source: { title: scraped.title, url: scraped.url },
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
