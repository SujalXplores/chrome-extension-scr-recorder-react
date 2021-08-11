import React from 'react';
import './Panel.css';

const Panel = () => {
  const a = () => {
    chrome.tabs.getZoom((num) => {
      console.trace(num);
    });
  };
  return (
    <div className="container">
      <h1>Dev Tools Panel</h1>
      <button className="btn" onClick={a}>
        Screen capture
      </button>
      <button className="btn">Screen capture by ID</button>
    </div>
  );
};

export default Panel;
