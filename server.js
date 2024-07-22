const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Import cors package
const app = express();
const port = 3000;
const db = new sqlite3.Database('db.db');

// Set up multer for file handling
const storage = multer.memoryStorage(); // Use memory storage to handle files as buffers
const upload = multer({ storage: storage });

// Middleware to handle CORS
app.use(cors()); // Enable CORS for all routes

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (optional)
app.use(express.static('public'));

// Route to handle form submissions
// Ensure the products table exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            longitude REAL,
            latitude REAL,
            weight REAL,
            price REAL,
            name TEXT,
            type TEXT,
            identifier TEXT,
            product_image BLOB,
            location_image BLOB,
            location TEXT
        )
    `);
});

app.post('/submit-product', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'locationimage', maxCount: 1 }
]), (req, res) => {
    const { longitude, latitude, weight, price, name, type, identifier, location } = req.body;
    const productImage = req.files['image'] ? req.files['image'][0].buffer : null;
    const locationImage = req.files['locationimage'] ? req.files['locationimage'][0].buffer : null;

    if (!longitude || !latitude || !weight || !price || !name || !type || !identifier || !productImage || !locationImage) {
        return res.status(400).send('All fields are required.');
    }

    db.serialize(() => {
        const stmt = db.prepare(`
            INSERT INTO products (longitude, latitude, weight, price, name, type, identifier, product_image, location_image, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(longitude, latitude, weight, price, name, type, identifier, productImage, locationImage, location, function(err) {
            if (err) {
                console.error('Error saving data:', err.message);
                return res.status(500).send('Error saving data.');
            }
            res.send('Product successfully uploaded.');
        });

        stmt.finalize();
    });
});

// Route to delete a product
app.delete('/product/:identifier', (req, res) => {
    const identifier = req.params.identifier;

    db.run('DELETE FROM products WHERE identifier = ?', [identifier], function(err) {
        if (err) {
            console.error('Error deleting product:', err.message);
            return res.status(500).send('Error deleting product.');
        }
        if (this.changes > 0) {
            res.send('Product successfully deleted.');
        } else {
            res.status(404).send('Product not found.');
        }
    });
});

// Route to retrieve product details
app.get('/product/:identifier', (req, res) => {
    const identifier = req.params.identifier;

    db.get('SELECT * FROM products WHERE identifier = ?', [identifier], (err, row) => {
        if (err) {
            console.error('Error retrieving product:', err.message);
            return res.status(500).send('Error retrieving product.');
        }
        if (row) {
            // Construct the response object
            const productDetails = {
                identifier: row.identifier,
                name: row.name,
                price: row.price,
                weight: row.weight,
                type: row.type,
                longitude: row.longitude,
                latitude: row.latitude,
                // Serve image URLs if needed
            };
            res.json(productDetails);
        } else {
            res.status(404).send('Product not found');
        }
    });
});

// Route to retrieve all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            throw err;
        }

        // Convert BLOB image data to Base64
        rows = rows.map(row => {
            if (row.product_image) {
                row.product_image = `data:image/png;base64,${Buffer.from(row.product_image).toString('base64')}`;
            } else {
                row.product_image = ''; // or null
                console.log('Image data is missing for row:', row);
            }
            return row;
        });

        res.json({ products: rows });
    });
});



// Route to serve product images
app.get('/images/:type/:identifier', (req, res) => {
    const { type, identifier } = req.params;
    const columnName = type === 'product' ? 'product_image' : 'location_image';

    db.get('SELECT ' + columnName + ' FROM products WHERE identifier = ?', [identifier], (err, row) => {
        if (err) {
            console.error('Error retrieving image:', err.message);
            return res.status(500).send('Error retrieving image.');
        }
        if (row && row[columnName]) {
            res.set('Content-Type', 'image/jpeg');
            res.send(row[columnName]);
        } else {
            res.status(404).send('Image not found.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
