export interface Balance<T> {
    address: string;
    confirmedAmount: T;
    unconfirmedAmount: T;
}
