// services/pexelsService.js

const { API_KEY, BASE_URL } = require('../config/pexels');
const axios = require('axios');


const mapOrientation = (orientation) => {
  if (!orientation) return undefined;

  switch (orientation) {
    case 'landscape':
      return 'landscape';
    case 'portrait':
      return 'portrait';
    case 'square':
      return 'square';
    default:
      return undefined;
  }
};

const mapSizeVideo = (size) => {
  if (!size) return undefined;

  switch (size) {
    case 'large':
      return 'large';
    case 'medium':
      return 'medium';
    case 'small':
      return 'small';
    default:
      return undefined;
  }
}

// Pexels Image Service using client
const fetchImages = async (query) => {
  try{
    const response = await axios.get(`${BASE_URL}/search`, {
      headers: {
        Authorization: API_KEY
      },
      params: {
        query: query.query,
        orientation: mapOrientation(query.orientation),   //! Accepted Values: landscape, portrait, square
        page: query.page,
        per_page: query.per_page
      }
    });

    const photos = [];

    response.data.photos.map((photo) => {
      photos.push({
        source: 'pexels',
        id: photo.id,
        urls: photo.src,
        user: {
          name: photo.photographer,
          profile: photo.photographer_url
        }
      });
    });

    return photos;
  }catch(error){
    console.error('Error fetching images from Pexels:', error);
    return []; //! Return empty array if error
  }
};

// Fetch a single image
const fetchImage = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/photos/${id}`, {
      headers: {
        Authorization: API_KEY
      }
    });
    return response.data.photo;
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    throw error;
  }
};

// Pexels Video Service
const fetchVideos = async (query) => {
  try {
    const response = await axios.get(`https://api.pexels.com/videos/search`, {
      headers: {
        Authorization: API_KEY
      },
      params: {
        query: query.query,
        orientation: mapOrientation(query.orientation),   //! Accepted Values: landscape, portrait, square
        size: mapSizeVideo(query.size),   //! Accepted Values: large, medium, small
        page: query.page,
        per_page: query.per_page
      }
    });

    const videos = [];

    response.data.videos.map((video) => {
      videos.push({
        source: 'pexels',
        id: video.id,
        urls: video.video_files,
        user: {
          name: video.user.name,
          profile: video.user.url
        }
      });
    });

    return videos;
  }
  catch(error){
    console.error('Error fetching videos from Pexels:', error);
    return []; //! Return empty array if error
  }
}

const fetchPopularVideos = async (query) => {
  try{
    const response = await client.videos.popular({...query});
    return response.videos;
  }
  catch(error){
    console.error('Error fetching popular videos from Pexels:', error);
    throw error;
  }
}

const fetchVideo = async (id) => {
  try {
    const response = await client.videos.show({ id });
    return response.video;
  } catch (error) {
    console.error('Error fetching video from Pexels:', error);
    throw error;
  }
}

module.exports = {
  fetchImages,
  fetchImage,
  fetchVideos,
  fetchPopularVideos,
  fetchVideo
};
