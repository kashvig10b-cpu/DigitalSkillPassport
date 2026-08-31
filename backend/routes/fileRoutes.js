const express = require('express');
const router = express.Router();
const { FileAttachment } = require('../models');

// GET /api/files/:id or /api/files/:id/:filename
router.get('/:id/:filename?', async (req, res) => {
  try {
    const file = await FileAttachment.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ status: 'error', message: 'Document not found' });
    }

    res.set({
      'Content-Type': file.mimetype || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.originalname || file.filename}"`,
      'Content-Length': file.size || (file.data ? file.data.length : undefined),
      'Cache-Control': 'public, max-age=31536000',
    });

    res.send(file.data);
  } catch (error) {
    console.error('[File Route - Error]', error);
    res.status(500).json({ status: 'error', message: 'Error retrieving document' });
  }
});

module.exports = router;
