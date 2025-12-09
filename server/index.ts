import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const app = express();
const port = 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Serve static files from public directory to access uploads
app.use(express.static(path.join(__dirname, '../public')));

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL path relative to the public directory
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

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
        const {
            name, country, lat, lng,
            name_2, name_3, name_4, name_5,
            country_2, country_3, country_4, country_5
        } = req.body;
        const location = await prisma.location.create({
            data: {
                name, country, lat, lng,
                name_2, name_3, name_4, name_5,
                country_2, country_3, country_4, country_5
            }
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
        const {
            name, country, lat, lng,
            name_2, name_3, name_4, name_5,
            country_2, country_3, country_4, country_5
        } = req.body;
        const location = await prisma.location.update({
            where: { id },
            data: {
                name, country, lat, lng,
                name_2, name_3, name_4, name_5,
                country_2, country_3, country_4, country_5
            }
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
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { location: true } // Include location info for display
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const {
            name, description, price, image, category, locationId,
            name_2, name_3, name_4, name_5,
            description_2, description_3, description_4, description_5,
            category_2, category_3, category_4, category_5
        } = req.body;
        const product = await prisma.product.create({
            data: {
                name, description, price, image, category, locationId,
                name_2, name_3, name_4, name_5,
                description_2, description_3, description_4, description_5,
                category_2, category_3, category_4, category_5
            }
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
        const {
            name, description, price, image, category, locationId,
            name_2, name_3, name_4, name_5,
            description_2, description_3, description_4, description_5,
            category_2, category_3, category_4, category_5
        } = req.body;
        const product = await prisma.product.update({
            where: { id },
            data: {
                name, description, price, image, category, locationId,
                name_2, name_3, name_4, name_5,
                description_2, description_3, description_4, description_5,
                category_2, category_3, category_4, category_5
            }
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

// ===== LANGUAGE API =====

// Get all languages
app.get('/api/languages', async (req, res) => {
    try {
        const languages = await prisma.language.findMany();
        res.json(languages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch languages' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
