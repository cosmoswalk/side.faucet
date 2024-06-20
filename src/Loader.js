import React, { useEffect, useState } from 'react';
import './Loader.css';


function Loader({ onLoad }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      onLoad();
    }, 2000);
  }, [onLoad]);
  return loading ?(
    <div id="loader" className="loader">
    <div className="loading-text">
      <span className="loading-text-words">L</span>
      <span className="loading-text-words">O</span>
      <span className="loading-text-words">A</span>
      <span className="loading-text-words">D</span>
      <span className="loading-text-words">I</span>
      <span className="loading-text-words">N</span>
      <span className="loading-text-words">G</span>
    </div>
  </div>
  ): null;
}

export default Loader;





