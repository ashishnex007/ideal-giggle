const unsplashService = require('../../services/unsplashService');

const listImages = async (req, res) => {
    try {
        const images = await unsplashService.listImages({
            page: req.query.page,
            per_page: req.query.per_page,
            order_by: req.query.order_by
        });
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list images', errorInfo: error });
    }
}

const getImage = async (req, res) => {
    console.log("Getting image", req.params.id);
    try {
        const image = await unsplashService.fetchImage(req.params.id);
        res.json(image);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch image' });
    }
}

const searchImages = async (req, res) => {
    try {
        const images = await unsplashService.fetchImages({
            query: req.query.query,
            page: req.query.page,
            per_page: req.query.per_page,
            order_by: req.query.order_by,
            orientation: req.query.orientation
        });
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search images' });
    }
};

const incrementDownload = async (req, res) => {
    try {
        const { downloadLocation } = req.body;
        await unsplashService.incrementPhotoDownloads(downloadLocation);
        res.status(200).json({ message: 'Download recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    listImages,
    getImage,
    searchImages,
    incrementDownload
};