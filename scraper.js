const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT =
  'Mozilla/5.0 (compatible; SapporoEventBot/1.0; +https://github.com/yutogithub/family)';

async function scrape(url) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const response = await axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': USER_AGENT },
    maxRedirects: 5,
  });

  const $ = cheerio.load(response.data);

  // Remove non-content elements
  $('script, style, nav, footer, header, aside, .ad, .advertisement, [aria-hidden="true"]').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim();

  // Prefer main content areas
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.main-content',
    '#content',
    '#main',
    'body',
  ];

  let rawText = '';
  for (const sel of contentSelectors) {
    const el = $(sel);
    if (el.length) {
      rawText = el.text();
      break;
    }
  }

  // Collapse whitespace and truncate
  const text = rawText.replace(/\s+/g, ' ').trim().slice(0, 1000);

  // Pull structured event fields when present
  const eventFields = extractEventFields($);

  return { title, text, eventFields, url };
}

function extractEventFields($) {
  const fields = {};

  // Common Japanese event page patterns
  const patterns = {
    date: ['日時', '開催日', '日程', '期間', 'date'],
    place: ['会場', '場所', '開催場所', 'venue', 'location'],
    fee: ['料金', '参加費', '入場料', '費用', 'fee', 'price'],
    name: ['イベント名', 'event name', 'タイトル'],
  };

  $('th, dt, .label, [class*="label"], [class*="title"]').each((_, el) => {
    const label = $(el).text().trim();
    for (const [key, keywords] of Object.entries(patterns)) {
      if (keywords.some((kw) => label.includes(kw))) {
        const sibling =
          $(el).next('td, dd').text().trim() ||
          $(el).siblings('td, dd').first().text().trim();
        if (sibling && !fields[key]) {
          fields[key] = sibling.slice(0, 100);
        }
      }
    }
  });

  return fields;
}

module.exports = { scrape };
