// server/utils/airdropScanner.ts
import { ethers } from 'ethers'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import {airdropList} from '../airdrops' // ensure this path is correct

/**
 * Server-side airdrop scanning helper
 *
 * - Uses a provider passed in (server-side)
 * - For each airdrop entry (ETH only) with contractAddress:
 *     1) tries ERC20/ERC721 balanceOf (if function exists)
 *     2) falls back to scanning Transfer logs (if provider supports getLogs)
 * - Returns normalized result objects for client UI
 */
// server/utils/chains.ts

export const CHAIN_RPCS = {
  eth: "https://eth-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj",
  linea: "https://linea-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj",   // update key
  base: "https://base-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj",
  zksync: "https://zksync-mainnet.g.alchemy.com/v2/Y8ew7o5gjdFDCO698pASWL1GgPGasOmj",
  solana: "https://api.mainnet-beta.solana.com" // reserved for future different logic
}

const EVM_CHAINS = ["eth", "linea", "base", "zksync"]


const MINIMAL_ABI = [
  // balanceOf is present in both ERC20 and ERC721 (ERC1155 differs)
  'function balanceOf(address) view returns (uint256)',
  // event Transfer
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]

/**
 * pad the address to 32 bytes topic string for logs
 */
function addressToTopic (addr) {
  const a = addr.replace(/^0x/, '').toLowerCase()
  return '0x' + a.padStart(64, '0')
}

/**
 * parse airdrop list estimatedValue into number (if possible)
 */
function parseEstimatedValue (val) {
  if (!val) return 0
  if (typeof val === 'number') return val
  if (typeof val !== 'string') return 0
  const cleaned = val.replace(/[^\d.]/g, '')
  return cleaned ? Number(cleaned) : 0
}

// NEW FUNCTION FOR SOLANA LOGIC (Place this after scanSingle)

/**
 * scanSolanaAirdrop - checks one airdrop on Solana
 */
async function scanSolanaAirdrop (provider, airdrop, resolvedAddress) {
  const base = {
    // ... (Your base object properties remain the same, excluding contract-specific ones)
    id: airdrop.id || airdrop.projectName,
    name: airdrop.projectName,
    description: airdrop.description,
    ends: airdrop.endDate,
    estimatedValueNum: parseEstimatedValue(airdrop.estimatedValue),
    value: airdrop.estimatedValue || '',
    slug: airdrop.id || (airdrop.projectName || '').toLowerCase().replace(/\s+/g, '-'),
    logo: airdrop.imageUrl || null,
    claimable: false,
    statusLabel: 'Not eligible',
    category: 'unknown',
    contractAddress: airdrop.contractAddress,
    chain: airdrop.chain,
  }
  const mintAddress = airdrop.contractAddress // On Solana, this is the Mint/Token address
  
  if (!mintAddress) {
    // Check for native SOL airdrop eligibility
    try {
        const solBalanceLamports = await provider.getBalance(resolvedAddress)
        // Check for balance (0 is equivalent to 0.0 SOL)
        if (solBalanceLamports > 0) {
            base.claimable = true
            base.statusLabel = 'Native SOL Balance detected'
            return base
        }
        
        // For interaction: Check if the address has ever sent a transaction
        // On Solana, `getConfirmedSignaturesForAddress2` is used for transaction history.
        const signatures = await provider.getConfirmedSignaturesForAddress2(resolvedAddress, { limit: 1 })
        if (signatures.length > 0) {
             base.claimable = true
             base.statusLabel = 'Native SOL Interaction detected (1+ transactions)'
             return base
        }

    } catch (e) {
        // console.warn('Solana Native Scan error:', e)
        base.statusLabel = 'Solana Scan error (Native)'
        return base
    }

    base.statusLabel = 'No SOL activity / Mint Address'
    return base
  }
  
  // Token (SPL) balance check
  try {
    const mintPublicKey = new PublicKey(mintAddress)
    
    // 1. Get the Associated Token Account (ATA) address for the user and the token
    const tokenAccountPubkey = getAssociatedTokenAddressSync(mintPublicKey, resolvedAddress, true)
    
    // 2. Fetch the token account balance
    const balanceInfo = await provider.getTokenAccountBalance(tokenAccountPubkey)
    
    if (balanceInfo.value.uiAmount && balanceInfo.value.uiAmount > 0) {
        base.claimable = true
        base.statusLabel = `Token Balance detected: ${balanceInfo.value.uiAmountString}`
        return base
    }

    // SPL Token interaction check (heavy, but necessary if balance is 0)
    // You would typically use getConfirmedSignaturesForAddress2 on the ATA
    // For simplicity, we'll skip the heavy log scan here, similar to your EVM log-scan fallback.
    // If airdrop requires interaction and not balance, the simplest check is the balance being > 0 or 
    // using a specialized indexing service (like a Graph) which is outside this scope.

  } catch (e) {
    // console.warn('Solana SPL Scan error for', mintAddress, e)
    base.statusLabel = 'Solana Scan error (SPL)'
    return base
  }

  base.statusLabel = 'No SPL balance detected'
  return base
}




/**
 * scanSingle - checks one airdrop contract for an address
 */
async function scanSingle (provider, airdrop, resolvedAddress) {
  const contractAddress = airdrop.contractAddress
  const base = {
    id: airdrop.id || airdrop.projectName,
    name: airdrop.projectName,
    description: airdrop.description,
    ends: airdrop.endDate,
    estimatedValueNum: parseEstimatedValue(airdrop.estimatedValue),
    value: airdrop.estimatedValue || '',
    slug: airdrop.id || (airdrop.projectName || '').toLowerCase().replace(/\s+/g, '-'),
    logo: airdrop.imageUrl || null,
    claimable: false,
    statusLabel: 'Not eligible',
    category: 'unknown',
    contractAddress: airdrop.contractAddress,
    chain: airdrop.chain,
  }

  // Safety checks
  if (!contractAddress) {
    base.statusLabel = 'No contract address'
    return base
  }

  try {
    const contract = new ethers.Contract(contractAddress, MINIMAL_ABI, provider)

    // 1) Try balanceOf
    try {
      const bal = await contract.balanceOf(resolvedAddress)
      // ethers v6 returns BigInt or Hex; convert safely
      const balNum = (typeof bal === 'bigint') ? Number(bal) : (bal && bal.toString ? Number(bal.toString()) : 0)
    //   console.log(base.name, bal)
      if (balNum && balNum > 0) {
        base.claimable = true
        base.statusLabel = 'Balance detected'
        return base
      }
    } catch (err) {
      // contract might not implement balanceOf or RPC errored; ignore and continue
    }

    // 2) Inspect Transfer logs for activity (heavy — provider may rate-limit)
    try {
      // Use Transfer topic and filter by contract address
      const transferTopic = ethers.id('Transfer(address,address,uint256)')
      const userTopic = addressToTopic(resolvedAddress)

      const filter = {
        address: contractAddress,
        topics: [transferTopic, null, null],
        fromBlock: 0,
        toBlock: 'latest'
      }

      // NOTE: some providers block wide getLogs requests; catch and continue
      const logs = await provider.getLogs(filter)
      const interacted = logs.some(log => {
        // topics[1] = from, topics[2] = to
        const t1 = (log.topics && log.topics[1]) ? log.topics[1].toLowerCase() : ''
        const t2 = (log.topics && log.topics[2]) ? log.topics[2].toLowerCase() : ''
        return t1 === userTopic || t2 === userTopic
      })

      if (interacted) {
        base.claimable = false
        base.statusLabel = 'Interaction detected'
        return base
      }
    } catch (err) {
      // provider may restrict logs; ignore here and fallback
      // console.warn('getLogs error for', contractAddress, err)
    }

    // fallback: not eligible
    base.claimable = false
    base.statusLabel = 'No activity / balance'
    return base
  } catch (err) {
    // general failure scanning this contract
    base.claimable = false
    base.statusLabel = 'Scan error'
    return base
  }
}

/**
 * scanAirdrops - main entry
 * @param userAddress resolved checksummed address
 * @param options optional: batch size
 */// server/utils/airdropScanner.ts

export async function scanAirdrops (userAddress, options = {}) {
  
  const BATCH = options.batch || 6
  

  const filtered = (isValidSolanaAddress(userAddress)) ?
   (airdropList || []).filter(a => {
    const chain = (a.chain || '').toLowerCase()
    const hasAddr = a.contractAddress && a.contractAddress !== 'null' && a.contractAddress !== ''
    // allow entries that target EVM chains
    return hasAddr && (chain == 'solana' || chain === '' || chain === 'null')
  })
  :
  (airdropList || []).filter(a => {
    const chain = (a.chain || '').toLowerCase()
    const hasAddr = a.contractAddress && a.contractAddress !== 'null' && a.contractAddress !== ''
    // allow entries that target EVM chains
    return hasAddr && (EVM_CHAINS.includes(chain) || chain === '' || chain === 'null')
  })

  const providers = {} // Cache providers by chain name
  const results = []

  for (const airdrop of filtered) {
    const normalizedEVM = EVM_CHAINS.includes(airdrop.chain) ? ethers.getAddress(userAddress) : null
    

    const cleanAddress = userAddress.trim();
    
    let normalizedSOL = null;
    
    if (airdrop.chain === 'solana') {
        try {
            // Attempt to create the PublicKey with the clean string
            normalizedSOL = new PublicKey(cleanAddress);
        } catch (e) {
            // Handle the Base58 error gracefully for Solana
            console.error(`Error creating Solana PublicKey for ${cleanAddress}:`, e.message);
            
            // If the Solana address is invalid, skip this airdrop check 
            // and return a non-eligible status for this entry.
            const base = { /* ... your base object */ };
            base.statusLabel = 'Invalid Solana Address Format';
            results.push(base);
            
            await new Promise(r => setTimeout(r, 200));
            continue; // Skip to the next airdrop
        }
    }
    

    const chain = (airdrop.chain || 'eth').toLowerCase()
    const rpc = CHAIN_RPCS[chain] || CHAIN_RPCS.eth
    // console.log(airdrop.projectName, chain, rpc)
    
    // Use cached provider or create new one
    if (!providers[chain]) {
        if (chain === 'solana') {
            providers[chain] = new Connection(rpc) // Use Solana Connection
        } else {
            providers[chain] = new ethers.JsonRpcProvider(rpc) // Use Ethers Provider
        }
    }
    const provider = providers[chain]

    // Initialize base result object
    const base = {
      id: airdrop.id || airdrop.projectName,
      name: airdrop.projectName,
      description: airdrop.description,
      ends: airdrop.endDate,
      estimatedValueNum: parseEstimatedValue(airdrop.estimatedValue),
      value: airdrop.estimatedValue || '',
      slug: airdrop.id || (airdrop.projectName || '').toLowerCase().replace(/\s+/g, '-'),
      logo: airdrop.imageUrl || null,
      officialLinks: airdrop.officialLinks,
      claimable: false,
      statusLabel: 'Not eligible',
      category: 'unknown',
      contractAddress: airdrop.contractAddress,
      chain: airdrop.chain,
    }
              console.log(base.name, base.chain)

    // =======================================================
    // 1. NATIVE TOKEN CHECK (IF NO CONTRACT ADDRESS IS PROVIDED)
    // =======================================================
    if (airdrop.native) {
      try {
          const nativeBalanceWei = await provider.getBalance(normalizedEVM)
          const txCount = await provider.getTransactionCount(normalizedEVM) // <--- NEW NATIVE INTERACTION CHECK
          
          if (nativeBalanceWei > 0) {
              base.claimable = true
              base.statusLabel = 'Native Balance detected'
              results.push(base)
              continue
          }
          
          if (txCount > 0) { // <--- ELIGIBILITY VIA INTERACTION
              base.claimable = true
              base.statusLabel = 'Native Interaction detected (Tx Count > 0)'
              results.push(base)
              continue
          }

      } catch (e) {
          // console.warn('Error fetching native balance/nonce for', airdrop.projectName, e)
          base.statusLabel = 'Native Scan error'
          results.push(base)
          continue
      }
    }
    
    // =======================================================
    // 2. CONTRACT TOKEN CHECK (Existing scanSingle logic)
    // =======================================================
    if (!airdrop.native && EVM_CHAINS.includes(chain)) {
        const res = await scanSingle(provider, airdrop, normalizedEVM)
        results.push(res)
    } else if (!airdrop.native && chain == 'solana') {
        // If it was a native check and failed (no balance, no txs), push the base failed object
        const res = await scanSolanaAirdrop(provider, airdrop, normalizedSOL)
        results.push(res)
    }
    else {
        // If it was a native check and failed (no balance, no txs), push the base failed object
        const res = { ...base, statusLabel: 'Unsupported Chain' }
        results.push(res)
    }
    
    await new Promise(r => setTimeout(r, 200)) // light throttle, still useful
  }

  // categorize based on ends date & claimable flag
  const now = new window.Date() // <--- FIX 3
  const categorized = results.map(r => {
    const copy = { ...r }
    if (copy.claimable) {
      copy.category = 'claimable'
    } else {
      const d = new window.Date(copy.ends) || null // <--- FIX 3
      if (d && !isNaN(d.getTime())) {
        copy.category = d.getTime() < now.getTime() ? 'expired' : 'upcoming'
      } else {
        copy.category = copy.category || 'upcoming'
      }
    }
    return copy
  })

  // console.log(categorized)
  const eligibleOnly = categorized.filter(r =>
      r.claimable === true || r.statusLabel.includes('Interaction detected') // Updated filter for clarity
  )

  return eligibleOnly
}



export function isValidSolanaAddress(address) {
  try {
    new PublicKey(address);
    return true;
  } catch (err) {
    return false;
  }
}