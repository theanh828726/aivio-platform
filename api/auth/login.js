// File: /api/auth/login.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { db } from '../utils/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { email, password } = req.body;
        
        const user = await db.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        
        // Don't check for status here, let the frontend redirect based on status
        // if (user.status !== 'approved') {
        //      return res.status(403).json({ message: `Your account status is: ${user.status}. Access denied.` });
        // }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        }));
        
        const { password: _, ...userWithoutPassword } = user;

        res.status(200).json({ message: 'Login successful', user: userWithoutPassword });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
