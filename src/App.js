import React, { useState } from 'react';
import './App.css';
import { Hyphen, SIGNATURE_TYPES, RESPONSE_CODES } from "@biconomy/hyphen";

function App() {
const [hyphenItem, setHyphenItem] = useState(null);
const [address, setAddress] = useState('0xa9b4797f24cb31208915c95cf315bfb3637ceed0');
 const initHyphen = async (provider) => {
  let hyphen = new Hyphen(provider , {
    debug: true,
    environment: "prod",
    onFundsTransfered: (data) => {
      console.log("data", data);
    }
  });
  await hyphen.init();
  checkTransferStatus(hyphen);
  setHyphenItem(hyphen);
  return hyphen;
  }
  const connectMetaMask = () => {
    if(window.ethereum){
      window.ethereum.request({method:'eth_requestAccounts'})
    .then(res=>{
            setAddress((window.ethereum)[0]);
            initHyphen(window.ethereum);
            console.log(res) 
    })
    }else{
      alert("install metamask extension!!")
    }

  }

const checkTransferStatus = async (hyphenRun) => {
let preTransferStatus = await hyphenRun.depositManager.preDepositStatus({
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    amount: "1",
    fromChainId: "1",
    toChainId: "137",
    userAddress: address,
});

if (preTransferStatus.code === RESPONSE_CODES.OK) {
  console.log("all good", preTransferStatus);
  try {
    console.log("address", address);
  let transfer = await hyphenRun.depositManager.deposit({
    sender: address,
    receiver:"0x843bFB4fADA6058e882B23Da5F9A6e96dDEB8b15", 
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    depositContractAddress: preTransferStatus.depositContract,
    amount: "1",
    fromChainId: "1",
    toChainId: "137",
    useBiconomy: false
}, window.ethereum);
console.log("transfer", transfer);
} catch (err) {
  console.log("error", err);
}


} else if(preTransferStatus.code === RESPONSE_CODES.ALLOWANCE_NOT_GIVEN) {
  const infiniteApproval = false;
  const useBiconomy = false;
  const tokenAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const amount = "1";
  console.log("running inside this");
  const approveTx = await hyphenRun.tokens.approveERC20(tokenAddress, 
  preTransferStatus.depositContract, amount.toString(), address, 
  infiniteApproval, useBiconomy
  );
  console.log("trying to take the approval from users as well", approveTx);
  await approveTx.wait(2);
} 
else {
  console.log("preTransferStatus", preTransferStatus);
}
  };

  return (
    <div className="App">
      <header className="App-header">
       <button onClick={connectMetaMask}> connect metamask </button>
      </header>
    </div>
  );
}

export default App;
