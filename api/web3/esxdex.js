import { BrowserProvider, Contract, formatUnits, parseEther } from 'ethers';
import { contractABI, contractAddress } from './constants/pncaolympix';
import { getIsConnected, getProvider } from './walletconnect' 


async function getEthereumContract() {
  if (!getIsConnected()) return;

  const walletProvider = getProvider();
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const transactionContract = new Contract(contractAddress, contractABI, signer);

  return transactionContract;
}





async function payGas(amount) {
  return new Promise(async (resolve, reject) => {
      try {
          if (!getIsConnected()) reject({reason: 'Wallet not connected'});;
      
          const parsedAmount = parseEther(amount.toString())
    
          const contract = await  getEthereumContract();

          const options = {value: parsedAmount}
          const buyHash = await contract.gas(options)
      
          console.log("Loading started");
          console.log("Loading - ", buyHash.hash);
          await buyHash.wait();
          console.log("Loading successful - ", buyHash.hash);

          resolve({hash: buyHash}) 
      } catch (error) {
          console.log(error.action);
          reject(error)
      }

  })
}







export {
  payGas
}