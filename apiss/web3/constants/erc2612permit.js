import abi from '../abi/erc2612permit.json'
import spenderAbi from '../abi/SpenderContract.json'

export const contractABI = abi.abi;
export const spenderContractABI = spenderAbi.abi;

// Proxy contract
export const spenderProxyAddress = '0xEa62338De103BF8cC630860DD5662094eB414533'; // Polygon

// Actual spender contract
export const spenderAddress = '0x6525eAf6D5B51F2775bd825946011EC890DA0b6F'; // Polygon