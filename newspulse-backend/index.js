const express = require('express');
const { Pool } = require('pg'); // Import the pg Pool
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Create a new Pool instance to manage database connections
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// --- AUTHENTICATION ROUTES ---

// 1. User Registration
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Use parameterized queries to prevent SQL injection 🛡️
        const query = 'INSERT INTO users (email, password) VALUES ($1, $2)';
        await pool.query(query, [email, hashedPassword]);
        res.status(201).json({ message: "User created successfully!" });
    } catch (error) {
        res.status(400).json({ error: "User with this email already exists." });
    }
});

// 2. User Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
        return res.status(400).json({ error: "Invalid credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid credentials." });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

// --- MIDDLEWARE to protect routes ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.userId = user.userId;
        next();
    });
};

// --- BOOKMARK ROUTES (Protected) ---

// 3. Get all bookmarks for a user
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
    const query = `
        SELECT a.id, a.url, a.title, a.description, a.urlToImage, a.sourceName 
        FROM articles a
        JOIN user_bookmarks ub ON a.id = ub.article_id
        WHERE ub.user_id = $1
    `;
    const result = await pool.query(query, [req.userId]);
    res.json(result.rows);
});

// 4. Add a bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
    const { url, title, description, urlToImage, sourceName } = req.body;
    const client = await pool.connect(); // Use a client for transaction
    try {
        await client.query('BEGIN'); // Start transaction

        // First, insert the article if it doesn't exist. ON CONFLICT does nothing if URL is already there.
        const articleQuery = `
            INSERT INTO articles (url, title, description, urlToImage, sourceName)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (url) DO NOTHING;
        `;
        await client.query(articleQuery, [url, title, description, urlToImage, sourceName]);

        // Get the ID of the article (whether it was just inserted or already existed)
        const getArticleIdQuery = 'SELECT id FROM articles WHERE url = $1';
        const articleResult = await client.query(getArticleIdQuery, [url]);
        const articleId = articleResult.rows[0].id;

        // Now, create the bookmark link in the join table
        const bookmarkQuery = 'INSERT INTO user_bookmarks (user_id, article_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
        await client.query(bookmarkQuery, [req.userId, articleId]);

        await client.query('COMMIT'); // Commit transaction
        res.status(201).json({ message: "Bookmark added" });
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback on error
        res.status(500).json({ error: "Failed to add bookmark." });
    } finally {
        client.release(); // Release client back to pool
    }
});

// 5. Remove a bookmark
app.delete('/api/bookmarks', authenticateToken, async (req, res) => {
    const { articleUrl } = req.body;
    // The query finds the article_id from the URL and then deletes the link in user_bookmarks
    const query = `
        DELETE FROM user_bookmarks
        WHERE user_id = $1 AND article_id = (SELECT id FROM articles WHERE url = $2)
    `;
    await pool.query(query, [req.userId, articleUrl]);
    res.status(204).send();
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));