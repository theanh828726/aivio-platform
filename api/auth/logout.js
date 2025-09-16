// File: /api/auth/logout.js
import cookie from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    res.setHeader('Set-Cookie', cookie.serialize('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0), // Set expiry date to the past
        sameSite: 'strict',
        path: '/',
    }));

    res.status(200).json({ message: 'Logout successful' });
}
