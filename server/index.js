import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import { crossOriginResourcePolicy } from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { register } from './controllers/auth.js';
import { createPost, addComment } from './controllers/posts.js';
import conversationRoute from "./routes/conversations.js";
import messageRoute from "./routes/messages.js";
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { verifyToken } from './middleware/auth.js';

// CONFIG
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());

// CORS for LOCAL ONLY
app.use(cors({
  origin: process.env.FRONT_END,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// // Optional: Allow preflight
app.options(process.env.FRONT_END, cors());

// MIDDLEWARE
app.use(helmet());
app.use(crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Ensure 'public/assets' folder exists
const uploadDir = 'public/assets';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// ROUTES with file upload
app.post('/auth/register', upload.single('picture'), register);
app.post('/posts', verifyToken, upload.single('picture'), createPost);
app.patch('/posts/:id/comments', verifyToken, addComment);

// Normal API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

// MONGODB SETUP
const PORT = process.env.APP_PORT || 6000;

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log('✅ Connected to MongoDB');
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
