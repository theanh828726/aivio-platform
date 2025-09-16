// File: /api/auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { db } from './utils/db.js';
import { verifyUser } from './utils/auth.js';

// --- Sub-handlers for different actions ---

async function handleLogin(req, res) {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

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
}

async function handleSignup(req, res) {
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
}

async function handleLogout(req, res) {
    res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        sameSite: 'strict',
        path: '/',
    }));
    res.status(200).json({ message: 'Logout successful' });
}

async function handleGetMe(req, res) {
    try {
        const user = await verifyUser(req);
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Not authenticated or invalid token.' });
    }
}


// --- Main Handler ---

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            return await handleGetMe(req, res);
        }

        if (req.method === 'POST') {
            const { action } = req.body;
            switch (action) {
                case 'login':
                    return await handleLogin(req, res);
                case 'signup':
                    return await handleSignup(req, res);
                case 'logout':
                    return await handleLogout(req, res);
                default:
                    return res.status(400).json({ message: 'Invalid action.' });
            }
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });

    } catch (error) {
        console.error(`Auth API Error (action: ${req.body?.action}):`, error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
