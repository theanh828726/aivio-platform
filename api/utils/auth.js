// File: /api/utils/auth.js
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { db } from './db.js';

export async function verifyUser(req) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
        throw new Error('Not authenticated.');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.findUserById(decoded.userId);
        
        if (!user) {
            throw new Error('User not found.');
        }

        // The findUserById function in db.js already removes the password
        return user;
    } catch (error) {
        throw new Error('Invalid token.');
    }
}
