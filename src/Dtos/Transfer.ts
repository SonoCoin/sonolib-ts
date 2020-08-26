import {BigInteger} from "big-integer";
import {BigIntToBufferLE} from "../Crypto/utils";
import * as bs58 from 'bs58';

export class TransferDto<T> {
    address: string;    // [26]byte
    value: T;

    constructor(address: string, value: T) {
        this.address = address;
        this.value = value;
    }
}

export class Transfer extends TransferDto<BigInteger> {

    toBytes(): Buffer {
        const addr = bs58.decode(this.address);
        const value = BigIntToBufferLE(this.value, 8);

        return Buffer.concat([addr, value]);
    }

}
