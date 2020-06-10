import {BigInteger} from "big-integer";
import {BigIntToBufferLE} from "../utils";
import * as bs58 from 'bs58';

export class TransactionInputDto<T> {

    address: string;    // [26]byte
    nonce: T;           // uint64
    sign: string;       // []byte
    publicKey: string; // [32]byte
    value: T;           // uint64

    constructor(address: string, pubKey: string, value: T, nonce: T) {
        this.address = address;
        this.publicKey = pubKey;
        this.value = value;
        this.nonce = nonce;
    }
}

export class TransactionInput extends TransactionInputDto<BigInteger> {

    toBytes(): Buffer {
        const addr = bs58.decode(this.address); // Buffer.from(this.address, 'hex'); // 26 bytes
        const value = BigIntToBufferLE(this.value, 8);
        const nonce = BigIntToBufferLE(this.nonce, 8);

        let sign = Buffer.alloc(0);
        let pubKey = Buffer.alloc(0);
        if (this.sign != null && this.publicKey != null) {
            sign = Buffer.from(this.sign, 'hex');
            pubKey = Buffer.from(this.publicKey, 'hex');
        }

        return Buffer.concat([addr, value, nonce, sign, pubKey]);
    }

}
