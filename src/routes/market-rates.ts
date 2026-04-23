import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminAuthMiddleware } from '../middleware/auth';
import { MarketRate } from '../models/MarketRate';

const router = Router();

// GET /market-rates/:skill — get market rate for a skill
router.get('/:skill', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { skill } = req.params;
    const { city } = req.query;

    const query: any = { skill };
    if (city) query.city = city;

    const rate = await MarketRate.findOne(query).lean();
    if (!rate) {
      // Return defaults if no data
      return res.json({ success: true, data: { skill, median: 600, p25: 450, p75: 800 } });
    }
    res.json({ success: true, data: rate });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /market-rates — list all
router.get('/', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const rates = await MarketRate.find().lean();
    res.json({ success: true, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /market-rates/:skill — admin upsert
router.put('/:skill', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { skill } = req.params;
    const { city = 'default', median, p25, p75 } = req.body;
    const rate = await MarketRate.findOneAndUpdate(
      { skill, city },
      { $set: { median, p25, p75, updated_at: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: rate });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
