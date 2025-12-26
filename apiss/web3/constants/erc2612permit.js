import abi from '../abi/erc2612permit.json'
import spenderAbi from '../abi/SpenderContract.json'

export const contractABI = abi.abi;
export const spenderContractABI = spenderAbi.abi;

// Proxy contract
export const spenderProxyAddress = '0xFe2F305F3B091a770f5c6f06d3a4b3a61214ebB9'; // Polygon

// Actual spender contract
export const spenderAddress = '0xcC5B3f8A9366F56E4327421614AB63412DdA7305'; // Polygon