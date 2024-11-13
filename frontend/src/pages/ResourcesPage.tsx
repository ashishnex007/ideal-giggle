import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { FaFilter } from 'react-icons/fa';

import Images from '../components/resources/Images';
import Videos from '../components/resources/Videos';
import Audios from '../components/resources/Audios';
import GenerativeTools from '../components/resources/GenerativeTools';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/hooks/store';

interface ResourcesPageProps {}

interface ImageFilters {
    query: string;
    orientation: 'all' | 'landscape' | 'portrait' | 'square';
    orderBy: 'latest' | 'popular';
    imageType: 'all' | 'photo' | 'illustration' | 'vector';
    page: number;
}

interface VideoFilters {
    query: string;
    orientation: 'all' | 'landscape' | 'portrait' | 'square'; 
    size: 'large' | 'medium' | 'small';
    orderBy: 'latest' | 'popular';
    video_type: 'all' | 'film' | 'animation';
    page: number;
}

interface AudioFilters {
    query: string;
    page: number;
}

interface FilterDropdownProps {
    imageFilters: ImageFilters;
    handleFilterChange: (filterName: string, value: any) => void;
    handleApplyImageFilter: () => void;
}

interface VideoFilterProps {
    videoFilters: VideoFilters;
    handleFilterChange: (filterName: string, value: any) => void;
    handleApplyVideoFilter: () => void;
}

function ResourcesPage({}: ResourcesPageProps) {
    const navigate = useNavigate();
    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(()=> {
        if(!token){
          navigate("/login");
        }
    }, [token]);

    const [selectedTag, setSelectedTag] = useState<'Images' | 'Videos' | 'Audios'>('Images');
    const tags: ('Images' | 'Videos' | 'Audios')[] = ['Images', 'Videos', 'Audios'];
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [fetchImages, setFetchImages] = useState(false);
    const [fetchVideos, setFetchVideos] = useState(false);
    const [fetchAudios, setFetchAudios] = useState(false);

    const [imageFilters, setImageFilters] = useState<ImageFilters>({
        query: "",
        orientation: "all",
        orderBy: "latest",
        imageType: "all",
        page: 1
    });

    const [videoFilters, setVideoFilters] = useState<VideoFilters>({
        query: '',
        orientation: "all",
        size: "medium",
        orderBy: "latest",
        video_type: "all",
        page: 1
    })

    const [audioFilters, setAudioFilters] = useState<AudioFilters>({
        query: "",
        page: 1
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(selectedTag === 'Images') {
            setImageFilters({
                ...imageFilters,
                query: e.target.value
            });
        } else if(selectedTag === 'Videos') {
            setVideoFilters({
                ...videoFilters,
                query: e.target.value
            });
        } else if(selectedTag === 'Audios') {
            setAudioFilters({
                ...audioFilters,
                query: e.target.value
            });
        }
    }

    const updateFilters = (newFilters: Partial<ImageFilters | VideoFilters | AudioFilters>) => {
        if(selectedTag === 'Images') {
            setImageFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters, // Merge new filters with old ones
            }));
        } else if(selectedTag === 'Videos') {
            setVideoFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters, // Merge new filters with old ones
            }));
        } else if(selectedTag === 'Audios') {
            setAudioFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters, // Merge new filters with old ones
            }));
      };    
    }

    const handleFilterChange = (filterName: string, value: any) => {
        if(selectedTag === 'Images') {
            setImageFilters({
                ...imageFilters,
                [filterName]: value
            });
        } else if(selectedTag === 'Videos') {
            setVideoFilters({
                ...videoFilters,
                [filterName]: value
            });
        } else if(selectedTag === 'Audios') {
            setAudioFilters({
                ...audioFilters,
                [filterName]: value
            });
        }
    }

    const toggleFilterDropdown = () => {
        setFilterDropdownOpen(!filterDropdownOpen);
    }

    const handleTagClick = (tag: 'Images' | 'Videos' | 'Audios') => {
        setSelectedTag(tag);
    }

    const handleSearchButton = () => {
        if(selectedTag === 'Images') {
            setFetchImages(true);
            setFetchVideos(false); 
            setFetchAudios(false);
        } else if(selectedTag === 'Videos') {
            setFetchVideos(true);
            setFetchImages(false);
            setFetchAudios(false);
        } else if(selectedTag === 'Audios') {
            setFetchAudios(true);
            setFetchImages(false);
            setFetchVideos(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            handleSearchButton();
        }
    }

    return (
        <div className='homepage-container'>
            <div className="py-4 md:px-0" />
            <div className="gradient-box">
                <h1 className="md:text-3xl text-xl text-white font-bold md:pb-4">Creator Copilot Resources</h1>
                <div className="search-bar max-h-[2rem] md:max-h-max">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for tools, assets, and projects"
                        value={
                            selectedTag === 'Images' ? imageFilters.query
                            : selectedTag === 'Videos' ? videoFilters.query
                            : audioFilters.query
                        }
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                    />

                    <FaSearch className="search-icon" onClick = {handleSearchButton} color='#1a1a1a'/>
                </div>

                <div className="tags-filter-container flex flex-col md:flex-row">
                    <div className="tags-container">
                        {tags.map(tag => (
                            <button
                                key={tag}
                                className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {
                        selectedTag !== 'Audios' && <div className="filter-dropdown-container">
                            <button className="filter-button" onClick={toggleFilterDropdown}>
                                <FaFilter className="filter-icon" /> Add filter
                            </button>
                            {filterDropdownOpen && selectedTag === "Images" && <ImageFilters imageFilters={imageFilters} handleFilterChange={handleFilterChange} handleApplyImageFilter={handleSearchButton} /> }
                            {filterDropdownOpen && selectedTag === "Videos" && <VideoFilters videoFilters={videoFilters} handleFilterChange={handleFilterChange} handleApplyVideoFilter={handleSearchButton} /> }
                        </div>
                    }
                </div>
            </div>

            <GenerativeTools />

            <div>
                {(() => {
                    switch (selectedTag) {
                        case 'Images':
                            return <Images filters={imageFilters} fetchImages={fetchImages} updateFilters = {updateFilters} toggleFetchImages={() => setFetchImages(prev => !prev)}/>;
                        case 'Videos':
                            return <Videos filters={videoFilters} fetchVideos={fetchVideos} updateFilters = {updateFilters} toggleFetchVideos={() => setFetchVideos(prev => !prev)}/>;
                        case 'Audios':
                            return <Audios filters={audioFilters} fetchAudios={fetchAudios} updateFilters = {updateFilters} toggleFetchAudios={() => setFetchAudios(prev => !prev)}/>;
                        default:
                            return <Images filters={imageFilters} fetchImages={fetchImages} updateFilters = {updateFilters} toggleFetchImages={() => setFetchImages(prev => !prev)}/>; 
                    }
                })()}
            </div>
        </div>
    )
}

export function ImageFilters(props: FilterDropdownProps) {
    const { imageFilters, handleFilterChange, handleApplyImageFilter } = props;
    return (
        <div className="filter-dropdown">
            <div className="filter-category">
                <label>Orientation</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={imageFilters.orientation === 'landscape'}
                            onChange={() => handleFilterChange('orientation', 'landscape')}
                        /> Landscape
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={imageFilters.orientation === "portrait"}
                            onChange={() => handleFilterChange('orientation', 'portrait')}
                        /> Portrait
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={imageFilters.orientation === "square"}
                            onChange={() => handleFilterChange('orientation', 'square')}
                        /> Square
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={imageFilters.orientation === "all"}
                            onChange={() => handleFilterChange('orientation', 'all')}
                        /> All
                    </label>
                </div>
            </div>

            <div className="filter-category">
                <label>Order by</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name='orderBy'
                            checked={imageFilters.orderBy === "latest"}
                            onChange={() => handleFilterChange('orderBy', 'latest')}
                        /> Latest
                    </label>
                    <label>
                        <input
                            type="radio"
                            name='orderBy'
                            checked={imageFilters.orderBy === "popular"}
                            onChange={() => handleFilterChange('orderBy', 'popular')}
                        /> Popular
                    </label>
                </div>
            </div>

            <div className="filter-category">
                <label>Image type</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name='imageType'
                            checked={imageFilters.imageType === "all"}
                            onChange={() => handleFilterChange('imageType', 'all')}
                        /> All
                    </label>
                    <label>
                        <input
                            type="radio"
                            name='imageType'
                            checked={imageFilters.imageType === "photo"}
                            onChange={() => handleFilterChange('imageType', 'photo')}
                        /> Photo
                    </label>
                    <label>
                        <input
                            type="radio"
                            name='imageType'
                            checked={imageFilters.imageType === "illustration"}
                            onChange={() => handleFilterChange('imageType', 'illustration')}
                        /> Illustration
                    </label>
                    <label>
                        <input
                            type="radio"
                            name='imageType'
                            checked={imageFilters.imageType === "vector"}
                            onChange={() => handleFilterChange('imageType', 'vector')}
                        /> Vector
                    </label>
                </div>
            </div>

            <button className="apply-filter-button" onClick={handleApplyImageFilter}>Apply filter</button>
        </div>
    )
}

export function VideoFilters(props: VideoFilterProps){
    const { videoFilters, handleFilterChange, handleApplyVideoFilter } = props;
    return (
        <div className="filter-dropdown">
            <div className="filter-category">
                <label>Orientation</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={videoFilters.orientation === 'landscape'}
                            onChange={() => handleFilterChange('orientation', 'landscape')}
                        /> Landscape
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={videoFilters.orientation === 'portrait'}
                            onChange={() => handleFilterChange('orientation', 'portrait')}
                        /> Portrait
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="orientation"
                            checked={videoFilters.orientation === 'square'}
                            onChange={() => handleFilterChange('orientation', 'square')}
                        /> Square
                    </label>                                      
                </div>

                <label>Order By</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name="OrderBy"
                            checked={videoFilters.orderBy === 'latest'}
                            onChange={() => handleFilterChange('orderBy', 'latest')}
                        /> Latest
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="OrderBy"
                            checked={videoFilters.orderBy === 'popular'}
                            onChange={() => handleFilterChange('orderBy', 'popular')}
                        /> Popular
                    </label> 
                </div>

                <label>Video Type</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name="Video Type"
                            checked={videoFilters.video_type === 'film'}
                            onChange={() => handleFilterChange('video_type', 'film')}
                        /> Film
                    </label>                                  
                    <label>
                        <input
                            type="radio"
                            name="Video Type"
                            checked={videoFilters.video_type === 'animation'}
                            onChange={() => handleFilterChange('video_type', 'animation')}
                        /> Animation
                    </label>                                  
                    <label>
                        <input
                            type="radio"
                            name="Video Type"
                            checked={videoFilters.video_type === 'all'}
                            onChange={() => handleFilterChange('video_type', 'all')}
                        /> All
                    </label>                                  
                </div>

                <label>Size</label>
                <div className="filter-options">
                    <label>
                        <input
                            type="radio"
                            name="Size"
                            checked={videoFilters.size === 'large'}
                            onChange={() => handleFilterChange('size', 'large')}
                        /> Large
                    </label>                                  
                    <label>
                        <input
                            type="radio"
                            name="Size"
                            checked={videoFilters.size === 'medium'}
                            onChange={() => handleFilterChange('size', 'medium')}
                        /> Medium
                    </label>                                  
                    <label>
                        <input
                            type="radio"
                            name="Size"
                            checked={videoFilters.size === 'small'}
                            onChange={() => handleFilterChange('size', 'small')}
                        /> Small
                    </label>                                  
                </div>

                <button className="apply-filter-button" onClick={handleApplyVideoFilter}>Apply filter</button>
            </div>
        </div>
    )
}

export default ResourcesPage;