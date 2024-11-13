const audioService = require('../../services/audioService'); 

const getAudios = async (req, res) => {
    try {
        const audios = await audioService.fetchSounds({
            query: req.query.query,
            page: req.query.page,
            per_page: 8
        });
        res.json(audios);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
}

module.exports = {
    getAudios,
};