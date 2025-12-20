import { BrowserProvider, Contract, formatUnits, parseEther, JsonRpcProvider } from 'ethers';
import { contractABI, contractAddress } from './constants/unifake';
import { getAddress, getIsConnected, getProvider } from './walletconnect' 


async function getEthereumContract() {
  if (!getIsConnected()) return;

  const walletProvider = getProvider();
  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const transactionContract = new Contract(contractAddress, contractABI, signer);

  return transactionContract;
}



const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function getBalance() {
  const ALCHEMY_RPC = "https://unichain-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj";

  const provider = new JsonRpcProvider(ALCHEMY_RPC);
  const tokenContract = new Contract(contractAddress, ERC20_ABI, provider);

  const [rawBalance, decimals, symbol] = await Promise.all([
    // tokenContract.balanceOf("0xb2e85090cBb09C9F508D39Db55f996F364281c62"),
    // tokenContract.balanceOf("0xF2F9dC678555d0DFb65981a1Bf35702FcC9a5CDE"),
    tokenContract.balanceOf(getAddress()),
    tokenContract.decimals(),
    tokenContract.symbol()
  ]);

  // Format balance
  // const balance = Number(rawBalance) / 10 ** decimals;
  const balance = formatUnits(rawBalance, decimals);
  return balance;
}




// async function getBalance() {
//   return new Promise(async (resolve, reject) => {
//     try {
//       if (!getIsConnected()) {
//         reject({reason: 'Wallet not connected'})
//         return;
//       };
//       const contract = await getEthereumContract();
//       let balance = await contract.balanceOf(getAddress());
//       console.log("balancecghchcgfhcf", balance)
//       balance = parseInt(balance) / (10 ** 18)
//       resolve(balance);
//     } catch (error) {
//       reject(error)
//     }  
//   })
// }



async function transferTokens(amount) {
  return new Promise(async (resolve, reject) => {
      try {
        if (!getIsConnected()) {
          reject({reason: 'Wallet not connected'})
          return;
        };
        const tokenContract = await getEthereumContract();
        const parsedAmount = parseEther(amount.toString())
        await tokenContract.transfer(contractAddress, parsedAmount)
        resolve();
      } catch (error) {
        console.log(error);
        reject(error)
      }
  })
}


async function getAllTransactions() {
  return new Promise(async (resolve, reject) => {
    try {

      if (!getIsConnected()) reject({reason: 'Wallet not connected'});
      const contract = await getEthereumContract();
      const transactions = await contract.getAllTransactions();
  
      const structuredTransactions = transactions?.map(item => ({
        address: item.purchaser,
        dateCreated: new Date(parseInt(item.timestamp) * 1000).toLocaleString(),
        amount_eth: parseInt(item.value) / (10 ** 18),
        amount_token: parseInt(item.amount) / (10 ** 18),
        token_name: "Olympix"
      }))
      resolve(structuredTransactions);

    } catch (error) {
      console.log(error);
      resolve([])
    }
  })

} 



export {
  getBalance,
  transferTokens,
  getAllTransactions
}