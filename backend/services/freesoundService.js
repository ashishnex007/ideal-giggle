const axios = require('axios');
const {apiKey, baseUrl} = require('../config/freesound');

const fetchSounds = async (query) => {
    try {
        const response = await axios.get(baseUrl + "/search/text", {
        params: {
            token: apiKey,
            query: query.query,
            page: query.page,
            page_size: query.per_page,
            format: 'json',
            fields: 'id,name,previews,username,duration,tags'
        }
        });
    
        response.data.results.map(sound => {
            sound.source = "freesound";
            return sound;
        });
        return response.data.results;
    } catch (error) {
        console.error(error);
        return []
    }
};

const downloadSound = async (id) => {
    try {
        const response = await axios.get(baseUrl + "/sounds/" + id + "/download", {
            params: {
                token: apiKey
            }
        });
    
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    fetchSounds,
    downloadSound
};