// File: /api/video-status.js
import { GoogleGenAI } from '@google/genai';
import { verifyUser } from './utils/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await verifyUser(req);
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Authentication failed.' });
  }

  try {
    const { operationName } = req.query;
    if (!operationName) {
      return res.status(400).json({ message: 'Operation name is required.' });
    }
    
    // FIX: The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // FIX: Updated error message to reflect the correct environment variable.
      return res.status(500).json({ message: "Server configuration error: API key not found." });
    }
    const ai = new GoogleGenAI({ apiKey });

    const operation = await ai.operations.getVideosOperation({ operation: { name: operationName } });

    res.status(200).json(operation);

  } catch (error) {
    console.error('Error checking Gemini video status:', error);
    res.status(500).json({ message: `An internal server error occurred: ${error.message}` });
  }
}