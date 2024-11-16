const { query } = require('express');
const { accessKey, secretKey, redirectURL, BASE_URL } = require('../config/unsplash');
const axios = require('axios');

const mapOrientation = (orientation) => {
    if (!orientation) return 'landscape';

    switch (orientation) {
        case 'landscape':
            return 'landscape';
        case 'portrait':
            return 'portrait';
        case 'square':
            return 'squarish';
        default:
            return 'landscape';
    }
}

const mapOrder = (order) => {
    if (!order) return 'latest';

    switch (order) {
        case 'latest':
            return 'latest';
        case 'popular':
            return 'relevant';
        default:
            return 'latest';
    }
}

const listImages = async (query) => {
    try {
        const response = await axios.get(
            BASE_URL + 'photos',
            {
                params: {
                    page: query.page,
                    per_page: query.per_page,
                    order_by: query.order_by
                },
                headers: {
                    Authorization: `Client-ID ${accessKey}`
                }
            }
        )

        return response.data;
    } catch (error) {
        console.error('Error fetching images from Unsplash:', error);
        throw error;
    }
}

const fetchImages = async (query) => {
    try {
        const response = await axios.get(
            BASE_URL + 'search/photos',
            {
                params: {
                    query: query.query,
                    page: query.page,
                    per_page: query.per_page,
                    order_by: mapOrder(query.order_by),       //! Accepted Values: latest, relevant
                    orientation: mapOrientation(query.orientation)  //! Accepted Values: landscape, portrait, squarish
                },
                headers: {
                    Authorization: `Client-ID ${accessKey}`
                }
            }
        )

        // return response.data;
        const photos = [];

        response.data['results'].map((result) => {
            photos.push({
                source: 'unsplash',
                id: result['id'],                               //! id of the photo
                urls: result['urls'],                           //! hotlinks of images as per guidelines
                links: result['links']['download_location'],    //! hotlinks to download as per guidelines
                user: result['user']                            //! user details for attribution
            });
        });

        return photos;
    } catch (error) {
        console.error('Error fetching images from Unsplash:', error);
        return [];
    }
}

const fetchImage = async (id) => {
    try {
        const response = await axios.get(
            BASE_URL + `photos/${id}`,
            {
                headers: {
                    Authorization: `Client-ID ${accessKey}`
                }
            });

        return response;
    } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
        throw error;
    }
}

// Endpoint to increment photo downloads as per unsplash guidelines
const incrementPhotoDownloads = async (downloadLocation) => {
    try {
        const [, photoId, ...queryParams] = downloadLocation.split('/');
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

        await axios.get(`${downloadLocation}${queryString}`, {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });
    } catch (error) {
        console.error(error.message);
        throw new Error('Error incrementing photo downloads', error);
    }
}

module.exports = {
    listImages,
    fetchImages,
    fetchImage,
    incrementPhotoDownloads
}