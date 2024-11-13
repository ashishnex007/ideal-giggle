import { useState, useEffect } from 'react';
import axios from 'axios';
import { DNA } from 'react-loader-spinner';
import { MdDownload } from 'react-icons/md';
import { MdAudiotrack } from "react-icons/md";

interface AudioPreviews {
  "preview-hq-mp3": string;
  "preview-hq-ogg": string;
}

interface AudioData {
  id: string;
  name: string;
  username: string;
  source: string;
  previews: AudioPreviews;
}

interface AudioFilters {
  query: string;
  page: number;
}

interface AudiosProps {
  filters: AudioFilters;
  fetchAudios: boolean;
  toggleFetchAudios: () => void;
  updateFilters: (filters: Partial<AudioFilters>) => void;
}

function Audios({ filters, fetchAudios, toggleFetchAudios, updateFilters }: AudiosProps) {
  const [data, setData] = useState<AudioData[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visiblePages, setVisiblePages] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    const getAudios = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<AudioData[]>(`${import.meta.env.VITE_API_URL}/api/audios`, {
          params: filters
        });

        setData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching audios:', error);
      }
    };

    if (fetchAudios) {
      getAudios();
      toggleFetchAudios();
    }
  }, [fetchAudios, filters, toggleFetchAudios]);

  const updateVisibleRange = (newPage: number) => {
    const rangeSize = 5;
    const halfRange = Math.floor(rangeSize / 2);

    let startPage = Math.max(newPage - halfRange, 1);
    setVisiblePages([...Array(rangeSize)].map((_, i) => startPage + i));
  };

  const changePage = (newPage: number) => {
    if (newPage !== filters.page) {
      updateFilters({ page: newPage });
      toggleFetchAudios();
    }
  };

  const handlePageChange = (newPage: number) => {
    changePage(newPage);
    updateVisibleRange(newPage);
  };

  const downloadAudio = (audioSrc: string, id: string) => {
    return async () => {
      try {
        const response = await fetch(audioSrc);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${id}.mp3`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading the audio:', error instanceof Error ? error.message : 'Unknown error');
      }
    };
  };

  return (
    <div className='containerx'>
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
        <div className="audio-gallery-container">
          {data.map((audio, index) => (
            <div key={index} className="audio-item">
              <MdAudiotrack className="audio-icon" />
              <div className="audio-details">
                <p className="audio-title">{audio.name}</p>
                <p className="audio-credit">by {audio.username} from {audio.source}</p>
              </div>
              <audio controls>
                <source src={audio.previews["preview-hq-mp3"]} type="audio/mpeg" />
                <source src={audio.previews["preview-hq-ogg"]} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
              <button className='audio-button' onClick={downloadAudio(audio.previews["preview-hq-mp3"], audio.id)}>
                <MdDownload className="download-icon" /> Download
              </button>
            </div>
          ))}
        </div>
      )}
      {!isLoading && data && (
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

export default Audios;