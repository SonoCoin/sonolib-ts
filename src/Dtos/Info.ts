export interface P2pInfo {
    id: string;
    name: string;
    addr: string;
}

export interface BlockchainInfo {
    height: number;
    currentHash: string;
    currentEpoch: string;
    isSync: boolean;
}

export interface ProgressInfo {
    startingBlock: number;
    currentBlock: number;
    highestBlock: number;
}

export interface Info {
    p2pInfo: P2pInfo;
    p2pPeers: P2pInfo[];
    blockchain: BlockchainInfo;
    progress: ProgressInfo;
}
