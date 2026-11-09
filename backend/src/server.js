import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/config.js';
import { connectDB } from './config/db.js';
import { seedInitialDataIfEmpty } from './seed.js';
import apiRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../frontend');
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendStaticPath = fs.existsSync(frontendDistPath) ? frontendDistPath : frontendPath;

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(frontendStaticPath));

// Connect Database & Auto-Seed
connectDB().then(async () => {
  await seedInitialDataIfEmpty();
});

// Mount Central API Router
app.use('/api', apiRoutes);

// Client-side SPA routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexPath = fs.existsSync(path.join(frontendDistPath, 'index.html'))
    ? path.join(frontendDistPath, 'index.html')
    : path.join(frontendPath, 'index.html');
  res.sendFile(indexPath);
});

const PORT = config.port || 5001;
app.listen(PORT, () => {
  console.log(`🚀 [Server] CodeRank Backend running on http://localhost:${PORT}`);
});
