import {TxObjectType} from "./TxObjectType";

export interface TransactionDelta<T> {
    type: TxObjectType;
    parentIndex: number;
    value: T;
    address: string;
}