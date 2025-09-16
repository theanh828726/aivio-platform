// File: /api/admin.js
import { verifyUser } from './utils/auth.js';
import { db } from './utils/db.js';

// --- Sub-handlers for different methods ---

async function handleGetUsers(req, res, admin) {
    const users = await db.getAllUsers();
    res.status(200).json({ users });
}

async function handleUpdateUser(req, res, admin) {
    const { userId, status, credits } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    const dataToUpdate = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        dataToUpdate.status = status;
    }
    if (typeof credits === 'number' && credits >= 0) {
        dataToUpdate.credits = credits;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No valid update fields provided.' });
    }
    
    await db.updateUser(userId, dataToUpdate);
    res.status(200).json({ message: 'User updated successfully.' });
}


// --- Main Handler ---

export default async function handler(req, res) {
    let admin;
    try {
        admin = await verifyUser(req);
        if (admin.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden. Admin access required.' });
        }
    } catch (error) {
        // This handles cases where the token is missing or invalid
        return res.status(401).json({ message: error.message || 'Authentication failed.' });
    }

    try {
        if (req.method === 'GET') {
            return await handleGetUsers(req, res, admin);
        }

        if (req.method === 'POST') {
            return await handleUpdateUser(req, res, admin);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });

    } catch (error) {
        console.error(`Admin API Error (method: ${req.method}):`, error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
}
