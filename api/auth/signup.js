// File: /api/auth/signup.js
import { db } from '../utils/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password || password.length < 6) {
            return res.status(400).json({ message: 'Email and a password of at least 6 characters are required.' });
        }

        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        await db.createUser({ email, password });

        res.status(201).json({ message: 'Signup successful! Your account is pending approval from an administrator.' });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
