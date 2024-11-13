// importing fetchVideosFromUnsplash, fetchVideosFromPixabay, fetchVideosFromPexels using require

const pixabayService = require("./pixabayService");
const pexelsService = require("./pexelsService");

const fetchVideos = async (query) => {
    try {
        const Videos = await Promise.all([
            pixabayService.fetchVideos(query),
            pexelsService.fetchVideos(query)
        ]);

        const shuffleVideos = (Videos) => {
            const shuffledVideos = [...Videos];
            for (let i = shuffledVideos.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledVideos[i], shuffledVideos[j]] = [shuffledVideos[j], shuffledVideos[i]];
            }
            return shuffledVideos;
        }
        
        const shuffledVideos = shuffleVideos(Videos);
        return shuffledVideos.flat();
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
}

module.exports = {
    fetchVideos
};