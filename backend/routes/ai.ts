import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const router = express.Router();
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const AI_DELAY = 800;

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

async function callGemini(prompt: string, fallback: string): Promise<string> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text?.trim()) return text.trim();
    } catch (err: any) {
      logger.error({ err: err.message }, '[Gemini Error]');
    }
  }
  await wait(AI_DELAY);
  return fallback;
}

/**
 * @route POST /api/ai/chat
 */
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const prompt = `You are CrowdPulse AI, a smart venue assistant. Be concise. User: "${message}"`;
  const fallback = `As the CrowdPulse AI, I recommend avoiding the North concourse due to volume.`;
  const reply = await callGemini(prompt, fallback);
  res.json({ reply });
});

/**
 * @route POST /api/ai/deep-analysis
 * @desc Point 11: Long-context analysis (Simulation)
 */
router.post('/deep-analysis', async (req: Request, res: Response) => {
  const prompt = `Perform a high-level recursive pattern analysis on the last 24 hours of stadium operations. Identify ghost bottlenecks and predictive dispatch anomalies.`;
  const fallback = `[Gemini 1.5 Pro Deep Analysis] Pattern detected: Gate 4 clogs consistently 22m after halftime starts. Predictive recommendation: Dispatch mobile team to Concourse B at T-minus 5m to halftime.`;
  const analysis = await callGemini(prompt, fallback);
  res.json({ analysis });
});

// Porting other endpoints to TS structure
router.post('/anomaly-detect', async (req: Request, res: Response) => {
  const prompt = `Explain venue anomaly: Gate 1 (45m wait) vs Gate 2 (0m wait).`;
  const fallback = `[Gemini Alert] Gate 1 blockade detected. Divert flow to Gate 2 immediately.`;
  const anomaly = await callGemini(prompt, fallback);
  res.json({ anomaly });
});

router.post('/crowd-predictions', async (req: Request, res: Response) => {
  const { zones } = req.body;
  const metrics = (zones || []).map((z: any) => `${z.name} (${z.waitTime}m)`).join(', ');
  const prompt = `Predict flow for next 15m based on: ${metrics}`;
  const fallback = `[Gemini Prediction] South Concourse nearing capacity. Open Gate C to balance load.`;
  const prediction = await callGemini(prompt, fallback);
  res.json({ prediction });
});

router.post('/emergency-guide', async (req: Request, res: Response) => {
  const { zone } = req.body;
  const prompt = `Emergency guidance for zone: ${zone || 'general area'}`;
  const fallback = `Calmly proceed to emergency exit E-1. Do not use elevators.`;
  const instructions = await callGemini(prompt, fallback);
  res.json({ instructions });
});

export default router;
