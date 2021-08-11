import React, { useState } from 'react';
import ScreenCapture from '../../ScreenCapture';
import ScreenRecording from '../../ScreenRecording';
import './Popup.css';

const Popup = () => {
  const [imgSrc, setImgSrc] = useState('');

  const onFullScreenCapture = async () => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (image) => {
      // image: 64baseURL
      setImgSrc(image);
    });
  };

  const handleScreenCapture = (screenCapture) => {
    setImgSrc({
      screenCapture,
    });
  };

  return (
    <div className="App">
      <ScreenCapture onEndCapture={handleScreenCapture}>
        {({ onStartCapture, captureElementById }) => (
          <React.Fragment>
            <p id="capture">Start editing to see some magic happen :)</p>
            <button onClick={onFullScreenCapture} className="btn">
              Full Screen Capture
            </button>
            <button onClick={onStartCapture} className="btn">
              Selective Screen Capture
            </button>
            <button onClick={captureElementById} className="btn">
              Screen Capture by ID
            </button>
            {imgSrc && (
              <div style={{ width: '300px', height: '300px' }}>
                <img
                  src={imgSrc.screenCapture ? imgSrc.screenCapture : imgSrc}
                  alt="output"
                  width="100%"
                  height="100%"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
          </React.Fragment>
        )}
      </ScreenCapture>
      <ScreenRecording />
    </div>
  );
};

export default Popup;
