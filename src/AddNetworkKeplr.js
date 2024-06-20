import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Keplr.css';
import Modal from 'react-modal';
import loader from './loader.gif';
import { ur, tag, urip } from './share.js';

const Loader = () => (
  <div>
    <img src={loader} width={40} alt="Loading..." />
  </div>
);

Modal.setAppElement('#root');

export default function AddNetworkKeplr({ params }) {
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ message: '', type: '' });
  const [serverError, setServerError] = useState('');
  const [balance, setBalance] = useState('');
  const [balanceData, setBalanceData] = useState(null);
  const [txhash, setTxhash] = useState(null);
  const [txHash, setTxHash] = useState('');

  const [responseMessage, setResponseMessage] = useState('');
  const [userIP, setUserIP] = useState('');

  async function getIPAddress() {
    try {
      const response = await fetch(urip);
      const data = await response.json();
      
      return data.ip;

    } catch (error) {

      return null;
    }
  }

 
  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  

  function openModal(message, type) {
    setModalMessage({ message, type });
    setModalIsOpen(true);
  }
  const closeModal = () => {
    setModalIsOpen(false);
    setLoading(false); 
  };

  async function disconnectKeplr() {
    setIsConnected(false);
    setWalletAddress('');
    localStorage.removeItem('walletAddress');
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500); 
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`https://api.side-testnet.stake-take.com/cosmos/bank/v1beta1/balances/${walletAddress}`);
      const data = await response.json();
      setBalanceData(data);
    };

    fetchData();
  }, [walletAddress]);




  const displayAmount = (balanceData) => {
    if (!balanceData || !balanceData.balances || balanceData.balances.length === 0) {
      return <div className="balance">Balance: 0 side</div>;
    }
  
    const amount = balanceData.balances[0].amount;
    const sum = Number(amount) / Math.pow(1, 18); 
  
    return <div className="balance">
      
      <div>
      Balance:  </div> 
      <div className='sum'>{sum} uside</div>   
  
      </div> ;
  };
  
  
  async function getAddress(params) {
    if (!window.keplr) {
      openModal('Please install keplr extension!', 'installExtension');
    } else {
      if (window.keplr.experimentalSuggestChain) {
        try {
          const chainId = params.chainId;

          await window.keplr.experimentalSuggestChain({
            chainId: chainId,
            chainName: params.chainName,
            rpc: params.rpc,
            rest: params.rest,
            bip44: {
              coinType: 118,
            },
            bech32Config: {
              bech32PrefixAccAddr: "bc",
              bech32PrefixAccPub: "bc" + "pub",
              bech32PrefixValAddr: "bc" + "valoper",
              bech32PrefixValPub: "bc" + "valoperpub",
              bech32PrefixConsAddr: "bc" + "valcons",
              bech32PrefixConsPub: "bc" + "valconspub",
            },
            currencies: [
              {
                coinDenom: "SIDE",
                coinMinimalDenom: "uside",
                coinDecimals: 6,
                coinGeckoId: "side",
              },
            ],
            feeCurrencies: [
              {
                coinDenom: "SIDE",
                coinMinimalDenom: "uside",
                coinDecimals: 6,
                coinGeckoId: "side",
                gasPriceStep: {
                  low: 0.01,
                  average: 0.025,
                  high: 0.04,
                },
              },
            ],
            stakeCurrency: {
              coinDenom: "SIDE",
              coinMinimalDenom: "uside",
              coinDecimals: 6,
              coinGeckoId: "side",
            },
          });

        } catch {
          alert("Failed to suggest the chain");
        }
      }

      try {
        const chainId = params.chainId;
        await window.keplr.enable(chainId);
        const offlineSigner = window.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        setBalanceData(balance);
        setWalletAddress(accounts[0].address);
        setErrorMessage(''); // Clear any previous error messages
        console.log('Wallet Address:', accounts[0].address);
        localStorage.setItem('walletAddress', accounts[0].address);
        setWalletError(''); // Clear any previous error messages
      } catch (error) {
        setWalletError('Error getting wallet address: ' + error);
      
        openModal('Error getting wallet address: ' + error);
      }
    }
  }

  async function getTokens() {
    setLoading(true);
    if (!walletAddress) {
      openModal('Please connect your wallet first!', 'error');
      setLoading(false);
      return;
    }
    try {
      const ipAddress = await getIPAddress();
      if (!ipAddress) {
        console.log("IP ADDRESS " + ipAddress);
        openModal('Please try again later.', 'error');
        setLoading(false);
        return;
      }
  
      const response = await axios.post(`https://side.faucet.stake-take.com/api/faucet/into`, {
        walletAddress,
        ipAddress
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_API_KEY
        }
      });
      if (response.status === 200) {
        
        console.log('Hash of transaction:       ' + response.data.txhash);

        setTxHash(response.data.txhash);


        openModal('Tokens successfully received!', 'success');
      } else {
        
       
        openModal(response.data.message, 'error');
       
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        openModal(error.response.data.message, 'error');
       
      } else {
        console.error("Error:", error.message);
        openModal('An unknown error occurred', 'error');
      }
    }
  }
  async function add() {
    if (walletAddress) {
      await disconnectKeplr();
    } else {
      await getAddress(params);
    }
  }

  function twit() {
    
    const twitterUsername1 = 'SideProtocol';
    const twitterUrl1 = `https://twitter.com/intent/follow?screen_name=${twitterUsername1}`;
    window.open(twitterUrl1, '_blank');
  }
  
  function twitSt() {
    const twitterUsername2 = 'StakeAndTake';
    const twitterUrl2 = `https://twitter.com/intent/follow?screen_name=${twitterUsername2}`;
    window.open(twitterUrl2, '_blank');
  }


  function txHashRef() {
    if (!txHash) {
      console.error("TxHash is not set");
      return;
    }
    const txhashRef = `https://testnet.ping.pub/side/tx/${txHash}`;
    window.open(txhashRef, '_blank');
  }
  

return (
    <div className="container">
    <button className="walletAddressButton" onClick={add}>
    {walletAddress ? 'Disconnect Keplr' : 'Connect Keplr'}
    </button>
    <button className="getTokens" onClick={getTokens}>
  {loading ? <Loader /> : 'Get Tokens'}
</button>

    
      <div className={`popup ${walletAddress ? 'show' : ''}`}>
      <div className="t_address">Wallet Address:</div>
      <div 
        className="_address"
        onClick={() => copyToClipboard(walletAddress)}
      >
        {walletAddress}
      </div>
      {isCopied && <div className="message_tooltip">Copied!😊</div>}

      <div className="balance">{balanceData ? displayAmount(balanceData) : 'Loading...'}</div>
      </div>
    
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="Modal" overlayClassName="modalOverlay">
  <div className="ModalContainer">
    <button className="closeButton" onClick={closeModal}>X</button>
    <p className="modalMessage">
      {modalMessage.type === 'installExtension' ? (
        <a
          href="https://keplr.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="modalMessage"
        >
          {modalMessage.message}
        </a>
      ) : (
        modalMessage.message || serverError
      )}
    </p>


    {modalMessage.message === 'Tokens successfully received!' &&  

   
    (
  <div className="modalButtons">
   
    <button className="Twit" onClick={twit}>
      <div className="text">
        <img src="https://stake-take.com/assets/twitter.svg" alt="Stake-Take" height="20" width="20"></img>
        Follow SIDE
      </div>
    </button>
    <button className="TwitSt" onClick={twitSt}>
      <div className="text">
        <img src="https://stake-take.com/assets/twitter.svg" alt="Stake-Take" height="20" width="20"></img>
      Follow Us
      </div>


    </button>


    <button className="TxHash" onClick={txHashRef}>
      <div className="text">
        <img src="https://testnet.ping.pub/assets/logo-fea46f13.svg" alt="Stake-Take" height="20" width="20"></img>
        Transaction🪐
      </div>


    </button>
    
  
  
  </div>


)}
  </div>
</Modal>
    </div>
);

    }
