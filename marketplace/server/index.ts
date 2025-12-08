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
    res.json([]);
});

// ===== ADMIN API =====

// Create location
app.post('/api/locations', async (req, res) => {
    try {
        const { name, country, lat, lng } = req.body;
        const location = await prisma.location.create({
            data: { name, country, lat, lng }
        });
        res.json(location);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create location' });
    }
});

// Update location
app.put('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, country, lat, lng } = req.body;
        const location = await prisma.location.update({
            where: { id },
            data: { name, country, lat, lng }
        });
        res.json(location);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update location' });
    }
});

// Delete location
app.delete('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.location.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete location' });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, image, category, locationId } = req.body;
        const product = await prisma.product.create({
            data: { name, description, price, image, category, locationId }
        });
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, category, locationId } = req.body;
        const product = await prisma.product.update({
            where: { id },
            data: { name, description, price, image, category, locationId }
        });
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
