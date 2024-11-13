import ComingSoonImage from '../assets/comingsoon.avif';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <img src={ComingSoonImage} alt="coming-soon" />
      <h1 className="coming-soon-text text-center">Coming Soon</h1>
      <p className="coming-soon-description text-sm px-4 text-center">We are working on something amazing. Stay tuned!</p>
      <button
        className="coming-soon-button"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  );
};

export default ComingSoon;