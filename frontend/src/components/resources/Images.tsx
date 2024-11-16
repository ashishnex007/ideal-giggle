import { useState, useEffect } from 'react';
import axios from 'axios';
import { DNA } from 'react-loader-spinner';

interface ImageUrls {
  regular?: string;
  medium?: string;
  full?: string;
  large?: string;
  [key: string]: string | undefined;
}

interface ImageUser {
  name: string;
}

interface ImageData {
  id: string;
  source: 'unsplash' | 'pixabay' | 'pexels';
  urls: ImageUrls;
  user: ImageUser;
  links?: {
    download_location: string;
  };
}

interface ImageFilters {
  query: string;
  orientation: 'all' | 'landscape' | 'portrait' | 'square';
  orderBy: 'latest' | 'popular';
  imageType: 'all' | 'photo' | 'illustration' | 'vector';
  page: number;
}

interface ImagesProps {
  filters: ImageFilters;
  fetchImages: boolean;
  toggleFetchImages: () => void;
  updateFilters: (filters: ImageFilters) => void;
}

function Images({ filters, fetchImages, toggleFetchImages, updateFilters }: ImagesProps) {
  const [data, setData] = useState<ImageData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    const getImages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<ImageData[]>(`${import.meta.env.VITE_API_URL}/api/images`, {
          params: filters
        });

        setData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    if (fetchImages) {
      getImages();
      toggleFetchImages();
    }
  }, [fetchImages, filters, toggleFetchImages]);

  const updateVisibleRange = (newPage: number) => {
    const rangeSize = 5;
    const halfRange = Math.floor(rangeSize / 2);

    let startPage = Math.max(newPage - halfRange, 1);
    setVisiblePages([...Array(rangeSize)].map((_, i) => startPage + i));
  };

  const changePage = (newPage: number) => {
    if (newPage !== filters.page) {
      updateFilters({ ...filters, page: newPage });
      toggleFetchImages();
    }
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    updateVisibleRange(newPage);
  };

  const openModal = (image: ImageData) => {
    console.log(image);
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  async function copyToClipboard(imgUrl: string) {
    try {
      const html = `<img src="${imgUrl}" alt="Image">`;
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ]);
      console.log('Image HTML copied.');
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  }

  async function downloadImage(imageSrc: string, id: string) {
    try {
      const image = await fetch(imageSrc);
      const imageBlob = await image.blob();
      const imageURL = URL.createObjectURL(imageBlob);

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }

  return (
    <div className="containerx">
      {isLoading && (
        <div className="loader-section">
          <div className="loader-section">
            <DNA
              visible={true}
              height={100}
              width={100}
              ariaLabel="dna-loading"
            />
          </div>
        </div>
      )}
      {!isLoading && !data && (
        <div className="loader-section">
          <p className="text-center text-xl md:text-3xl">Discover wide range of audios with a simple search</p>
        </div>
      )}
      {!isLoading && data && (
        <div className='images-container'>
          {data.map((image, index) => {
            if (image.source === 'unsplash') {
              return (
                <div
                  key={index}
                  className='image-container'
                  onClick={() => openModal(image)}
                >
                  <img src={image.urls.regular} alt={image.id} />
                  <p>by {image.user.name} from {image.source}</p>
                </div>
              );
            } else if (image.source === 'pixabay' || image.source === 'pexels') {
              return (
                <div
                  key={index}
                  className='image-container'
                  onClick={() => openModal(image)}
                >
                  <img src={image.urls.medium} alt={image.id} />
                  <p>by {image.user.name} from {image.source}</p>
                </div>
              );
            }
            return null;
          })}

          {isModalOpen && selectedImage && (
            <div className='modal'>
              <div className='modal-content'>
                <div className='modal-main-content'>
                  <div className='modal-image'>
                    <img src={selectedImage.urls.full || selectedImage.urls.medium} alt={selectedImage.id} />
                  </div>
                  <p>Image by <span>{selectedImage.user.name}</span> from <span>{selectedImage.source}</span></p>
                </div>

                <div className='modal-details-container'>
                  <p>Download</p>
                  <div className='modal-urls'>
                    {Object.entries(selectedImage.urls).map(([key, url]) => (
                      url && (
                        <button key={key} onClick={() => {
                          downloadImage(url, selectedImage.id);

                          if (selectedImage.source == "unsplash") {
                            console.log('Incrementing download count for Unsplash image', selectedImage.links);
                            axios.post(`${import.meta.env.VITE_API_URL}/api/unsplash/images/incrementDownload`, {
                              downloadLocation: selectedImage.links
                            })
                              .then(response => {
                                console.log(response.data.message);
                              })
                              .catch(error => {
                                console.error(error);
                              });
                          }
                        }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </button>
                      )
                    ))}
                  </div>
                  <div className='modal-details'>
                    <div className='modal-actions'>
                      <button onClick={() => selectedImage.urls.large && copyToClipboard(selectedImage.urls.large)}>
                        Copy to Clipboard
                      </button>
                      <button className='close-button' onClick={closeModal}>Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default Images;