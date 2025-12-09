import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const port = 3001;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
const locationsDir = path.join(__dirname, '../public/locations');

[uploadDir, locationsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // If locationName is present in body (parsed by multer before file if fields come first, but standard multer processing order might be tricky with form-data order. 
        // Note: Multer processes fields in order. For destination to see body fields, they must be sent BEFORE the file field in FormData.)
        // However, standard multer `destination` and `filename` functions have access to `req.body`, but ONLY if the text fields are transmitted before the file field.
        // We will optimistically assume frontend sends locationName first or handle it if possible.
        // Actually, for robust handling, we might just default to uploads and then move/rename if needed, OR enforce frontend order.
        // Let's rely on frontend appending 'locationName' first? But we modified frontend to append it AFTER. 
        // JS FormData order is insertion order usually, so if we append 'locationName' after 'image', it might not be available here.
        // Wait, good catch. Let's fix frontend order in next step if verification fails, or just note it.
        // Actually, let's look at `req.body` in `destination`.
        // To be safe, let's just stick to default uploadDir here, and move the file in the route handler. 
        // OR better: Just put everything in 'uploads' temporarily if we want, or just check req.body.
        // Let's modify the route handler to handle the move/rename logic completely to avoid multer timing issues.
        // So here we keep it simple or default.
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

    let finalPath = `/uploads/${req.file.filename}`;

    // Handle renaming if locationName is provided
    const { locationName } = req.body;
    if (locationName) {
        // Simple slugify
        const slug = locationName
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // remove non-word chars
            .replace(/[\s_-]+/g, '-') // collapse whitespace and replace by -
            .replace(/^-+|-+$/g, ''); // trim -

        if (slug) {
            const ext = path.extname(req.file.originalname);
            const newFilename = `${slug}${ext}`;
            const oldPath = req.file.path; // full path to uploaded file
            const newDestPath = path.join(locationsDir, newFilename);

            try {
                // Move/Rename file
                fs.renameSync(oldPath, newDestPath);
                finalPath = `/locations/${newFilename}`;
            } catch (err) {
                console.error('Failed to rename/move file:', err);
                // Fallback to original path if move fails, or error out?
                // We'll just keep the original valid upload path to not break flow
            }
        }
    }

    res.json({ url: finalPath });
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
            name, country, lat, lng, image, description,
            name_2, name_3, name_4, name_5,
            country_2, country_3, country_4, country_5
        } = req.body;
        const location = await prisma.location.create({
            data: {
                name, country, lat, lng, image, description,
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
            name, country, lat, lng, image, description,
            name_2, name_3, name_4, name_5,
            country_2, country_3, country_4, country_5
        } = req.body;
        const location = await prisma.location.update({
            where: { id },
            data: {
                name, country, lat, lng, image, description,
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
