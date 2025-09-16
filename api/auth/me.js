// File: /api/auth/me.js
import { verifyUser } from '../utils/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const user = await verifyUser(req);
        // The password hash is already removed by the verifyUser -> findUserById flow
        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Not authenticated or invalid token.' });
    }
}
