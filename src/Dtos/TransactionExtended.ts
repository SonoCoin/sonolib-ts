import {Transaction} from "./Transaction";

export interface TransactionExtended<T> extends Transaction<T> {
    size: number;
    block: string;
    height: number;
    confirmed: number;
    confirmedTimestamp: number;
}