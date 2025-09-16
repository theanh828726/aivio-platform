// File: /api/admin/update-user.js
import { verifyUser } from '../utils/auth.js';
import { db } from '../utils/db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const admin = await verifyUser(req);
        if (admin.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }

        const { userId, status, credits } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const dataToUpdate = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            dataToUpdate.status = status;
        }
        // Allow setting credits to 0
        if (typeof credits === 'number' && credits >= 0) {
            dataToUpdate.credits = credits;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No valid update fields provided.' });
        }
        
        await db.updateUser(userId, dataToUpdate);

        res.status(200).json({ message: 'User updated successfully.' });

    } catch (error) {
        console.error('Admin Update User Error:', error);
        if (error.message.includes('Forbidden')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
