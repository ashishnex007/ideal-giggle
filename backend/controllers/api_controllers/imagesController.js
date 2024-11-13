const imagesService = require('../../services/imagesService'); 

const getImages = async (req, res) => {
    try {
        const images = await imagesService.fetchImages({
            query: req.query.query,
            orientation: req.query.orientation,
            order_by: req.query.order_by,
            image_type: req.query.image_type,
            page: req.query.page,
            per_page: 8
        });
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
}

module.exports = {
    getImages
};