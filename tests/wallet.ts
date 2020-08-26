import { Crypto, Wallet } from "../src";
import * as bip39 from 'bip39';
import * as crypto from "crypto";

const seed = "-";

describe('wallet tests', () => {
    it('is valid address', async () => {
        const receivers: Array<string> = [
            "SXct3wygNfKX5nS2gt9omD3H6qppckd66Ne", // - First wallet
        ];

        receivers.forEach(val => {
            console.log(Wallet.IsValidContractAddress(val));
        });
    });
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
        const mnemonic = "pony stone together crowd raw absent athlete sing drift wide woman size";
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
    it('restore wallet test', async () => {
        const mnemonic = 'fence attend coil impact hunt cloth split sword hip typical nerve mail dutch rack senior egg march endorse';
        const seed = bip39.mnemonicToSeed(mnemonic).toString('hex');
        console.log(seed);
        const wallet = await Wallet.fromSeed(seed, 0);
        console.log(wallet.privateKey);
        console.log(wallet.publicKey);
    });
});
