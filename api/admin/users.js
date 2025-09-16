// File: /api/admin/users.js
import { verifyUser } from '../utils/auth.js';
import { db } from '../utils/db.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const admin = await verifyUser(req);
        if (admin.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }
        
        const users = await db.getAllUsers();
        res.status(200).json({ users });

    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        if (error.message.includes('Forbidden')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
