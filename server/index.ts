import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount AI Gateway
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ide: 'SC INFINITY IDE', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[SC INFINITY IDE Backend] Server running on http://localhost:${PORT}`);
});
