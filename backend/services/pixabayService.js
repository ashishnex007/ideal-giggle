const axios = require('axios');
const { API_KEY, BASE_URL } = require('../config/pixabay');
const { param } = require('../routes/api_routers/pexelsRouter');

const mapOrientation = (orientation) => {

  if (!orientation) return 'all';

  switch (orientation) {
    case 'landscape':
      return 'horizontal';
    
    case 'portrait':
      return 'vertical';
    
    case 'square':
      return 'all';
    
    default:
      return 'all';
  }
};

const mapOrder = (order) => {
  if (!order) return 'popular';

  switch (order) {
    case 'latest':
      return 'latest';
    
    case 'popular':
      return 'popular';
    
    default:
      return 'popular';
  }
}

const mapImageType = (imageType) => {
  if (!imageType) return 'all';
  
  switch (imageType) {
    case 'photo':
      return 'photo';
    
    case 'illustration':
      return 'illustration';
    
    case 'vector':
      return 'vector';
    
    default:
      return 'all';
  }
}

const fetchImages = async (query) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query.query,
        image_type: mapImageType(query.image_type) || 'all',    //! Accepted Values: all, photo, illustration, vector
        orientation: mapOrientation(query.orientation) || 'all',  //! Accepted Values: all, horizontal, vertical
        order: mapOrder(query.order) || 'popular',          //! Accepted Values: popular, latest
        page: query.page || 1,
        per_page: query.per_page || 20
      }
    });

    const photos = [];

    response.data.hits.map((photo) => {
      photos.push({
        source: 'pixabay',
        id: photo.id,
        urls: {
          small: photo.webformatURL,
          medium: photo.webformatURL,
          large: photo.largeImageURL
        },
        user: {
          name: photo.user,
          profile: `https://pixabay.com/users/${photo.user}-${photo.user_id}/`
        }
      });
    });

    return photos;

  } catch (error) {
    if(error.resposne.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    }
    console.error('Error fetching images from Pixabay:', error);
    return [];
  }
};

// New function to fetch videos
const fetchVideos = async (query) => {
    try {
      const response = await axios.get(`${BASE_URL}videos/`, {
        params: {
          key: API_KEY,
          q: query.query,
          video_type: query.video_type || 'all',
          order: mapOrder(query.order_by),
          page: query.page || 1,
          per_page: query.per_page || 10
        }
      });

      const videos = [];

      response.data.hits.map((video) => {
        videos.push({
          source: 'pixabay',
          id: video.id,
          urls: {
            tiny: video.videos.tiny,
            small: video.videos.small,
            medium: video.videos.medium,
            large: video.videos.large,
          },
          user: {
            name: video.user,
            profile: `https://pixabay.com/users/${video.user}-${video.user_id}/`
          }
        });
      });

      return videos;
    } catch (error) {
      console.error('Error fetching videos from Pixabay:', error);
      return []; // return empty array if error
    }
  };

module.exports = {
  fetchImages,
  fetchVideos
};
