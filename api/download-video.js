// File: /api/download-video.js
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
    const { uri } = req.query;
    if (!uri) {
      return res.status(400).json({ message: 'Video URI is required.' });
    }
    
    // FIX: The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // FIX: Updated error message to reflect the correct environment variable.
      return res.status(500).json({ message: "Server configuration error: API key not found." });
    }

    const videoUrl = `${uri}&key=${apiKey}`;
    
    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video from Gemini. Status: ${videoResponse.status}`);
    }

    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const readableStream = videoResponse.body;
    await new Promise((resolve, reject) => {
      readableStream.pipe(res);
      readableStream.on('end', resolve);
      readableStream.on('error', reject);
    });

  } catch (error) {
    console.error('Error proxying video download:', error);
    res.status(500).json({ message: `An internal server error occurred: ${error.message}` });
  }
}