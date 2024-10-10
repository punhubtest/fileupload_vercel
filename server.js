const express = require('express');
const multer = require('multer');
const path = require('path');

// Initialize the app
const app = express();

// Set storage options for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
    }
});

// File filter to validate file type (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|docx/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    } else {
        cb('Error: Invalid file type!');
    }
};

// Initialize multer with storage and optional file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
    fileFilter: fileFilter
}).single('file'); // 'file' should match the input field name in the HTML form

// Serve the static HTML file (index.html)
app.use(express.static(__dirname));

// Upload route
app.post('/upload', (req, res) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // Multer error (e.g., file too large)
            return res.status(500).send({ message: 'Multer Error: ' + err.message });
        } else if (err) {
            // Other errors (e.g., invalid file type)
            return res.status(400).send({ message: err });
        }

        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        // File uploaded successfully
        res.send({ message: 'File uploaded successfully!', file: req.file });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
