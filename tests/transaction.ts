import { Client, Crypto, Wallet, COMMISSION, toSatoshi } from "../src";

const pk = '-';
const baseUrl = 'https://explorer.sonocoin.io/api/rest/v1';

describe('create transaction', () => {
    it('create manual transaction', async () => {
        const receiver = "SCY92fUSz8vAkLrKdbWts4HatJ5fXEFXceH";
        const amount = 100;

        const client = new Client(baseUrl);
        const crypto = await Crypto.init();

        const hdKeys = crypto.keysGen.fromPrivateKey(pk);
        const wallet = hdKeys.toWallet();

        const nonce = await client.getNonce(wallet.Base58Address);

        let tx = crypto.tx.generateTx()
            .addSender(wallet.Base58Address, hdKeys, toSatoshi(amount).plus(COMMISSION), nonce.unconfirmedNonce)
            .addTransfer(receiver, toSatoshi(amount), COMMISSION)
            .sign();

        try {
            console.log(tx.toJSON());
            const data = await client.send(tx);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    });
    it('create fixed transaction', async () => {
        const receivers: Array<string> = [
            "SCWz1UP4xmfBe4zbT83QLM3UN2BdT9oKayB", // - First wallet
        ];

        const client = new Client(baseUrl);
        const crypto = await Crypto.init();

        const hdKeys = crypto.keysGen.fromPrivateKey(pk);
        const wallet = hdKeys.toWallet();

        console.log(wallet.Base58Address);

        let tx = crypto.tx.generateTx();

        const nonce = await client.getNonce(wallet.Base58Address);

        tx.addSender(wallet.Base58Address, hdKeys, toSatoshi(0.1 * receivers.length).plus(COMMISSION), nonce.unconfirmedNonce);

        receivers.forEach(rec => {
            tx.addTransfer(rec, toSatoshi(0.1), COMMISSION);
        });

        const txSigned = tx.sign();

        try {
            console.log(txSigned.toJSON());

            const data = await client.send(txSigned);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    });
    it('is valid address', async () => {
        const receivers: Array<string> = [
            "SC8EvyqbB2z2MHmXUWVdLnwDnENdhywqozv8", // - First wallet
        ];

        receivers.forEach(val => {
            console.log(Wallet.IsValidAddress(val));
        });
    });
});
