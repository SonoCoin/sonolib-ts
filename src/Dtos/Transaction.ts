import {TransactionRequestDto} from "./TransactionRequest";
import {TransactionDelta} from "./TransactionDelta";
import {State} from "./State";

export interface Transaction<T> {
    request: TransactionRequestDto<T>;
    incomes: TransactionDelta<T>[];
    outcomes: TransactionDelta<T>[];
    states: State<T>[];
}