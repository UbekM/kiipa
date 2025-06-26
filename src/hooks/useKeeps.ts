import { useState, useEffect } from "react";
import { Keep } from "@/components/keepr/KeepCard";
import { downloadFromIPFS, listFiles } from "@/lib/wallet";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

export function useKeeps() {
  const { address } = useWeb3ModalAccount();
  const [keeps, setKeeps] = useState<Keep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedKeeps, setFailedKeeps] = useState<string[]>([]);
  const [pinataAvailable, setPinataAvailable] = useState(true);

  const fetchKeeps = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    setFailedKeeps([]);
    
    try {
      console.log('Fetching keeps for address:', address);
      
      // Check if Pinata is configured
      if (!import.meta.env.VITE_PINATA_JWT) {
        console.warn('Pinata JWT not configured - skipping IPFS fetch');
        setPinataAvailable(false);
        setKeeps([]);
        setLoading(false);
        return;
      }
      
      // Use the new listFiles function
      const allFiles = await listFiles();
      console.log('All files from Pinata:', allFiles);
      
      // Filter pins that belong to the current user
      const userKeeps = allFiles.filter((row: any) => {
        const metadata = row.metadata?.keyvalues || {};
        console.log('Checking pin metadata:', metadata, 'for address:', address);
        const isRecipient = metadata.recipient === address;
        const isFallback = metadata.fallback === address;
        const isCreator = metadata.creator === address;
        console.log('Is recipient:', isRecipient, 'Is fallback:', isFallback, 'Is creator:', isCreator);
        return isRecipient || isFallback || isCreator;
      });

      console.log('Filtered keeps for user:', userKeeps);

      // Fetch full keep data from IPFS
      const keepPromises = userKeeps.map(async (row: any) => {
        try {
          console.log('Fetching IPFS data for hash:', row.ipfs_pin_hash);
          const keepData = await downloadFromIPFS(row.ipfs_pin_hash);
          console.log('IPFS data received:', keepData);
          
          return {
            id: row.ipfs_pin_hash,
            title: keepData.meta?.title || 'Untitled Keep',
            description: keepData.meta?.description || '',
            recipient: row.metadata?.keyvalues?.recipient || "",
            fallback: row.metadata?.keyvalues?.fallback,
            creator: row.metadata?.keyvalues?.creator,
            unlockTime: new Date(row.metadata?.keyvalues?.unlockTime || Date.now()),
            createdAt: new Date(row.date_pinned),
            status: keepData.meta?.status || row.metadata?.keyvalues?.status || "active",
            ipfsHash: row.ipfs_pin_hash,
            keepType: keepData.meta?.type || "secret",
            ipfsError: false
          };
        } catch (err) {
          console.error('Error fetching keep data for hash:', row.ipfs_pin_hash, err);
          
          // Create a keep object with basic metadata and error flag
          const fallbackKeep: Keep = {
            id: row.ipfs_pin_hash,
            title: row.metadata?.keyvalues?.title || 'Keep (Unavailable)',
            description: 'Content temporarily unavailable due to IPFS retrieval error',
            recipient: row.metadata?.keyvalues?.recipient || "",
            fallback: row.metadata?.keyvalues?.fallback,
            creator: row.metadata?.keyvalues?.creator,
            unlockTime: new Date(row.metadata?.keyvalues?.unlockTime || Date.now()),
            createdAt: new Date(row.date_pinned),
            status: "error",
            ipfsHash: row.ipfs_pin_hash,
            keepType: row.metadata?.keyvalues?.type || "secret",
            ipfsError: true,
            errorMessage: err instanceof Error ? err.message : 'Failed to retrieve content'
          };
          
          setFailedKeeps(prev => [...prev, row.ipfs_pin_hash]);
          return fallbackKeep;
        }
      });

      const fetchedKeeps = (await Promise.all(keepPromises)) as Keep[];
      console.log('Final processed keeps:', fetchedKeeps);
      setKeeps(fetchedKeeps);
      
      // Show warning if some keeps failed to load
      if (failedKeeps.length > 0) {
        console.warn(`${failedKeeps.length} keeps failed to load from IPFS`);
      }
    } catch (err) {
      console.error('Error fetching keeps:', err);
      
      // Don't set a global error - just log it and show empty state
      // This allows the dashboard to still function
      if (err instanceof Error && err.message.includes('Pinata')) {
        console.warn('Pinata service unavailable - showing empty dashboard');
        setPinataAvailable(false);
        setKeeps([]);
      } else {
        // Only set error for non-Pinata related issues
        setError(err instanceof Error ? err.message : 'Failed to fetch keeps');
      }
    } finally {
      setLoading(false);
    }
  };

  // Retry fetching a specific keep
  const retryKeep = async (keepId: string) => {
    try {
      console.log('Retrying fetch for keep:', keepId);
      const keepData = await downloadFromIPFS(keepId);
      
      setKeeps(prevKeeps => 
        prevKeeps.map(keep => 
          keep.id === keepId 
            ? {
                ...keep,
                title: keepData.meta?.title || 'Untitled Keep',
                description: keepData.meta?.description || '',
                status: keepData.meta?.status || "active",
                keepType: keepData.meta?.type || "secret",
                ipfsError: false,
                errorMessage: undefined
              }
            : keep
        )
      );
      
      setFailedKeeps(prev => prev.filter(id => id !== keepId));
      
      console.log('Successfully retried keep:', keepId);
    } catch (err) {
      console.error('Failed to retry keep:', keepId, err);
      // Update the error message
      setKeeps(prevKeeps => 
        prevKeeps.map(keep => 
          keep.id === keepId 
            ? {
                ...keep,
                errorMessage: err instanceof Error ? err.message : 'Failed to retrieve content'
              }
            : keep
        )
      );
    }
  };

  useEffect(() => {
    // We will no longer fetch keeps automatically on mount.
    // The Dashboard component will now trigger the fetch.
    // fetchKeeps();
  }, [address]);

  const searchKeeps = (query: string, type?: string, status?: string) => {
    if (!keeps) return [];
    
    return keeps.filter(keep => {
      const matchesQuery = !query || 
        keep.title.toLowerCase().includes(query.toLowerCase()) ||
        keep.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = !type || keep.keepType === type;
      const matchesStatus = !status || keep.status === status;

      return matchesQuery && matchesType && matchesStatus;
    });
  };

  return {
    keeps,
    loading,
    error,
    failedKeeps,
    pinataAvailable,
    searchKeeps,
    refreshKeeps: fetchKeeps,
    retryKeep
  };
} 