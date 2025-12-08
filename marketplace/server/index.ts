import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Get all locations with products
app.get('/api/locations', async (req, res) => {
    try {
        const locations = await prisma.location.findMany({
            include: { products: true }
        });
        res.json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
});

// Get user (mock/first user for now)
app.get('/api/user', async (req, res) => {
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            const newUser = await prisma.user.create({
                data: { name: 'Explorer', email: 'user@example.com' }
            });
            return res.json(newUser);
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Cart
app.get('/api/cart', async (req, res) => {
    // For simplicity, returning mock cart or implementing persistent cart
    // Ideally we relate cart items to user. For now, let's just use memory or a simple table if needed.
    // The current task just requested DB for *locations and products*. Cart persistence wasn't strictly asked but "full stack" implies it.
    // I'll skip complex cart persistence for the moment to focus on the main requirement: EDITING DB via DBeaver.
    // So Cart can remain client-side for this beta, OR I can implement it in next step.
    // Let's keep Cart client-side in store for now to ensure MVP stability, 
    // but allow Locations/Products to be dynamic.
    res.json([]);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
