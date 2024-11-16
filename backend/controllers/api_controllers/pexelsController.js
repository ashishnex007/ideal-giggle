const pexelsService = require('../../services/pexelsService');

const getImages = async (req, res) => {
  try {
    const images = await pexelsService.fetchImages({
        query: req.query.query,
        orientation: req.query.orientation,
        page: req.query.page,
        per_page: req.query.per_page
    });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};

const getImage = async (req, res) => {
  try {
    const image = await pexelsService.fetchImage(req.params.id);
    res.json(image);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}

const getVideos = async (req, res) => {
  try {
    const videos = await pexelsService.fetchVideos({
        query: req.query.query,
        size: req.query.size,
        orientation: req.query.orientation,
        page: req.query.page,
        per_page: req.query.per_page
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
};

const getPopularVideos = async (req, res) => {
  try {
    const videos = await pexelsService.fetchPopularVideos({
        min_width: req.query.page,
        min_height: req.query.per_page,
        min_duration: req.query.min_duration,
        max_duration: req.query.max_duration,
        page: req.query.page,
        per_page: req.query.per_page,
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular videos' });
  }
};

const getVideo = async (req, res) => {
  try {
    const video = await pexelsService.fetchVideo(req.params.id);
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch video' });
  }
}

module.exports = {
  getImages,
  getImage,
  getVideos,
  getPopularVideos,
  getVideo
};
