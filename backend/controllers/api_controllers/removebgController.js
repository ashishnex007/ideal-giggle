const removebgService = require('../../services/removebgService');

const removeBackground = async (req, res) => {
    try {
        const response = await removebgService.removeBackground({
            base64img: req.body.base64img,
            imageFile: req.body.imageFile,
            imageURL: req.body.imageURL,
            size: req.body.size,
            format: req.body.format
        });
        res.json(response);
    } catch (error) {
        console.error('Error removing background:', error);
        res.status(500).json({ error: 'Failed to remove background' });
    }
}

module.exports = {
    removeBackground
};