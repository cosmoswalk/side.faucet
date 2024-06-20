import React, { useState, useEffect } from 'react';

import Loader from './Loader.js';
import './Loader.css';
import WindowComponent from './Window.js';

function App() {
  const [showContent, setShowContent] = useState(false);

  const handleLoad = () => {
    setShowContent(true);
  };

  return (
    <div className="App">
      <Loader onLoad={handleLoad} />
      {showContent && <WindowComponent />}
    </div>
  );
}

export default App;

