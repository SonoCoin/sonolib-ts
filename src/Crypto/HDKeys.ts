import { Wallet } from './index';
import { KeyPair } from "libsodium-wrappers-sumo";
import { createHmac } from "crypto";

export class HDKeys {

    privateKey: string;
    publicKey: string;

    _keyPair: KeyPair;

    constructor(keyPair: KeyPair) {
        this._keyPair = keyPair;
        this.privateKey = Buffer.from(keyPair.privateKey).toString('hex');
        this.publicKey = Buffer.from(keyPair.publicKey).toString('hex');
    }

    toWallet = (): Wallet => {
        return new Wallet(Buffer.from(this._keyPair.publicKey));
    }

    sign = (sodium: any, data: Buffer): Buffer => {
        // const sigMsg = crypto.createHash('sha256').update(data).digest();
        const sigUintArray = sodium.crypto_sign_detached(data, this._keyPair.privateKey);
        return Buffer.from(sigUintArray);
    };

}

const ED25519_CURVE = 'Sonocoin seed';
const HARDENED_OFFSET = 0x80000000;

type Hex = string;
type Path = string;

type Keys = {
    key: Buffer;
    chainCode: Buffer;
};

export const getMasterKeyFromSeed = (seed) => {
    const hmac = createHmac('sha512', ED25519_CURVE);
    const I = hmac.update(Buffer.from(seed, 'hex')).digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
};

export const CKDPriv = ({ key, chainCode }: Keys, index: number): Keys => {
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);

    const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);

    const I = createHmac('sha512', chainCode)
        .update(data)
        .digest();
    const IL = I.slice(0, 32);
    const IR = I.slice(32);
    return {
        key: IL,
        chainCode: IR,
    };
};

export const derivePath = (path: Path, seed: Hex): Keys => {
    if (!isValidPath(path)) {
        throw new Error('Invalid derivation path');
    }

    const { key, chainCode } = getMasterKeyFromSeed(seed);
    const segments = path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .map((el: string) => parseInt(el, 10));

    return segments.reduce(
        (parentKeys, segment) => CKDPriv(parentKeys, segment + HARDENED_OFFSET),
        { key, chainCode },
    );
};

export const isValidPath = (path: string): boolean => {
    if (!pathRegex.test(path)) {
        return false;
    }
    return !path
        .split('/')
        .slice(1)
        .map(replaceDerive)
        .some(isNaN as any);
};

export const pathRegex = new RegExp("^m(\\/[0-9]+')+$");

export const replaceDerive = (val: string): string => val.replace("'", '');
