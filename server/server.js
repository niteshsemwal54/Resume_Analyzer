const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-analyzer';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';


const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL =process.env.GROQ_URL ||"https://api.groq.com/openai/v1/chat/completions";

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFilename: String,
  storedFilename: String,
  extractedText: String,
  score: Number,
  summary: String,
  strengths: [String],
  weaknesses: [String],
  missingSkills: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Resume = mongoose.model('Resume', resumeSchema);

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const buildAnalysis = async (text) => {
  if (!GROQ_API_KEY) {  
  const extracted = text.slice(0, 1800);
    return {
      score: 0,
    };
  }

  const prompt = `Analyze this resume text and return valid JSON with fields: score (0-100), summary, strengths (array), weaknesses (array), missingSkills (array), suggestions (array). Give Strict JSON Object only  Resume text:\n\n${text}`;
  const response = await axios.post(
    GROQ_URL,
    {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: 'system', content: 'You are a helpful resume analysis assistant.' }, { role: 'user', content: prompt }],
      temperature: 0.3
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      }
    }
  );
 
  const content = response.data.choices?.[0]?.message?.content || '{}';

const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
console.log("cleaned")
console.log(cleaned)
const parsed = JSON.parse(cleaned);
  return {
    score: parsed.score || 70,
    summary: parsed.summary || 'Resume reviewed successfully.',
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    missingSkills: parsed.missingSkills || [],
    suggestions: parsed.suggestions || []
  };
};

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Duplicate email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Wrong password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Wrong password' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/resume/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Invalid PDF' });
    }
    console.log(req.file)

    const dataBuffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(dataBuffer);
    const extractedText = parsed.text || '';
      console.log("text is")
    console.log(extractedText)
    const analysis = await buildAnalysis(extractedText);
  
    const resume = new Resume({
      user: req.userId,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      extractedText,
      ...analysis
    });

    await resume.save();
    res.status(201).json({ resume });
  } catch (error) {
    if (error.message === 'Only PDF files are allowed') {
      return res.status(400).json({ message: 'Invalid PDF' });
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'Large file' });
    }
    if (error.response?.status === 429 || error.response?.status === 401) {
      return res.status(502).json({ message: 'AI API failure' });
    }
    res.status(500).json({ message: 'Resume upload failed' });
  }
});

app.get('/api/resume/history', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

app.get('/api/resume/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json({ resume });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

app.delete('/api/resume/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    if (resume.storedFilename) {
      const filePath = path.join(uploadDir, resume.storedFilename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Resume.deleteOne({ _id: req.params.id });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed; continuing without database:', error.message);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
