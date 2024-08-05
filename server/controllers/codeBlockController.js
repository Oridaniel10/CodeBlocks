const CodeBlock = require('../models/codeBlockModel');

//for lobby
const getCodeBlocks = async (req, res) => {
    try {
        const codeBlocks = await CodeBlock.find();
        console.log('Fetched code blocks:', codeBlocks);
        res.json(codeBlocks);
    } catch (error) {
        console.error('Error fetching code blocks:', error);
        res.status(500).json({ message: error.message });
    }
};

//for each room
const getCodeBlockById = async (req, res) => {
    try {
        const codeBlock = await CodeBlock.findById(req.params.id);
        if (!codeBlock) return res.status(404).json({ message: 'Code block not found' });
        console.log('Fetched code block:', codeBlock);
        res.json(codeBlock);
    } catch (error) {
        console.error('Error fetching code block by ID:', error);
        res.status(500).json({ message: error.message });
    }
};

//function to update the code into mongodb when clicking save in the room
const updateCodeBlock = async (req, res) => {
    try {
        const { code } = req.body;
        const codeBlock = await CodeBlock.findByIdAndUpdate(req.params.id, { code }, { new: true });
        if (!codeBlock) return res.status(404).json({ message: 'Code block not found' });
        console.log('Updated code block:', codeBlock);
        res.json(codeBlock);
    } catch (error) {
        console.error('Error updating code block:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCodeBlocks,
    getCodeBlockById,
    updateCodeBlock
};
