import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import textToImage from '../../assets/TextToImage.jpg';
import lipSync from '../../assets/LipSync.jpg';
import removeBackground from '../../assets/RemoveBackground.jpg';
import imageToVideo from '../../assets/ImageToVideo.jpg';
import generativeAudio from '../../assets/GenerativeAudio.jpg';
import textToSpeech from '../../assets/TextToSpeech.jpg';
import videoToVideo from '../../assets/VideoToVideo.jpg';
import scriptWriter from '../../assets/ScriptWriter.jpg';

import { useNavigate } from 'react-router-dom';

function GenerativeTools() {
    const init_tools = [
        {
            id: 4,
            title: 'Text to Image',
            description: 'Generate images from text descriptions using our Text to Image tool.',
            image: textToImage,
            buttonText: 'Explore Text to Image'
        },
        {
            id: 5,
            title: 'Background Remover',
            description: 'Remove backgrounds from images effortlessly with our Background Remover tool.',
            image: removeBackground,
            buttonText: 'Explore Background Remover'
        },
        {
            id: 6,
            title: 'Lip Sync',
            description: 'Create lip-synced videos easily with our Lip Sync tool.',
            image: lipSync,
            buttonText: 'Explore Lip Sync'
        },
        {
            id: 7,
            title: 'Image to Video',
            description: 'Convert images to videos with our Image to Video tool.',
            image: imageToVideo,
            buttonText: 'Explore Image to Video'
        },
        {
            id: 8,
            title: 'Generative Audio',
            description: 'Generate audio tracks using our Generative Audio tool.',
            image: generativeAudio,
            buttonText: 'Explore Generative Audio'
        },
        {
            id: 9,
            title: 'Text to Speech',
            description: 'Convert text to speech using our Text to Speech tool.',
            image: textToSpeech,
            buttonText: 'Explore Text to Speech'
        },
        {
            id: 10,
            title: 'Video to Video',
            description: 'Convert videos to other formats with our Video to Video tool.',
            image: videoToVideo,
            buttonText: 'Explore Video to Video'
        },
        {
            id: 11,
            title: 'Script Writer',
            description: 'Generate scripts for videos, podcasts, and more with our Script Writer tool.',
            image: scriptWriter,
            buttonText: 'Explore Script Writer'
        }
    ]
    const [tools, setTools] = useState(init_tools);

    const fetchMoreData = () => {
        setTools((prevTools) => [...prevTools, ...init_tools]);
    }

    const navigate = useNavigate();

    return (
        <div className='cards-section'>
            <h2 className="generative-tools-header">Generative Tools</h2>
            <InfiniteScroll
                dataLength={tools.length}
                next={() => fetchMoreData()}
                hasMore={true}
                scrollableTarget="scrollable-div"
                horizontal={true}
                className="infinitescroll-container"
            >
                <div className="generative-tools-scroll-container" id="scrollable-div">
                    <div className="generative-tools-grid">
                        {tools.map((tool, index) => (
                            <div key={index} className="tool-card" onClick={() =>
                                navigate(`/coming-soon`)
                            }>
                                <img src={tool.image} alt={tool.title} className="tool-card-image" />
                                <div className="tool-card-text">
                                    <h3 className="tool-card-title">{tool.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </InfiniteScroll>
        </div>
    );
}

export default GenerativeTools;
