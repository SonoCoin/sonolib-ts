import {BlockHeader} from "./BlockHeader";
import {Transaction} from "./Transaction";
import {Advice} from "./Advice";

export interface Block<T> {
    header: BlockHeader;
    txs: Transaction<T>[];
    advices: Advice[];
}