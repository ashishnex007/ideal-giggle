const removebg = require('remove.bg');
const removebgConfig = require('../config/removebg');

const removeBackground = async (query) => {
    try {
        if (query.imageURL) {
            return await removeByURL(query);
        }
        else if (query.imageFile) {
            return await removeByFile(query);
        }
        else if (query.base64img) {
            return await removeByBase64(query);
        }
        else {
            throw new Error('Invalid query. Must provide imageURL, imageFile, or base64img');
        }
    }
    catch (error) {
        console.error('Error removing background:', error);
        throw error;
    }
}

const removeByURL = async (query) => {
    try {
        const response = await removebg.removeBackgroundFromImageUrl({
            imageURL: query.imageURL,
            apiKey: removebgConfig.API_KEY,
            size: query.size || 'regular',
            format: query.format || 'auto',
        });
        return response;
    }
    catch (error) {
        console.error('Error removing background:', error);
        throw error;
    }
}

const removeByFile = async (query) => {
    try {
        const response = await removebg.removeBackgroundFromImageFile({
            binaryFile: query.binaryFile,
            apiKey: removebgConfig.API_KEY,
            size: query.size || 'regular',
            format: query.format || 'auto',
        });
        return response;
    }
    catch (error) {
        console.error('Error removing background:', error);
        throw error;
    }
}

const removeByBase64 = async (query) => {
    try {
        const response = await removebg.removeBackgroundFromImageBase64({
            base64img: query.base64img,
            apiKey: removebgConfig.API_KEY,
            size: query.size || 'regular',
            format: query.format || 'auto',
        });
        return response;
    }
    catch (error) {
        console.error('Error removing background:', error);
        throw error;
    }
}

module.exports = {
    removeBackground
};
