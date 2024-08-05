const express = require('express');
const router = express.Router();
const { getCodeBlocks, getCodeBlockById, updateCodeBlock } = require('../controllers/codeBlockController');

// Define routes
router.get('/', getCodeBlocks);
router.get('/:id', getCodeBlockById);
router.put('/:id', updateCodeBlock);

module.exports = router;
