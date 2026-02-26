import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Score from './models/Score.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://komut-zinciri.vercel.app', 'https://komut-zinciri-j0b8x7uso-emrekesimemres-projects.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Kullanıcı adı en az 3 karakter olmalıdır' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Kullanıcı adı veya email zaten kullanımda' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        levelsCompleted: user.levelsCompleted
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        levelsCompleted: user.levelsCompleted
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
});

// Submit score
app.post('/api/scores', authenticateToken, async (req, res) => {
  try {
    const { level, baseScore, timeBonus, moveBonus, totalScore, duration, movesUsed } = req.body;

    const score = new Score({
      user: req.user.userId,
      username: req.user.username,
      level,
      baseScore,
      timeBonus,
      moveBonus,
      totalScore,
      duration,
      movesUsed
    });

    await score.save();

    // Update user total score
    const user = await User.findById(req.user.userId);
    user.totalScore += totalScore;
    user.levelsCompleted = Math.max(user.levelsCompleted, level);
    await user.save();

    res.status(201).json(score);
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ error: 'Skor kaydedilemedi' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const leaderboard = await User.find()
      .select('username totalScore levelsCompleted')
      .sort({ totalScore: -1 })
      .limit(limit);

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Lider tablosu alınamadı' });
  }
});

// Get user scores
app.get('/api/scores/user/:userId', authenticateToken, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(scores);
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: 'Skorlar alınamadı' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Export for Vercel serverless
export default app;
