import React, { useState, useEffect } from 'react';

import styles from './styles.css';
import AddNetworkKeplr from './AddNetworkKeplr.js';

const BLOCKSPACERACE_PARAMS = {
  chainId: "side-testnet-3",
  chainName: "Side-Testnet",
  rpc: "https://rpc.side-testnet.stake-take.com",
  rest:"https://api.side-testnet.stake-take.com"
  };


function WindowComponent() {
  const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const image = new Image();
        image.src = "/side.jpg";
        image.onload = () => {
            setImageLoaded(true);
            document.getElementById('loader').style.display = 'none'; 
        };
    }, []);

    if (!imageLoaded) {
        document.getElementById('loader').style.display = 'block'; 
    }

  return (

    
    <div className='content-wrapper'>
    <div className="container">
      <div className="frame"> 
       
      
      <img className="logo" src="/side.jpg" width="130px;"></img>
       <div className={styles.testnet}> <h1 ><span>FAUCET</span> side-testnet-3</h1></div>
       <div className={styles.testnet1}>  <h1 className={styles.testnet}>Side-protocol <span>Testnet</span> </h1>
        </div>
        <div className="button_container">
        <AddNetworkKeplr params={BLOCKSPACERACE_PARAMS} />
        </div>

       
        <div className="footer"><p> Built by Stake-Take <img src="https://stake-take.com/img/logo.svg" alt="Stake-Take" height="20" width="25"></img> </p>
          <p></p></div>
      </div></div>
    </div>
  );
}

export default WindowComponent;
