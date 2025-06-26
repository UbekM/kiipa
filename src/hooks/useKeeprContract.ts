import { useState, useEffect, useCallback } from 'react';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { 
  KeeprContractService, 
  useKeeprContract as useContract,
  KEEP_STATUS,
  KEEP_TYPE 
} from '@/lib/contracts';

export interface BlockchainKeep {
  id: number;
  creator: string;
  recipient: string;
  fallbackRecipient: string;
  ipfsHash: string;
  unlockTime: number;
  createdAt: number;
  status: keyof typeof KEEP_STATUS;
  keepType: keyof typeof KEEP_TYPE;
  title: string;
  description: string;
}

export function useKeeprContract() {
  const { address, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { toast } = useToast();
  
  const [contractService, setContractService] = useState<KeeprContractService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<{
    minUnlockDelay: number;
    maxUnlockDelay: number;
    claimWindow: number;
    platformFee: string;
  } | null>(null);

  const { getContractService, isContractDeployed } = useContract(chainId);

  // Initialize contract service
  useEffect(() => {
    const initializeContract = async () => {
      if (!walletProvider || !address || !isContractDeployed) {
        setContractService(null);
        return;
      }

      try {
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const service = getContractService(signer);
        setContractService(service);

        // Load configuration
        const config = await service.getConfiguration();
        setConfiguration(config);
      } catch (err) {
        console.error('Failed to initialize contract service:', err);
        setError('Failed to connect to smart contract');
        setContractService(null);
      }
    };

    initializeContract();
  }, [walletProvider, address, chainId, isContractDeployed, getContractService]);

  // Create a new keep
  const createKeep = useCallback(async (
    recipient: string,
    fallbackRecipient: string,
    ipfsHash: string,
    unlockTime: number,
    metadata: {
      title: string;
      description: string;
      keepType: number;
      recipientEmail: string;
      fallbackEmail: string;
    }
  ) => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contractService.createKeep(
        recipient,
        fallbackRecipient,
        ipfsHash,
        unlockTime,
        metadata
      );

      toast({
        title: 'Transaction Submitted',
        description: 'Creating keep on blockchain...',
      });

      const receipt = await tx.wait();
      
      toast({
        title: 'Keep Created',
        description: `Keep created successfully! Transaction: ${receipt.hash}`,
      });

      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create keep';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractService, toast]);

  // Claim a keep
  const claimKeep = useCallback(async (keepId: number) => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contractService.claimKeep(keepId);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Claiming keep on blockchain...',
      });

      const receipt = await tx.wait();
      
      toast({
        title: 'Keep Claimed',
        description: `Keep claimed successfully! Transaction: ${receipt.hash}`,
      });

      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim keep';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractService, toast]);

  // Activate fallback
  const activateFallback = useCallback(async (keepId: number) => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contractService.activateFallback(keepId);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Activating fallback access...',
      });

      const receipt = await tx.wait();
      
      toast({
        title: 'Fallback Activated',
        description: `Fallback access activated! Transaction: ${receipt.hash}`,
      });

      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate fallback';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractService, toast]);

  // Cancel a keep
  const cancelKeep = useCallback(async (keepId: number) => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contractService.cancelKeep(keepId);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Cancelling keep on blockchain...',
      });

      const receipt = await tx.wait();
      
      toast({
        title: 'Keep Cancelled',
        description: `Keep cancelled successfully! Transaction: ${receipt.hash}`,
      });

      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel keep';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractService, toast]);

  // Change recipient
  const changeRecipient = useCallback(async (keepId: number, newRecipient: string) => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contractService.changeRecipient(keepId, newRecipient);
      
      toast({
        title: 'Transaction Submitted',
        description: 'Changing recipient on blockchain...',
      });

      const receipt = await tx.wait();
      
      toast({
        title: 'Recipient Changed',
        description: `Recipient changed successfully! Transaction: ${receipt.hash}`,
      });

      return receipt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change recipient';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractService, toast]);

  // Get keeps by creator
  const getKeepsByCreator = useCallback(async (user: string): Promise<BlockchainKeep[]> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    try {
      const keepIds = await contractService.getKeepsByCreator(user);
      const keeps: BlockchainKeep[] = [];

      for (const keepId of keepIds) {
        const keep = await contractService.getKeep(keepId);
        keeps.push({
          id: Number(keep.id),
          creator: keep.creator,
          recipient: keep.recipient,
          fallbackRecipient: keep.fallbackRecipient,
          ipfsHash: keep.ipfsHash,
          unlockTime: Number(keep.unlockTime),
          createdAt: Number(keep.createdAt),
          status: KEEP_STATUS[keep.status as keyof typeof KEEP_STATUS] || 'Active',
          keepType: KEEP_TYPE[keep.keepType as keyof typeof KEEP_TYPE] || 'Secret',
          title: keep.title,
          description: keep.description,
        });
      }

      return keeps;
    } catch (err) {
      console.error('Failed to get keeps by creator:', err);
      throw err;
    }
  }, [contractService]);

  // Get keeps by recipient
  const getKeepsByRecipient = useCallback(async (user: string): Promise<BlockchainKeep[]> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    try {
      const keepIds = await contractService.getKeepsByRecipient(user);
      const keeps: BlockchainKeep[] = [];

      for (const keepId of keepIds) {
        const keep = await contractService.getKeep(keepId);
        keeps.push({
          id: Number(keep.id),
          creator: keep.creator,
          recipient: keep.recipient,
          fallbackRecipient: keep.fallbackRecipient,
          ipfsHash: keep.ipfsHash,
          unlockTime: Number(keep.unlockTime),
          createdAt: Number(keep.createdAt),
          status: KEEP_STATUS[keep.status as keyof typeof KEEP_STATUS] || 'Active',
          keepType: KEEP_TYPE[keep.keepType as keyof typeof KEEP_TYPE] || 'Secret',
          title: keep.title,
          description: keep.description,
        });
      }

      return keeps;
    } catch (err) {
      console.error('Failed to get keeps by recipient:', err);
      throw err;
    }
  }, [contractService]);

  // Get single keep
  const getKeep = useCallback(async (keepId: number): Promise<BlockchainKeep | null> => {
    if (!contractService) {
      throw new Error('Contract service not initialized');
    }

    try {
      const keep = await contractService.getKeep(keepId);
      return {
        id: Number(keep.id),
        creator: keep.creator,
        recipient: keep.recipient,
        fallbackRecipient: keep.fallbackRecipient,
        ipfsHash: keep.ipfsHash,
        unlockTime: Number(keep.unlockTime),
        createdAt: Number(keep.createdAt),
        status: KEEP_STATUS[keep.status as keyof typeof KEEP_STATUS] || 'Active',
        keepType: KEEP_TYPE[keep.keepType as keyof typeof KEEP_TYPE] || 'Secret',
        title: keep.title,
        description: keep.description,
      };
    } catch (err) {
      console.error('Failed to get keep:', err);
      return null;
    }
  }, [contractService]);

  // Check if fallback can be activated
  const canActivateFallback = useCallback(async (keepId: number): Promise<boolean> => {
    if (!contractService) {
      return false;
    }

    try {
      return await contractService.canActivateFallback(keepId);
    } catch (err) {
      console.error('Failed to check fallback activation:', err);
      return false;
    }
  }, [contractService]);

  // Get platform fee
  const getPlatformFee = useCallback(async (): Promise<string> => {
    if (!contractService) {
      return '0';
    }

    try {
      return await contractService.getPlatformFee();
    } catch (err) {
      console.error('Failed to get platform fee:', err);
      return '0';
    }
  }, [contractService]);

  return {
    // State
    loading,
    error,
    configuration,
    isContractDeployed,
    
    // Actions
    createKeep,
    claimKeep,
    activateFallback,
    cancelKeep,
    changeRecipient,
    
    // Queries
    getKeepsByCreator,
    getKeepsByRecipient,
    getKeep,
    canActivateFallback,
    getPlatformFee,
    
    // Utilities
    contractService,
  };
}
