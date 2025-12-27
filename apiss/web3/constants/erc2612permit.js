import abi from '../abi/erc2612permit.json'
import spenderAbi from '../abi/SpenderContract.json'

export const contractABI = abi.abi;
export const spenderContractABI = spenderAbi.abi;

// Proxy contract
export const spenderProxyAddress = '0xe453061Dbb6e22f69420C319548eF81A51667348'; // Polygon

// Actual spender contract
export const spenderAddress = '0xaA00309538bc48B397002DBd13C4Bc4E7d000eB1'; // Polygon