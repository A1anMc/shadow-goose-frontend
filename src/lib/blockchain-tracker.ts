// Blockchain Grant Tracker
// Transparent and immutable grant application tracking

export interface BlockchainRecord {
  id: string;
  grant_id: string;
  application_id: string;
  timestamp: string;
  hash: string;
  previous_hash: string;
  data: {
    status: string;
    amount: number;
    organization: string;
    applicant: string;
    metadata: Record<string, any>;
  };
  signature: string;
  block_number: number;
}

export interface SmartContract {
  id: string;
  name: string;
  address: string;
  abi: any[];
  functions: string[];
  events: string[];
  deployed_at: string;
  version: string;
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
  grant_data: any;
}

class BlockchainGrantTracker {
  private chain: BlockchainRecord[] = [];
  private smartContracts: Map<string, SmartContract> = new Map();
  private networkConfig = {
    chainId: 1, // Ethereum mainnet
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
    contractAddress: process.env.NEXT_PUBLIC_GRANT_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890'
  };

  constructor() {
    this.initializeSmartContracts();
    this.loadExistingChain();
  }

  private initializeSmartContracts() {
    // Grant Application Smart Contract
    this.smartContracts.set('grant_applications', {
      id: 'grant_applications',
      name: 'Grant Applications Registry',
      address: this.networkConfig.contractAddress,
      abi: [
        {
          "inputs": [
            {"name": "grantId", "type": "string"},
            {"name": "applicationId", "type": "string"},
            {"name": "amount", "type": "uint256"},
            {"name": "metadata", "type": "string"}
          ],
          "name": "submitApplication",
          "outputs": [{"name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"name": "applicationId", "type": "string"}],
          "name": "getApplication",
          "outputs": [
            {"name": "grantId", "type": "string"},
            {"name": "amount", "type": "uint256"},
            {"name": "status", "type": "string"},
            {"name": "timestamp", "type": "uint256"}
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "name": "applicationId", "type": "string"},
            {"indexed": true, "name": "grantId", "type": "string"},
            {"indexed": false, "name": "amount", "type": "uint256"},
            {"indexed": false, "name": "timestamp", "type": "uint256"}
          ],
          "name": "ApplicationSubmitted",
          "type": "event"
        }
      ],
      functions: ['submitApplication', 'getApplication', 'updateStatus'],
      events: ['ApplicationSubmitted', 'StatusUpdated', 'FundsReleased'],
      deployed_at: new Date().toISOString(),
      version: '1.0.0'
    });

    // Grant Funding Smart Contract
    this.smartContracts.set('grant_funding', {
      id: 'grant_funding',
      name: 'Grant Funding Distribution',
      address: '0x9876543210987654321098765432109876543210',
      abi: [
        {
          "inputs": [
            {"name": "applicationId", "type": "string"},
            {"name": "amount", "type": "uint256"}
          ],
          "name": "releaseFunds",
          "outputs": [{"name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      functions: ['releaseFunds', 'getBalance', 'withdrawFunds'],
      events: ['FundsReleased', 'BalanceUpdated'],
      deployed_at: new Date().toISOString(),
      version: '1.0.0'
    });
  }

  private loadExistingChain() {
    // Simulate loading existing blockchain data
    this.chain = [
      {
        id: 'block-1',
        grant_id: 'genesis-grant',
        application_id: 'genesis-application',
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
        previous_hash: '0000000000000000000000000000000000000000000000000000000000000000',
        data: {
          status: 'approved',
          amount: 25000,
          organization: 'Creative Australia',
          applicant: 'SGE',
          metadata: {
            category: 'documentary',
            project_name: 'Youth Employment Documentary',
            impact_metrics: {
              youth_reached: 500,
              employment_placements: 50,
              community_engagement: 'high'
            }
          }
        },
        signature: 'genesis-signature',
        block_number: 1
      }
    ];
  }

  // Submit a new grant application to the blockchain
  async submitApplicationToBlockchain(
    grantId: string,
    applicationId: string,
    applicationData: any
  ): Promise<BlockchainRecord> {
    try {
      // Create new block
      const previousBlock = this.chain[this.chain.length - 1];
      const timestamp = new Date().toISOString();
      
      // Create block data
      const blockData = {
        grant_id: grantId,
        application_id: applicationId,
        timestamp,
        data: {
          status: applicationData.status || 'submitted',
          amount: applicationData.amount,
          organization: applicationData.organization,
          applicant: applicationData.applicant || 'SGE',
          metadata: {
            category: applicationData.category,
            project_name: applicationData.project_name,
            deadline: applicationData.deadline,
            success_probability: applicationData.success_probability,
            ai_analysis: applicationData.ai_analysis,
            impact_metrics: applicationData.impact_metrics || {}
          }
        }
      };

      // Calculate hash
      const dataString = JSON.stringify(blockData);
      const hash = await this.calculateHash(dataString);
      
      // Create blockchain record
      const record: BlockchainRecord = {
        id: `block-${this.chain.length + 1}`,
        grant_id: grantId,
        application_id: applicationId,
        timestamp,
        hash,
        previous_hash: previousBlock.hash,
        data: blockData.data,
        signature: await this.signData(dataString),
        block_number: this.chain.length + 1
      };

      // Add to chain
      this.chain.push(record);

      // Emit blockchain event
      this.emitBlockchainEvent('ApplicationSubmitted', {
        applicationId,
        grantId,
        amount: applicationData.amount,
        timestamp
      });

      return record;
    } catch (error) {
      console.error('Failed to submit to blockchain:', error);
      throw new Error('Blockchain submission failed');
    }
  }

  // Update application status on blockchain
  async updateApplicationStatus(
    applicationId: string,
    newStatus: string,
    metadata?: any
  ): Promise<BlockchainRecord> {
    try {
      const previousBlock = this.chain[this.chain.length - 1];
      const timestamp = new Date().toISOString();
      
      const blockData = {
        application_id: applicationId,
        timestamp,
        data: {
          status: newStatus,
          amount: 0, // Status updates don't change amount
          organization: this.getOrganizationFromApplication(applicationId),
          applicant: this.getApplicantFromApplication(applicationId),
          metadata: {
            ...metadata,
            previous_status: this.getApplicationStatus(applicationId),
            update_reason: this.getUpdateReason(newStatus)
          }
        }
      };

      const dataString = JSON.stringify(blockData);
      const hash = await this.calculateHash(dataString);
      
      const record: BlockchainRecord = {
        id: `block-${this.chain.length + 1}`,
        grant_id: this.getGrantIdFromApplication(applicationId),
        application_id: applicationId,
        timestamp,
        hash,
        previous_hash: previousBlock.hash,
        data: blockData.data,
        signature: await this.signData(dataString),
        block_number: this.chain.length + 1
      };

      this.chain.push(record);

      // Emit blockchain event
      this.emitBlockchainEvent('StatusUpdated', {
        applicationId,
        newStatus,
        timestamp
      });

      return record;
    } catch (error) {
      console.error('Failed to update blockchain status:', error);
      throw new Error('Blockchain status update failed');
    }
  }

  // Get application history from blockchain
  getApplicationHistory(applicationId: string): BlockchainRecord[] {
    return this.chain.filter(block => 
      block.application_id === applicationId
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Verify blockchain integrity
  verifyChainIntegrity(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify previous hash
      if (currentBlock.previous_hash !== previousBlock.hash) {
        issues.push(`Block ${i}: Previous hash mismatch`);
      }

      // Verify hash integrity
      const dataString = JSON.stringify({
        grant_id: currentBlock.grant_id,
        application_id: currentBlock.application_id,
        timestamp: currentBlock.timestamp,
        data: currentBlock.data
      });

      this.calculateHash(dataString).then(hash => {
        if (hash !== currentBlock.hash) {
          issues.push(`Block ${i}: Hash integrity check failed`);
        }
      });
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Get blockchain statistics
  getBlockchainStats(): {
    totalBlocks: number;
    totalApplications: number;
    totalFunding: number;
    averageBlockTime: number;
    chainIntegrity: boolean;
  } {
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
    const averageBlockTime = totalTime / (this.chain.length - 1);

    const chainIntegrity = this.verifyChainIntegrity().isValid;

    return {
      totalBlocks,
      totalApplications,
      totalFunding,
      averageBlockTime,
      chainIntegrity
    };
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

    return transaction;
  }

  // Get real-time blockchain feed
  getBlockchainFeed(limit: number = 10): BlockchainRecord[] {
    return this.chain
      .slice(-limit)
      .reverse()
      .map(block => ({
        ...block,
        data: {
          ...block.data,
          // Add computed fields
          time_ago: this.getTimeAgo(block.timestamp),
          block_age: this.getBlockAge(block.block_number)
        }
      }));
  }

  // Search blockchain records
  searchBlockchain(query: string): BlockchainRecord[] {
    const searchTerm = query.toLowerCase();
    return this.chain.filter(block => 
      block.grant_id.toLowerCase().includes(searchTerm) ||
      block.application_id.toLowerCase().includes(searchTerm) ||
      block.data.organization.toLowerCase().includes(searchTerm) ||
      block.data.metadata?.project_name?.toLowerCase().includes(searchTerm)
    );
  }

  // Private helper methods
  private async calculateHash(data: string): Promise<string> {
    // Simulate SHA-256 hashing
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async signData(data: string): Promise<string> {
    // Simulate digital signature
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + 'SGE_PRIVATE_KEY');
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 64);
  }

  private emitBlockchainEvent(eventName: string, data: any) {
    // Simulate blockchain event emission
    console.log(`Blockchain Event: ${eventName}`, data);
    
    // In a real implementation, this would emit to WebSocket or event system
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('blockchain-event', {
        detail: { eventName, data, timestamp: new Date().toISOString() }
      }));
    }
  }

  private getApplicationStatus(applicationId: string): string {
    const applicationBlocks = this.chain.filter(block => 
      block.application_id === applicationId
    );
    return applicationBlocks.length > 0 
      ? applicationBlocks[applicationBlocks.length - 1].data.status 
      : 'unknown';
  }

  private getGrantIdFromApplication(applicationId: string): string {
    const applicationBlock = this.chain.find(block => 
      block.application_id === applicationId
    );
    return applicationBlock?.grant_id || 'unknown';
  }

  private getOrganizationFromApplication(applicationId: string): string {
    const applicationBlock = this.chain.find(block => 
      block.application_id === applicationId
    );
    return applicationBlock?.data.organization || 'unknown';
  }

  private getApplicantFromApplication(applicationId: string): string {
    const applicationBlock = this.chain.find(block => 
      block.application_id === applicationId
    );
    return applicationBlock?.data.applicant || 'SGE';
  }

  private getUpdateReason(status: string): string {
    const reasons: Record<string, string> = {
      'approved': 'Application meets all criteria and funding approved',
      'rejected': 'Application does not meet funding criteria',
      'pending_review': 'Application under review by committee',
      'funds_released': 'Grant funds successfully transferred',
      'project_completed': 'Grant project successfully completed'
    };
    return reasons[status] || 'Status updated';
  }

  private generateTransactionHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private getLatestBlockNumber(): number {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1].block_number : 0;
  }

  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  private getBlockAge(blockNumber: number): string {
    const currentBlock = this.getLatestBlockNumber();
    const age = currentBlock - blockNumber;
    return `${age} blocks old`;
  }
}

export const blockchainTracker = new BlockchainGrantTracker();
