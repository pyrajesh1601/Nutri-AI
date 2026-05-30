import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import dietRoutes from './routes/dietRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initSocket } from './socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

connectDB();

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is busy. 
    Run: netstat -ano | findstr :${PORT} 
    then: taskkill /PID <number> /F`)
    process.exit(1)
  }
});
