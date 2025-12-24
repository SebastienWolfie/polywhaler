import abi from '../abi/erc2612permit.json'
import spenderAbi from '../abi/SpenderContract.json'

export const contractABI = abi.abi;
export const spenderContractABI = spenderAbi.abi;

// Proxy contract
export const spenderProxyAddress = '0x02A984c52AeF3B1B2441D5FE157aa6E380513644'; // Polygon

// Actual spender contract
export const spenderAddress = '0x24a189464a019c3eB39D189Cf17383C7465deE7f'; // Polygon