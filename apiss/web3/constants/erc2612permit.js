import abi from '../abi/erc2612permit.json'
import spenderAbi from '../abi/SpenderContract.json'

export const contractABI = abi.abi;
export const spenderContractABI = spenderAbi.abi;

// Proxy contract
export const spenderProxyAddress = '0x6c08efD7999D9F5ab76FDa388989F26B79186cC6'; // Polygon

// Actual spender contract
export const spenderAddress = '0x23AB7Ccf760e22B2E54717602aAd37a24f8Cbd9F'; // Polygon