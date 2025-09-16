// File: /api/optimize-prompt.js
import { GoogleGenAI } from '@google/genai';
import { verifyUser } from './utils/auth.js';
import { db } from './utils/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  
  let user;
  try {
    user = await verifyUser(req);
    if (user.status !== 'approved') {
      return res.status(403).json({ message: `Your account status is: ${user.status}. Access denied.` });
    }
    if (user.credits <= 0) {
      return res.status(402).json({ message: 'Insufficient credits.' });
    }
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Authentication failed.' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required.' });
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Server configuration error: API key not found." });
    }
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Rewrite the following user's prompt to be more descriptive and effective for a visual AI model. The new prompt should respect the user's original intent. Keep it concise and in the same language as the original. Directly output the optimized prompt without any preamble.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const optimizedPrompt = response.text.trim();

    if (optimizedPrompt) {
        // Optimization is cheaper, let's say it costs 0.1 credits
        await db.updateUser(user.id, { credits: user.credits - 0.1 });
        res.status(200).json({ optimizedPrompt });
    } else {
        res.status(500).json({ message: "Could not optimize prompt." });
    }

  } catch (error) {
    console.error('Error calling Gemini API for optimization:', error);
    res.status(500).json({ message: `An internal server error occurred: ${error.message}` });
  }
}
