require('dotenv').config();

module.exports = {
    BASE_URL: 'https://api.unsplash.com/',
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    secretKey: process.env.UNSPLASH_SECRET_KEY,
    redirectURL: process.env.UNSPLASH_REDIRECT_URL
}