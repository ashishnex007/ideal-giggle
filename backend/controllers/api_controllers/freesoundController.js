const freesoundService = require('../../services/freesoundService');

const getSounds = async (req, res) => {
    try {
        const sounds = await freesoundService.fetchSounds({
            query: req.query.query,
            page: req.query.page,
            per_page: 8
        });
        res.json(sounds);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sounds' });
    }
}

const downloadSound = async (req, res) => {
    try {
        const sound = await freesoundService.downloadSound(req.params.id);
        res.json(sound);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download sound' });
    }
}

module.exports = {
    getSounds,
    downloadSound
};