import { Crypto } from "../src";
import * as bip39 from 'bip39';
import * as crypto from "crypto";

const seed = "-";

describe('wallet tests', () => {
    it('generate new wallet', async () => {
        let randomBytes = crypto.randomBytes(Math.round(32)); // 128 bits is enough
        let mnemonic = bip39.entropyToMnemonic(randomBytes.toString('hex'))
        let seed = bip39.mnemonicToSeed(mnemonic).toString('hex'); // you'll use this in #3 below

        let sonoCrypto = await Crypto.init();
        const hdKeys = sonoCrypto.keysGen.fromSeed(seed);

        console.log("mnemonic", mnemonic);
        console.log("seed", seed);
        console.log("priv", hdKeys.privateKey);
        console.log("pub", hdKeys.publicKey);

        const wallet = hdKeys.toWallet();

        console.log("addr", wallet.Base58Address);
    });
    it('create wallet from mnemonic', async () => {
        const mnemonic = "grain catch elder liquid ginger daring sure brush sudden whisper garden model";
        let seed = bip39.mnemonicToSeed(mnemonic).toString('hex'); // you'll use this in #3 below

        let crypto = await Crypto.init();
        const hdKeys = crypto.keysGen.fromSeed(seed);

        console.log("priv", hdKeys.privateKey);
        console.log("pub", hdKeys.publicKey);

        const wallet = hdKeys.toWallet();

        console.log("addr", wallet.Base58Address);
    });
    it('create wallet test', async () => {
        let crypto = await Crypto.init();
        const hdKeys = crypto.keysGen.fromSeed(seed);
        const wallet = hdKeys.toWallet();

        console.log(wallet.Base58Address);
    });
});
