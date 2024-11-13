const pixabayService = require('../../services/pixabayService');

const getImages = async (req, res) => {
    try {
        const images = await pixabayService.fetchImages({
            query: req.query.query,
            image_type: req.query.image_type,
            orientation: req.query.orientation,
            order: req.query.order_by,
            page: req.query.page,
            per_page: req.query.per_page
        });
        res.json(images);
    } catch (error) {
        console.error('Error fetching images from Pixabay:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
};

const getVideos = async (req, res) => {
    console.log(req.query);
    try {
        const videos = await pixabayService.fetchVideos({
            query: req.query.query,
            video_type: req.query.video_type,
            order_by: req.query.order_by,
            page: req.query.page,
            per_page: req.query.per_page
        });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};

module.exports = {
    getImages,
    getVideos
};