import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSystemInfo } from './sysinfo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Statische Dateien aus ../public (relativ zu dist/ bzw. src/)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/systeminfo', async (_req, res) => {
  try {
    res.json(await getSystemInfo());
  } catch (err) {
    console.error('sysinfo failed:', err);
    res.status(500).json({ error: 'sysinfo failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`M17 dashboard listening on http://0.0.0.0:${PORT}`);
});