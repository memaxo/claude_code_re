const crypto = require('crypto');

// Generate a pseudo-random session ID (like UY)
// In a real app, this would likely be more robust or persistent
const SESSION_ID = process.env.CLAUDE_SESSION_ID || crypto.randomBytes(8).toString('hex');

const TODOS_DIR_NAME = 'todos_data'; // Directory to store todo files

module.exports = {
    SESSION_ID,
    TODOS_DIR_NAME,
}; 