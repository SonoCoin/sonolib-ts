export interface State<T> {
    address: string;
    in: string;
    out: string;
    requester: string;
    commission: T;
    nonceDelta: T;
    parentIndex: number;
}