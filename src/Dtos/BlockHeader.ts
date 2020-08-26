import {BlockType} from "./BlockType";

export interface BlockHeader {
    type: BlockType;
    hash: string;
    height: number;
    size: number;
    version: number;
    prevBlock: string;
    timestamp: number;
    seed: string;
    txCount: number;
    adviceCount: number;
    sign: string;
}