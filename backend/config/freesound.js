require('dotenv').config();

module.exports = {
    apiKey: process.env.FREESOUND_API_KEY,
    baseUrl: 'https://freesound.org/apiv2',
};