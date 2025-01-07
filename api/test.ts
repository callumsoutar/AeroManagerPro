import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    env: {
      hasResendKey: !!process.env.REACT_APP_RESEND_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
} 