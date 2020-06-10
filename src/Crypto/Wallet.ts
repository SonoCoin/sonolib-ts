import * as crypto from 'crypto';
import * as bs58 from 'bs58';
import {Crypto} from "./Crypto";
import { toBigInt, toSatoshi} from "./index";
import * as bigInt from "big-integer";

const version = Buffer.from(new Uint8Array([14, 48]));
const addressChecksumLen = 4;

const COMMISSION = bigInt(1000000);
const DOUBLE_COMMISSION = bigInt(2000000);
const SATOSHI = bigInt(100000000);

export class Wallet {

    address: Buffer;
    Base58Address: string;
    private _publicKey: Buffer;

    constructor(publicKey: Buffer) {
        this._publicKey = publicKey;
        let payload = Buffer.alloc(0);
        payload = Buffer.concat([payload, version]);
        const pub256Key = crypto.createHash('sha256').update(publicKey).digest();
        const ripmd160 = crypto.createHash('ripemd160').update(pub256Key).digest();
        payload = Buffer.concat([payload, ripmd160]);
        const checksum = Wallet.makeChecksum(payload);

        payload = Buffer.concat([payload, checksum]);
        this.address = payload;
        this.Base58Address = bs58.encode(payload)
    }

    private static makeChecksum(payload: Buffer): Buffer {
        const firstSha256 = crypto.createHash('sha256').update(payload).digest();
        const secondSha256 = crypto.createHash('sha256').update(firstSha256).digest();
        const checksum = Buffer.alloc(4);
        secondSha256.copy(checksum, 0, 0, addressChecksumLen);
        return checksum
    }

    static IsValidAddress(address: string): boolean {
        let addressBytes;
        try {
            addressBytes = bs58.decode(address);
        } catch (e) {
            console.error(e);
            return false;
        }
        if (addressBytes.length < version.length + addressChecksumLen) {
            return false;
        }
        const ver = addressBytes.subarray(0, 2);

        if (Buffer.compare(Buffer.from(ver), Buffer.from(version)) !== 0) {
            return false;
        }
        const payload = addressBytes.subarray(0, addressBytes.length - addressChecksumLen);
        const check = Wallet.makeChecksum(payload);
        const checkAddress = Buffer.concat([Buffer.from(payload), Buffer.from(check)]);
        return Buffer.compare(checkAddress, addressBytes) == 0;
    }

    static async fromSeedAsync(seed: string, path: number) {
        const crypto = await Crypto.init();
        return crypto.keysGen.fromSeed(seed, 'm/' + path + '\'');
    }

    static fromSeed(seed: string, path: number) {
        return Crypto.init().then(cr => cr.keysGen.fromSeed(seed, 'm/' + path + '\''));
    }

    static tx(nonce: number, seed: string, pathIndex: number, address: string, amount: number) {
        return Crypto.init().then(cr => {
            const hdKeys = cr.keysGen.fromSeed(seed, 'm/' + pathIndex + '\'');
            const wallet = hdKeys.toWallet();

            return cr.tx.generateTx()
                .addSender(wallet.Base58Address, hdKeys, toSatoshi(amount).plus(COMMISSION), toBigInt(nonce))
                .addTransfer(address, toSatoshi(amount), COMMISSION)
                .sign();
        });
    }

    static createContract(nonce: number, seed: string, pathIndex: number, code: string, amount: number, fee: number) {
        return Crypto.init().then(cr => {
            const hdKeys = cr.keysGen.fromSeed(seed, 'm/' + pathIndex + '\'');
            const wallet = hdKeys.toWallet();

            const commission = toSatoshi(fee);
            return cr.tx.generateTx()
                .addSender(wallet.Base58Address, hdKeys, toSatoshi(amount).plus(commission).plus(COMMISSION), toBigInt(nonce))
                .addContractCreation(wallet.Base58Address, code, toBigInt(amount).multiply(SATOSHI), commission)
                .sign();
        });
    }

    static executeContract(nonce: number, seed: string, pathIndex: number, address: string, input: string, amount: number) {
        return Crypto.init().then(cr => {
            const hdKeys = cr.keysGen.fromSeed(seed, 'm/' + pathIndex + '\'');
            const wallet = hdKeys.toWallet();

            return cr.tx.generateTx()
                .addSender(wallet.Base58Address, hdKeys, toSatoshi(amount).plus(DOUBLE_COMMISSION), toBigInt(nonce))
                .addContractExecution(wallet.Base58Address, address, input, toBigInt(amount).multiply(SATOSHI), COMMISSION)
                .sign();
        });
    }
}

