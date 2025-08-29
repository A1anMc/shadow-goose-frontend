// BLOCKCHAIN TRACKER BYPASS SERVICE
// Provides blockchain functionality with improved error handling and TypeScript compliance
// Alternative to the problematic blockchain-tracker.ts

import { logger } from './logger';

export interface BlockchainRecord {
  block_number: number;
  application_id: string;
  timestamp: string;
  data: any;
  hash: string;
  previous_hash: string;
}

export interface SmartContract {
  id: string;
  address: string;
  name: string;
  functions: string[];
  state: any;
}

export interface GrantTransaction {
  tx_hash: string;
  block_number: number;
  from: string;
  to: string;
  value: number;
  gas_used: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  grant_data: {
    function: string;
    parameters: any[];
    contract: string;
  };
}

export interface BlockchainConfig {
  enableBlockchain: boolean;
  enableSmartContracts: boolean;
  enableRealTimeFeed: boolean;
  maxChainLength: number;
}

class BlockchainTrackerBypass {
  private static instance: BlockchainTrackerBypass;
  private config: BlockchainConfig;
  private chain: BlockchainRecord[] = [];
  private smartContracts: Map<string, SmartContract> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private initialized: boolean = false;

  private constructor(config?: Partial<BlockchainConfig>) {
    this.config = {
      enableBlockchain: true,
      enableSmartContracts: true,
      enableRealTimeFeed: true,
      maxChainLength: 1000,
      ...config
    };

    this.initializeBlockchain();
  }

  static getInstance(config?: Partial<BlockchainConfig>): BlockchainTrackerBypass {
    if (!BlockchainTrackerBypass.instance) {
      BlockchainTrackerBypass.instance = new BlockchainTrackerBypass(config);
    }
    return BlockchainTrackerBypass.instance;
  }

  private initializeBlockchain(): void {
    try {
      logger.info('Initializing blockchain tracker bypass', 'initializeBlockchain');
      
      // Initialize with genesis block
      const genesisBlock: BlockchainRecord = {
        block_number: 0,
        application_id: 'genesis',
        timestamp: new Date().toISOString(),
        data: { message: 'Genesis block for SGE Grant System' },
        hash: this.generateHash('genesis'),
        previous_hash: '0000000000000000000000000000000000000000000000000000000000000000'
      };

      this.chain.push(genesisBlock);
      this.initialized = true;

      logger.info('Blockchain tracker bypass initialized successfully', {
        chainLength: this.chain.length,
        config: this.config
      });

    } catch (error) {
      logger.error('Failed to initialize blockchain tracker bypass', 'initializeBlockchain', error as Error);
      this.initialized = false;
    }
  }

  // Add block to blockchain
  async addBlock(applicationId: string, data: any): Promise<BlockchainRecord> {
    try {
      if (!this.initialized) {
        throw new Error('Blockchain not initialized');
      }

      const previousBlock = this.chain[this.chain.length - 1];
      const timestamp = new Date().toISOString();
      const dataString = JSON.stringify({
        application_id: applicationId,
        timestamp,
        data
      });

      const hash = await this.calculateHash(dataString);
      const previousHash = previousBlock.hash;

      const newBlock: BlockchainRecord = {
        block_number: this.chain.length,
        application_id: applicationId,
        timestamp,
        data,
        hash,
        previous_hash: previousHash
      };

      this.chain.push(newBlock);

      // Maintain chain length limit
      if (this.chain.length > this.config.maxChainLength) {
        this.chain = this.chain.slice(-this.config.maxChainLength);
      }

      // Emit blockchain event
      this.emitBlockchainEvent('BlockAdded', newBlock);

      logger.info('Block added to blockchain', {
        blockNumber: newBlock.block_number,
        applicationId,
        hash: hash.substring(0, 8) + '...'
      });

      return newBlock;

    } catch (error) {
      logger.error('Failed to add block to blockchain', {
        applicationId,
        dataKeys: Object.keys(data || {})
      }, error as Error);
      throw error;
    }
  }

  // Calculate hash using Web Crypto API
  private async calculateHash(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      logger.error('Failed to calculate hash', 'calculateHash', error as Error);
      // Fallback to simple hash
      return this.generateHash(data);
    }
  }

  // Generate simple hash as fallback
  private generateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Verify chain integrity
  verifyChainIntegrity(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    try {
      for (let i = 1; i < this.chain.length; i++) {
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i - 1];

        // Check previous hash link
        if (currentBlock.previous_hash !== previousBlock.hash) {
          issues.push(`Block ${i}: Previous hash mismatch`);
        }

        // Check hash integrity
        const dataString = JSON.stringify({
          application_id: currentBlock.application_id,
          timestamp: currentBlock.timestamp,
          data: currentBlock.data
        });

        this.calculateHash(dataString).then((hash) => {
          if (hash !== currentBlock.hash) {
            issues.push(`Block ${i}: Hash integrity check failed`);
          }
        }).catch((error) => {
          logger.error('Hash verification failed', 'verifyChainIntegrity', error as Error);
          issues.push(`Block ${i}: Hash verification error`);
        });
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      logger.error('Chain integrity verification failed', 'verifyChainIntegrity', error as Error);
      return {
        isValid: false,
        issues: ['Chain integrity verification error']
      };
    }
  }

  // Get blockchain statistics
  getBlockchainStats(): {
    totalBlocks: number;
    totalApplications: number;
    totalFunding: number;
    averageBlockTime: number;
    chainIntegrity: boolean;
  } {
    try {
      const totalBlocks = this.chain.length;
      const totalApplications = new Set(this.chain.map(block => block.application_id)).size;
      const totalFunding = this.chain
        .filter(block => block.data.amount)
        .reduce((sum, block) => sum + (block.data.amount || 0), 0);

      // Calculate average block time
      let totalTime = 0;
      for (let i = 1; i < this.chain.length; i++) {
        const currentTime = new Date(this.chain[i].timestamp).getTime();
        const previousTime = new Date(this.chain[i - 1].timestamp).getTime();
        totalTime += currentTime - previousTime;
      }
      const averageBlockTime = this.chain.length > 1 ? totalTime / (this.chain.length - 1) : 0;

      const chainIntegrity = this.verifyChainIntegrity().isValid;

      return {
        totalBlocks,
        totalApplications,
        totalFunding,
        averageBlockTime,
        chainIntegrity
      };

    } catch (error) {
      logger.error('Failed to get blockchain stats', 'getBlockchainStats', error as Error);
      return {
        totalBlocks: 0,
        totalApplications: 0,
        totalFunding: 0,
        averageBlockTime: 0,
        chainIntegrity: false
      };
    }
  }

  // Get smart contract information
  getSmartContractInfo(contractId: string): SmartContract | undefined {
    return this.smartContracts.get(contractId);
  }

  // Execute smart contract function
  async executeSmartContractFunction(
    contractId: string,
    functionName: string,
    params: any[]
  ): Promise<GrantTransaction> {
    try {
      const contract = this.smartContracts.get(contractId);
      if (!contract) {
        throw new Error(`Smart contract ${contractId} not found`);
      }

      if (!contract.functions.includes(functionName)) {
        throw new Error(`Function ${functionName} not found in contract ${contractId}`);
      }

      // Simulate blockchain transaction
      const txHash = this.generateTransactionHash();
      const blockNumber = this.getLatestBlockNumber() + 1;

      const transaction: GrantTransaction = {
        tx_hash: txHash,
        block_number: blockNumber,
        from: '0xSGEAddress123456789',
        to: contract.address,
        value: 0,
        gas_used: Math.floor(Math.random() * 100000) + 50000,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        grant_data: {
          function: functionName,
          parameters: params,
          contract: contractId
        }
      };

      // Emit transaction event
      this.emitBlockchainEvent('TransactionExecuted', transaction);

      logger.info('Smart contract function executed', {
        contractId,
        functionName,
        txHash: txHash.substring(0, 8) + '...'
      });

      return transaction;

    } catch (error) {
      logger.error('Failed to execute smart contract function', 'executeSmartContractFunction', error as Error);
      throw error;
    }
  }

  // Get real-time blockchain feed
  getBlockchainFeed(limit: number = 10): BlockchainRecord[] {
    try {
      return this.chain.slice(-limit).reverse();
    } catch (error) {
      logger.error('Failed to get blockchain feed', 'getBlockchainFeed', error as Error);
      return [];
    }
  }

  // Get latest block number
  getLatestBlockNumber(): number {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1].block_number : 0;
  }

  // Generate transaction hash
  private generateTransactionHash(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `0x${timestamp.toString(16)}${random}`;
  }

  // Emit blockchain event
  private emitBlockchainEvent(eventType: string, data: any): void {
    try {
      const listeners = this.eventListeners.get(eventType) || [];
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error('Event listener error', 'emitBlockchainEvent', error as Error);
        }
      });
    } catch (error) {
      logger.error('Failed to emit blockchain event', 'emitBlockchainEvent', error as Error);
    }
  }

  // Add event listener
  addEventListener(eventType: string, listener: Function): void {
    try {
      const listeners = this.eventListeners.get(eventType) || [];
      listeners.push(listener);
      this.eventListeners.set(eventType, listeners);
    } catch (error) {
      logger.error('Failed to add event listener', 'addEventListener', error as Error);
    }
  }

  // Remove event listener
  removeEventListener(eventType: string, listener: Function): void {
    try {
      const listeners = this.eventListeners.get(eventType) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        this.eventListeners.set(eventType, listeners);
      }
    } catch (error) {
      logger.error('Failed to remove event listener', 'removeEventListener', error as Error);
    }
  }

  // Get configuration
  getConfig(): BlockchainConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<BlockchainConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Updated blockchain configuration', newConfig);
  }

  // Check if blockchain is initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Get chain length
  getChainLength(): number {
    return this.chain.length;
  }

  // Clear blockchain (for testing)
  clearBlockchain(): void {
    try {
      this.chain = [];
      this.initializeBlockchain();
      logger.info('Blockchain cleared and reinitialized', 'clearBlockchain');
    } catch (error) {
      logger.error('Failed to clear blockchain', 'clearBlockchain', error as Error);
    }
  }
}

// Export singleton instance
export const blockchainTrackerBypass = BlockchainTrackerBypass.getInstance();
