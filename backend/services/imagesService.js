// importing fetchImagesFromUnsplash, fetchImagesFromPixabay, fetchImagesFromPexels using require

const unsplashService = require("./unsplashService");
const pixabayService = require("./pixabayService");
const pexelsService = require("./pexelsService");

const fetchImages = async (query) => {
    try {
        const images = await Promise.all([
            unsplashService.fetchImages(query),
            pixabayService.fetchImages(query),
            pexelsService.fetchImages(query)
        ]);

        const shuffleImages = (images) => {
            const shuffledImages = [...images];
            for (let i = shuffledImages.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
            }
            return shuffledImages;
        }
        
        const shuffledImages = shuffleImages(images);
        return shuffledImages.flat();
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
}

module.exports = {
    fetchImages
};