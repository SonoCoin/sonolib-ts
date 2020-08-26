import {Client, Crypto, Wallet, COMMISSION, toSatoshi, toBigInt} from "../src";

const pk = ' ';
const baseUrl = 'https://explorer.sonocoin.io/api/rest/v1';

function delay(sec: number) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

describe('create transaction', () => {
    it('create manual transaction', async () => {
        const receiver = "SCcogkBGGpSxdB5iHzxcPGTp2GDfWG1yim7";
        const amount = 999999;

        const client = new Client(baseUrl);
        const crypto = await Crypto.init();

        const hdKeys = crypto.keysGen.fromPrivateKey(pk);
        const wallet = hdKeys.toWallet();

        const nonce = await client.getNonce(wallet.Base58Address);

        let tx = crypto.tx.generateTx()
            .addCommission(toBigInt(1), COMMISSION)
            .addSender(wallet.Base58Address, hdKeys, toSatoshi(amount).plus(COMMISSION), nonce.unconfirmedNonce)
            .addTransfer(receiver, toSatoshi(amount))
            .sign();

        try {
            console.log(tx.toJSON());
            const data = await client.send(tx);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    });
    it('create manual transaction: gas price', async () => {
        const receiver = "SCT1aPrrwL2Yr1yT4ZKiRTotCbqs2QkVLjx";
        const amount = 10000000;

        const gasPrice = toBigInt(0);
        const commission = gasPrice.multiply(COMMISSION);

        const client = new Client(baseUrl);
        const crypto = await Crypto.init();

        const hdKeys = crypto.keysGen.fromPrivateKey(pk);
        const wallet = hdKeys.toWallet();

        const nonce = await client.getNonce(wallet.Base58Address);

        let tx = crypto.tx.generateTx()
            .addCommission(gasPrice, COMMISSION)
            .addSender(wallet.Base58Address, hdKeys, toSatoshi(amount).plus(commission), nonce.unconfirmedNonce)
            .addTransfer(receiver, toSatoshi(amount))
            .sign();

        let json = tx.toJSON();

        console.log(json);

        let txParsed = JSON.parse(json);

        try {
            const data = await client.send(txParsed);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    });
    it('restore', async () => {
        const receivers = [
            { address: "SCjRdq6w3QX8HWusFc6mUXbkMgbKB9shhZt", balance: toBigInt(1499000000) },
            { address: "SCevn17ZJ2YBMxjPNNBEynXz46Q9soN9Eni", balance: toBigInt(90997655224) },
            { address: "SCq8Ag9yJZ3AW9p6acbr6XTsPt1cau6KoPA", balance: toBigInt(699000000) },
            { address: "SCgigZWwAPX2P3y3z5ubBGRadLND4Zec1bC", balance: toBigInt(82987276120) },
            { address: "SCVUiWpxqM1Hg3q6BtRE7WZsftERUYkghkt", balance: toBigInt(989000001) },
            { address: "SCkcknPyccpqH1yYijdVo62qZseM8tyqNfZ", balance: toBigInt(300000000) },
            { address: "SCiF4tX1k5CET5NdqLeAFQSaYQbQ2hY8cvG", balance: toBigInt(3987635896) },
            { address: "SCShqMExi7aq4Pg7J4Y724MiNv7poo3ggv1", balance: toBigInt(1500000000) },
            { address: "SCgn1XBKWz3Dso8pgNb11feFn3p7co52Rkz", balance: toBigInt(1005670223) },
            { address: "SCSuv844LNVccEGVHq6BWbg32bDxfHJAXVc", balance: toBigInt(1497670224) },
            { address: "SCZfnKxS2zcbtPCx9pxzFJHnKbqdgz3xzyu", balance: toBigInt(2450997000000) },
            { address: "SCkVJ5ji3ataYwjW221CxRnxcQJd8a8SM1X", balance: toBigInt(2000000000000) },
            { address: "SCoXux85Ed4ARtmNd52u97Ry3zPyTfADCVk", balance: toBigInt(3050000000000) },
            { address: "SCWaa9Wjetzysx24kPw2PiMSEhb9HWjh5LL", balance: toBigInt(2500000000000) },
            { address: "SChWMofzX6WsiktcbF3ysrK14Yv59hfbSNa", balance: toBigInt(10000000000) },
            { address: "SCigaYBVmALLd5bvEd3QvWL27FS8nsjssDY", balance: toBigInt(100000000) },
            { address: "SCShqMExi7aq4Pg7J4Y724MiNv7poo3ggv1", balance: toBigInt(2700000000) },
            { address: "SCcMdj6G3U98xjt9NBPKqLWcbKLDCzHcvTY", balance: toBigInt(20000000000000) },
        ];

        // const receiver = "SCWGuYqv2guLSxzcDrwBGzFHqZvohQiVUbp";
        // const amount = 100;

        for (let item of receivers) {

            const receiver = item.address;
            const amount = item.balance;

            const gasPrice = toBigInt(0);
            const commission = gasPrice.multiply(COMMISSION);

            const client = new Client(baseUrl);
            const crypto = await Crypto.init();

            const hdKeys = crypto.keysGen.fromPrivateKey(pk);
            const wallet = hdKeys.toWallet();

            const nonce = await client.getNonce(wallet.Base58Address);

            let tx = crypto.tx.generateTx()
                .addCommission(gasPrice, COMMISSION)
                .addSender(wallet.Base58Address, hdKeys, amount.plus(commission), nonce.unconfirmedNonce)
                .addTransfer(receiver, amount)
                .sign();

            try {
                console.log(tx.toJSON());
                const data = await client.send(tx);
                console.log(data);
            } catch (e) {
                console.error(e);
            }

            await delay(randomIntFromInterval(11, 25));
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
            tx.addTransfer(rec, toSatoshi(0.1));
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
    it ('get tx by hash', async () => {
        let hash = '583ec83949fa209f8368e443a4c870d8764da238be255625da0432ea7477c63b';

        const client = new Client(baseUrl);
        try {
            const data = await client.getTx(hash);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    })
});
