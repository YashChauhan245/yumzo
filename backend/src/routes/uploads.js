const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/uploads/image
router.post(
  '/image',
  authenticate,
  authorize('admin', 'restaurant_owner'),
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { imageUrl },
    });
  },
);

module.exports = router;
