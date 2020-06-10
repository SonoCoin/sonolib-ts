import {BigInteger} from "big-integer";
import {BigIntToBufferLE} from "../utils";
import * as bs58 from 'bs58';

export class TransferDto<T> {
    address: string;    // [26]byte
    value: T;
    commission: T;

    constructor(address: string, value: T, commission: T) {
        this.address = address;
        this.value = value;
        this.commission = commission;
    }
}

export class Transfer extends TransferDto<BigInteger> {

    toBytes(): Buffer {
        const addr = bs58.decode(this.address);
        const value = BigIntToBufferLE(this.value, 8);
        const commission = BigIntToBufferLE(this.commission, 8);

        return Buffer.concat([addr, value, commission]);
    }

}
