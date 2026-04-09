import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { healthRouter } from './routes/index.js';

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use('/api', healthRouter);

app.listen(port, () => {
  console.log(`Grey Sky backend listening on port ${port}`);
});

export default app;
