import React, { useRef, useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const YouTubePlayer = ({ videoId, isRevealed, onReady, onEnd }) => {
  const [player, setPlayer] = useState(null);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const handleReady = (event) => {
    setPlayer(event.target);
    if (onReady) onReady(event.target);
  };

  const handleStateChange = (event) => {
    // 0 = ended
    if (event.data === 0 && onEnd) {
      onEnd();
    }
  };

  return (
    <div className="video-container" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000' }}>
      <YouTube 
        videoId={videoId} 
        opts={opts} 
        onReady={handleReady} 
        onStateChange={handleStateChange}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />
      
      {/* Overlay, które ukrywa/rozmazuje wideo podczas zgadywania */}
      <div 
        className="video-overlay" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backdropFilter: isRevealed ? 'blur(0px)' : 'blur(40px)',
          WebkitBackdropFilter: isRevealed ? 'blur(0px)' : 'blur(40px)',
          backgroundColor: isRevealed ? 'transparent' : 'rgba(15, 17, 26, 0.6)',
          transition: 'all 1s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        {!isRevealed && (
          <div className="music-waves" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out' }}></span>
            <span style={{ width: '8px', height: '40px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out 0.2s' }}></span>
            <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out 0.4s' }}></span>
          </div>
        )}
      </div>
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        iframe { pointer-events: none; }
      `}</style>
    </div>
  );
};

export default YouTubePlayer;
