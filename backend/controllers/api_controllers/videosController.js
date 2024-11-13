const videoService = require('../../services/videoService'); 

const getVideos = async (req, res) => {
    try {
        const videos = await videoService.fetchVideos({
            query: req.query.query,
            orientation: req.query.orientation,
            size: req.query.size,
            order_by: req.query.orderBy,
            video_type: req.query.video_type,
            page: req.query.page,
            per_page: 8
        });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
}

module.exports = {
    getVideos
};