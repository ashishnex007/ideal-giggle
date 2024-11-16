import { useState, useEffect } from 'react';
import axios from 'axios';
import { DNA } from 'react-loader-spinner';

interface PixabayVideoUrl {
  url: string;
  width: number;
  height: number;
  size: number;
  thumbnail?: string;
}

interface PixabayVideoUrls {
  [key: string]: PixabayVideoUrl;
  tiny: PixabayVideoUrl;
  medium: PixabayVideoUrl;
}

interface PexelsVideoUrl {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

interface VideoUser {
  name: string;
}

interface BaseVideoData {
  id: string;
  user: VideoUser;
  source: 'pixabay' | 'pexels';
}

interface PixabayVideo extends BaseVideoData {
  source: 'pixabay';
  urls: PixabayVideoUrls;
}

interface PexelsVideo extends BaseVideoData {
  source: 'pexels';
  urls: PexelsVideoUrl[];
}

type VideoData = PixabayVideo | PexelsVideo;

interface VideoFilters {
  query: string;
  orientation: 'all' | 'landscape' | 'portrait' | 'square'; 
  size: 'large' | 'medium' | 'small';
  orderBy: 'latest' | 'popular';
  video_type: 'all' | 'film' | 'animation';
  page: number;
}

interface VideosProps {
  filters: VideoFilters;
  fetchVideos: boolean;
  toggleFetchVideos: () => void;
  updateFilters: (filters: Partial<VideoFilters>) => void;
}

function Videos({ filters, fetchVideos, toggleFetchVideos, updateFilters }: VideosProps) {
  const [data, setData] = useState<VideoData[] | null>(null);
  const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = (video: VideoData) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const getVideos = async () => {
      console.log("fetching videos with filters", filters);
      try {
        setIsLoading(true);
        const response = await axios.get<VideoData[]>(`${import.meta.env.VITE_API_URL}/api/videos`, {
          params: filters
        });

        setData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    if (fetchVideos) {
      getVideos();
      toggleFetchVideos();
    }
  }, [fetchVideos, filters, toggleFetchVideos]);

  const updateVisibleRange = (newPage: number) => {
    const rangeSize = 5;
    const halfRange = Math.floor(rangeSize / 2);

    let startPage = Math.max(newPage - halfRange, 1);
    setVisiblePages([...Array(rangeSize)].map((_, i) => startPage + i));
  };

  const changePage = (newPage: number) => {
    if (newPage !== filters.page) {
      updateFilters({ page: newPage });
      toggleFetchVideos();
    }
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    updateVisibleRange(newPage);
  };

  const downloadVideo = async (videoSrc: string, id: string) => {
    try {
      const response = await fetch(videoSrc);
      if (!response.ok) throw new Error('Network response was not ok');

      let blob = await response.blob();

      if (!blob.type) {
        blob = new Blob([blob], { type: 'video/mp4' });
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.style.display = 'none';
      a.href = url;
      a.download = `video-${id}.mp4`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading the video:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className="containerx">
      {isLoading && (
        <div className="loader-section">
          <DNA
            visible={true}
            height={100}
            width={100}
            ariaLabel="dna-loading"
          />
        </div>
      )}
      {!isLoading && !data && (
        <div className="loader-section">
          <p className="text-center text-xl md:text-3xl">Discover wide range of audios with a simple search</p>
        </div>
      )}
      {!isLoading && data && (
        <div className='video-gallery-container'>
          {data.map((video, index) => {
            if (video.source === 'pixabay') {
              return (
                <div
                  key={index}
                  className='video-item'
                  onClick={() => { }}
                >
                  <video
                    src={video.urls.tiny.url}
                    controls
                    preload="metadata"
                    playsInline
                    muted
                    loop
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(video);
                    }}
                  />
                  <p className='video-credit'>by {video.user.name} from {video.source}</p>
                </div>
              );
            } else if (video.source === 'pexels') {
              return (
                <div
                  key={index}
                  className='video-item'
                  onClick={() => { }}
                >
                  <video
                    src={video.urls[2].link}
                    controls
                    preload="metadata"
                    playsInline
                    muted
                    loop
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(video);
                    }}
                  />
                  <p className='video-credit'>by {video.user.name} from {video.source}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      {isModalOpen && selectedVideo && (
        <div className='modal'>
          <div className='modal-content'>
            <div className='modal-main-content'>
              <div className='modal-image'>
                <video
                  src={selectedVideo.source === "pixabay"
                    ? (selectedVideo as PixabayVideo).urls.medium.url
                    : (selectedVideo as PexelsVideo).urls[2].link}
                  controls
                  preload="metadata"
                  playsInline
                  muted
                  loop
                />
              </div>
              <p>Video by <span>{selectedVideo.user.name}</span> from <span>{selectedVideo.source}</span></p>
            </div>

            <div className='modal-details-container'>
              <p>Download</p>
              <div className='modal-urls'>
                {selectedVideo.source === "pixabay" &&
                  Object.entries((selectedVideo as PixabayVideo).urls).map(([key, url]) => (
                    <button key={key} onClick={() => downloadVideo(url.url, selectedVideo.id)}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}

                {selectedVideo.source === "pexels" &&
                  (selectedVideo as PexelsVideo).urls.map((url, index) => (
                    <button key={index} onClick={() => downloadVideo(url.link, selectedVideo.id)}>
                      {url.width}x{url.height}
                    </button>
                  ))}
              </div>
              <div className='modal-details'>
                <div className='modal-actions'>
                  <button className='close-button' onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {data && !isLoading && (
        <div className="pagination">
          <button
            className="page-nav"
            onClick={() => handlePageChange(Math.max(filters.page - 1, 1))}
            disabled={filters.page === 1}
          >
            Previous
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {visiblePages.map((page) => (
              <button
                key={page}
                className={`page ${filters.page === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="page-nav"
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Videos;