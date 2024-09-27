import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import ScrollChillABI from "../util/ABIs/SCHILL.json";


export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const setupWeb3 = async () => {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const signer = web3Provider.getSigner();
        setSigner(signer);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(
          ScrollChillABI.address,
          ScrollChillABI.abi,
          signer
        );
        setContract(contractInstance);
      };
      setupWeb3();
    }
  }, []);

  return (
    <Web3Context.Provider value={{ provider, signer, contract, account }}>
      {children}
    </Web3Context.Provider>
  );
};
