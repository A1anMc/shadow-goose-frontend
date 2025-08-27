// BLOCKCHAIN TRACKER REPLACEMENT
// Uses the bypass version to avoid TypeScript compilation issues
// This file replaces the problematic original blockchain-tracker.ts

import { blockchainTrackerBypass } from './blockchain-tracker-bypass';
import { blockchainConfig } from './blockchain-config';

// Re-export the bypass version as the main blockchain tracker
export const blockchainTracker = blockchainTrackerBypass;

// Re-export types from bypass
export type {
  BlockchainRecord,
  SmartContract,
  GrantTransaction,
  BlockchainConfig
} from './blockchain-tracker-bypass';

// Export configuration
export { blockchainConfig };

// Legacy compatibility exports
export const addBlock = blockchainTrackerBypass.addBlock.bind(blockchainTrackerBypass);
export const verifyChainIntegrity = blockchainTrackerBypass.verifyChainIntegrity.bind(blockchainTrackerBypass);
export const getBlockchainStats = blockchainTrackerBypass.getBlockchainStats.bind(blockchainTrackerBypass);
export const getBlockchainFeed = blockchainTrackerBypass.getBlockchainFeed.bind(blockchainTrackerBypass);
export const executeSmartContractFunction = blockchainTrackerBypass.executeSmartContractFunction.bind(blockchainTrackerBypass);

// Default export for compatibility
export default blockchainTrackerBypass;
