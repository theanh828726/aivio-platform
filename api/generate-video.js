// File: /api/generate-video.js
import { GoogleGenAI } from '@google/genai';
import { verifyUser } from './utils/auth.js';
import { db } from './utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  let user;
  const videoCost = 5; // Example cost for video generation
  try {
    user = await verifyUser(req);
     if (user.status !== 'approved') {
      return res.status(403).json({ message: `Your account status is: ${user.status}. Access denied.` });
    }
    if (user.credits < videoCost) {
      return res.status(402).json({ message: `Insufficient credits. Video generation requires ${videoCost} credits.` });
    }
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Authentication failed.' });
  }

  try {
    const { image, prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required for video generation.' });
    }
    
    const apiKey = process.env.VEO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Server configuration error: VEO API key not found." });
    }
    const ai = new GoogleGenAI({ apiKey });

    const videoRequest = {
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: { numberOfVideos: 1 }
    };

    if (image?.base64) {
        videoRequest.image = {
            imageBytes: image.base64,
            mimeType: image.mimeType,
        };
    }

    const operation = await ai.models.generateVideos(videoRequest);

    // Decrement user's credits immediately on starting the job
    await db.updateUser(user.id, { credits: user.credits - videoCost });

    res.status(202).json({ operationName: operation.name });

  } catch (error) {
    // If starting the job fails, refund the credits
    await db.updateUser(user.id, { credits: user.credits }); // Reverts to original credit amount before decrement
    console.error('Error starting Gemini video generation:', error);
    res.status(500).json({ message: `An internal server error occurred: ${error.message}` });
  }
}
