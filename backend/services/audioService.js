const freesoundService = require('./freesoundService');

const fetchSounds = async (query) => {
    return await freesoundService.fetchSounds(query);
}

module.exports = {
    fetchSounds,
};