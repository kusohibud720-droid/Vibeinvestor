import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./server/db";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Portfolio
  app.get("/api/portfolio", (req, res) => {
    // For demo purposes, we use a hardcoded user_id 1
    const assets = db.prepare("SELECT * FROM portfolio_assets WHERE user_id = 1").all();
    res.json(assets);
  });

  app.post("/api/portfolio/asset", (req, res) => {
    const { type, symbol, name, quantity, avg_price, sector } = req.body;
    const info = db.prepare(
      "INSERT INTO portfolio_assets (user_id, type, symbol, name, quantity, avg_price, sector) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(1, type, symbol, name, quantity, avg_price, sector);
    res.json({ id: info.lastInsertRowid });
  });

  // Trades & Emotions
  app.get("/api/trades", (req, res) => {
    const trades = db.prepare(`
      SELECT t.*, a.symbol, a.name, ta.reason, ta.what_differently, ta.lesson
      FROM trades t 
      JOIN portfolio_assets a ON t.asset_id = a.id 
      LEFT JOIN trade_analysis ta ON t.id = ta.trade_id
      WHERE t.user_id = 1 
      ORDER BY t.created_at DESC
    `).all();
    res.json(trades);
  });

  app.post("/api/trades", (req, res) => {
    const { asset_id, type, quantity, price, commission, mood, note, analysis } = req.body;
    const info = db.prepare(
      "INSERT INTO trades (user_id, asset_id, type, quantity, price, commission, mood, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(1, asset_id, type, quantity, price, commission, mood, note);
    
    const tradeId = info.lastInsertRowid;
    
    if (analysis) {
      db.prepare(
        "INSERT INTO trade_analysis (trade_id, reason, what_differently, lesson) VALUES (?, ?, ?, ?)"
      ).run(tradeId, analysis.reason, analysis.what_differently, analysis.lesson);
    }
    
    res.json({ id: tradeId });
  });

  // Anxiety Logs
  app.get("/api/anxiety", (req, res) => {
    const logs = db.prepare("SELECT * FROM anxiety_logs WHERE user_id = 1 ORDER BY created_at DESC LIMIT 30").all();
    res.json(logs);
  });

  app.post("/api/anxiety", (req, res) => {
    const { level, event } = req.body;
    db.prepare("INSERT INTO anxiety_logs (user_id, level, event) VALUES (?, ?, ?)").run(1, level, event);
    res.json({ success: true });
  });

  // Social Feed
  app.get("/api/feed", (req, res) => {
    const { filter } = req.query;
    let query = `
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
    `;

    if (filter === 'subscriptions') {
      query += ` JOIN subscriptions s ON p.user_id = s.following_id WHERE s.follower_id = 1 `;
    }

    query += ` ORDER BY p.created_at DESC `;

    const posts = db.prepare(query).all() as any[];

    // Fetch comments and reactions for each post
    const postsWithDetails = posts.map(post => {
      const comments = db.prepare(`
        SELECT c.*, u.username 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `).all(post.id);

      const reactionStats = db.prepare(`
        SELECT 
          type, 
          COUNT(*) as count,
          MAX(CASE WHEN user_id = 1 THEN 1 ELSE 0 END) as user_reacted
        FROM reactions 
        WHERE post_id = ?
        GROUP BY type
      `).all(post.id) as any[];

      const reactions = ['like', 'handshake', 'horror'].map(type => {
        const stat = reactionStats.find(s => s.type === type);
        return {
          type,
          count: stat ? stat.count : 0,
          user_reacted: stat ? !!stat.user_reacted : false
        };
      });

      return { ...post, comments, reactions };
    });

    res.json(postsWithDetails);
  });

  app.post("/api/posts", (req, res) => {
    const { content, is_trade_share, trade_id } = req.body;
    const info = db.prepare("INSERT INTO posts (user_id, content, is_trade_share, trade_id) VALUES (?, ?, ?, ?)")
      .run(1, content, is_trade_share ? 1 : 0, trade_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/posts/:id/comments", (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    const info = db.prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)")
      .run(postId, 1, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/posts/:id/reactions", (req, res) => {
    const { type } = req.body;
    const postId = req.params.id;
    
    // Check if reaction already exists
    const existing = db.prepare("SELECT id FROM reactions WHERE post_id = ? AND user_id = 1 AND type = ?")
      .get(postId, type);
    
    if (existing) {
      db.prepare("DELETE FROM reactions WHERE id = ?").run((existing as any).id);
      res.json({ success: true, action: 'removed' });
    } else {
      db.prepare("INSERT INTO reactions (post_id, user_id, type) VALUES (?, ?, ?)")
        .run(postId, 1, type);
      res.json({ success: true, action: 'added' });
    }
  });

  // Users & Subscriptions
  app.get("/api/users/:id/profile", (req, res) => {
    const userId = req.params.id;
    const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId) as any;
    
    if (!user) return res.status(404).json({ error: "User not found" });

    const assets = db.prepare("SELECT * FROM portfolio_assets WHERE user_id = ?").all(userId);
    const posts = db.prepare(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(userId);

    const isSubscribed = db.prepare("SELECT id FROM subscriptions WHERE follower_id = 1 AND following_id = ?")
      .get(userId);

    res.json({
      ...user,
      assets,
      posts,
      isSubscribed: !!isSubscribed
    });
  });

  app.post("/api/users/:id/subscribe", (req, res) => {
    const followingId = req.params.id;
    const existing = db.prepare("SELECT id FROM subscriptions WHERE follower_id = 1 AND following_id = ?")
      .get(followingId);

    if (existing) {
      db.prepare("DELETE FROM subscriptions WHERE id = ?").run((existing as any).id);
      res.json({ success: true, action: 'unsubscribed' });
    } else {
      db.prepare("INSERT INTO subscriptions (follower_id, following_id) VALUES (?, ?)")
        .run(1, followingId);
      res.json({ success: true, action: 'subscribed' });
    }
  });

  // AI Portfolio Analysis
  app.post("/api/ai/analyze-portfolio", async (req, res) => {
    const assets = db.prepare("SELECT * FROM portfolio_assets WHERE user_id = 1").all();
    const anxiety = db.prepare("SELECT * FROM anxiety_logs WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10").all();
    const trades = db.prepare("SELECT * FROM trades WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10").all();

    const prompt = `
      As Vibe, an AI investment assistant, analyze this user's portfolio and emotional state.
      Portfolio: ${JSON.stringify(assets)}
      Recent Anxiety Logs: ${JSON.stringify(anxiety)}
      Recent Trades: ${JSON.stringify(trades)}
      
      Provide a brief, friendly, and actionable advice in Russian. 
      Focus on the connection between their emotional state and their investment choices.
      Keep it under 300 characters.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      res.json({ advice: response.text });
    } catch (error) {
      res.status(500).json({ error: "AI analysis failed" });
    }
  });

  // Market Sentiment
  app.get("/api/market-sentiment", (req, res) => {
    const avgAnxiety = db.prepare("SELECT AVG(level) as avg FROM anxiety_logs WHERE created_at > datetime('now', '-7 days')").get() as { avg: number };
    const reactionCounts = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM reactions 
      WHERE type IN ('like', 'handshake', 'horror')
      GROUP BY type
    `).all() as any[];

    res.json({
      anxiety: avgAnxiety.avg || 5,
      reactions: reactionCounts
    });
  });

  // Goals & Achievements
  app.get("/api/goals", (req, res) => {
    const goals = db.prepare("SELECT * FROM goals WHERE user_id = 1").all();
    res.json(goals);
  });

  app.get("/api/achievements", (req, res) => {
    const achievements = db.prepare("SELECT * FROM achievements WHERE user_id = 1").all();
    res.json(achievements);
  });

  // Vibe Digest
  app.get("/api/digest", async (req, res) => {
    const existing = db.prepare("SELECT * FROM vibe_digest ORDER BY created_at DESC LIMIT 1").get() as any;
    
    // If digest is older than 24h or doesn't exist, generate new one
    if (!existing || new Date(existing.created_at).getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      const prompt = "Generate a brief, 3-sentence summary of current global market trends for an investor, in Russian. Focus on being helpful and concise.";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        db.prepare("INSERT INTO vibe_digest (content) VALUES (?)").run(response.text);
        return res.json({ content: response.text });
      } catch (e) {
        return res.json({ content: existing?.content || "Рынок стабилен. Следите за новостями." });
      }
    }
    res.json(existing);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // Ensure user 1 exists for demo
  try {
    db.prepare("INSERT OR IGNORE INTO users (id, username) VALUES (1, 'VibeUser')").run();
    
    // Check if assets exist, if not add some
    const assetCount = db.prepare("SELECT COUNT(*) as count FROM portfolio_assets WHERE user_id = 1").get() as { count: number };
    if (assetCount.count === 0) {
      db.prepare("INSERT INTO portfolio_assets (user_id, type, symbol, name, quantity, avg_price, sector) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        1, 'stock', 'GAZP', 'Газпром', 100, 124.5, 'Энергетика'
      );
      db.prepare("INSERT INTO portfolio_assets (user_id, type, symbol, name, quantity, avg_price, sector) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        1, 'fund', 'S&P500', 'iShares Core S&P 500', 10, 4500, 'Финансы'
      );
      db.prepare("INSERT INTO portfolio_assets (user_id, type, symbol, name, quantity, avg_price, sector) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        1, 'bond', 'ОФЗ 26238', 'ОФЗ 26238', 50, 780, 'Госдолг'
      );
    }

    // Add some initial posts
    const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
    if (postCount.count === 0) {
      db.prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)").run(1, "Сегодня решил увеличить долю в облигациях. Рынок кажется перегретым, лучше немного переждать в защитных активах. 🛡️");
      db.prepare("INSERT INTO posts (user_id, content, is_trade_share) VALUES (?, ?, ?)").run(1, "Докупил Газпром на просадке. Верю в дивиденды! 🤑", 1);
    }

    // Add initial anxiety log
    const anxietyCount = db.prepare("SELECT COUNT(*) as count FROM anxiety_logs").get() as { count: number };
    if (anxietyCount.count === 0) {
      db.prepare("INSERT INTO anxiety_logs (user_id, level, event) VALUES (?, ?, ?)").run(1, 3, "Спокойное начало недели");
    }

    // Add another user for testing subscriptions
    db.prepare("INSERT OR IGNORE INTO users (id, username) VALUES (2, 'SmartInvestor')").run();
    const testPostCount = db.prepare("SELECT COUNT(*) as count FROM posts WHERE user_id = 2").get() as { count: number };
    if (testPostCount.count === 0) {
      db.prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)").run(2, "Анализирую рынок биотехов. Кажется, там назревает что-то интересное... 🧬");
      db.prepare("INSERT INTO portfolio_assets (user_id, type, symbol, name, quantity, avg_price, sector) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        2, 'stock', 'PFE', 'Pfizer Inc.', 50, 28.5, 'Здравоохранение'
      );
    }

    // Add initial goals
    const goalCount = db.prepare("SELECT COUNT(*) as count FROM goals").get() as { count: number };
    if (goalCount.count === 0) {
      db.prepare("INSERT INTO goals (user_id, title, target_value, current_value, type) VALUES (?, ?, ?, ?, ?)").run(
        1, 'Диверсификация по секторам: ваша цель — собрать активы из 5 различных отраслей экономики для снижения рисков.', 5, 3, 'sectors_count'
      );
      db.prepare("INSERT INTO goals (user_id, title, target_value, current_value, type) VALUES (?, ?, ?, ?, ?)").run(
        1, 'Финансовая независимость: достижение капитала в 1 000 000 ₽ — это важная веха на пути к вашим долгосрочным планам.', 1000000, 450000, 'portfolio_value'
      );
      db.prepare("INSERT INTO goals (user_id, title, target_value, current_value, type) VALUES (?, ?, ?, ?, ?)").run(
        1, 'Дисциплина эмоций: заполните дневник настроения 10 раз, чтобы лучше понимать связь между чувствами и сделками.', 10, 4, 'streak'
      );
    }

    // Add initial achievements
    const achCount = db.prepare("SELECT COUNT(*) as count FROM achievements").get() as { count: number };
    if (achCount.count === 0) {
      db.prepare("INSERT INTO achievements (user_id, title, description, icon) VALUES (?, ?, ?, ?)").run(
        1, 'Первый шаг к успеху', 'Вы успешно добавили свой самый первый актив в портфель. Поздравляем с началом инвестиционного пути!', '🌱'
      );
      db.prepare("INSERT INTO achievements (user_id, title, description, icon) VALUES (?, ?, ?, ?)").run(
        1, 'Мастер осознанности', 'Вы проявили завидную дисциплину и заполнили 7 дневников эмоций подряд. Это поможет вам избежать импульсивных решений.', '🧘'
      );
      db.prepare("INSERT INTO achievements (user_id, title, description, icon) VALUES (?, ?, ?, ?)").run(
        1, 'Хладнокровный аналитик', 'Вы провели глубокий анализ сделки в момент высокой волатильности рынка и сохранили спокойствие.', '❄️'
      );
    }
  } catch (e) {
    console.error("Initial data insertion failed:", e);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
