import { useState, useEffect } from "react";
import { Keep } from "@/components/keepr/KeepCard";
import { downloadFromIPFS, listFiles } from "@/lib/wallet";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

export function useKeeps() {
  const { address } = useWeb3ModalAccount();
  const [keeps, setKeeps] = useState<Keep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeeps = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching keeps for address:', address);
      
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
            keepType: keepData.meta?.type || "secret"
          };
        } catch (err) {
          console.error('Error fetching keep data:', err);
          return null;
        }
      });

      const fetchedKeeps = (await Promise.all(keepPromises)).filter(Boolean) as Keep[];
      console.log('Final processed keeps:', fetchedKeeps);
      setKeeps(fetchedKeeps);
    } catch (err) {
      console.error('Error fetching keeps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch keeps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeeps();
  }, [address]);

  const searchKeeps = (query: string, type?: string, status?: string) => {
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
    searchKeeps,
    refreshKeeps: fetchKeeps
  };
} 