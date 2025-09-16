// File: /api/utils/db.js
// This file mocks a database for demonstration purposes.
// Replace the functions here with your actual database logic (e.g., Prisma, Drizzle, etc.).
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// In-memory store
let users = [];

// --- Initialize Database with default users ---
(async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'theanhchatgpt@gmail.com';
    const adminPassword = await bcrypt.hash('admin123', 10); // CORRECTED PASSWORD
    const userPassword = await bcrypt.hash('user123', 10);

    // Clear the array to prevent duplicates on hot-reloads in development
    users = [];

    users.push({
        id: uuidv4(),
        email: adminEmail,
        password: adminPassword,
        status: 'approved',
        role: 'admin',
        credits: 99999,
    });

    users.push({
        id: uuidv4(),
        email: 'user@example.com',
        password: userPassword,
        status: 'pending',
        role: 'user',
        credits: 0,
    });
     users.push({
        id: uuidv4(),
        email: 'approved@example.com',
        password: userPassword,
        status: 'approved',
        role: 'user',
        credits: 100,
    });
})();

// --- DB Utility Functions ---
export const db = {
    async findUserByEmail(email) {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return Promise.resolve(user || null);
    },

    async findUserById(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return Promise.resolve(null);
        // IMPORTANT: Never send the password hash to the client
        const { password, ...userWithoutPassword } = user;
        return Promise.resolve(userWithoutPassword);
    },

    async createUser({ email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword,
            status: 'pending',
            role: 'user',
            credits: 0, // New users start with 0 credits until approved
        };
        users.push(newUser);
        const { password: _, ...userWithoutPassword } = newUser;
        return Promise.resolve(userWithoutPassword);
    },
    
    async updateUser(userId, updates) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error("User not found for update");
        }
        users[userIndex] = { ...users[userIndex], ...updates };
        const { password, ...updatedUserWithoutPassword } = users[userIndex];
        return Promise.resolve(updatedUserWithoutPassword);
    },

    async getAllUsers() {
        // Return all users without their password hashes
        const usersWithoutPasswords = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        return Promise.resolve(usersWithoutPasswords);
    }
};
