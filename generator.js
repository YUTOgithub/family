const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildPrompt({ title, text, eventFields, url }) {
  const fieldLines = Object.entries(eventFields || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  return `以下のWebページの情報をもとに、札幌近郊の未就学児と楽しめる場所・イベントを紹介するX投稿文を3件作成してください。

【ページ情報】
タイトル: ${title}
URL: ${url}
${fieldLines ? `\n【イベント詳細】\n${fieldLines}` : ''}

【本文抜粋】
${text}

【ルール】
- です・ます調
- 1件あたり140文字以内（ハッシュタグ含む）
- 具体的な場所名・日時・内容を盛り込む
- 末尾に #札幌ママ #札幌子連れ #札幌イベント #未就学児 を付ける
- 内容に応じて追加ハッシュタグを1〜2個付けてOK

【出力形式】※厳守
---
投稿1
本文：〇〇〇〇 #札幌ママ #札幌子連れ #札幌イベント #未就学児
---
投稿2
本文：〇〇〇〇 #札幌ママ #札幌子連れ #札幌イベント #未就学児
---
投稿3
本文：〇〇〇〇 #札幌ママ #札幌子連れ #札幌イベント #未就学児
---`;
}

function parsePosts(content) {
  const posts = [];
  const regex = /本文：(.+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const body = match[1].trim();
    if (body) posts.push({ body });
  }
  return posts;
}

async function generatePosts(scraped) {
  const prompt = buildPrompt(scraped);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const content = result.response.text();

  const posts = parsePosts(content);

  if (posts.length === 0) {
    throw new Error('投稿文の解析に失敗しました');
  }

  return posts;
}

module.exports = { generatePosts };
