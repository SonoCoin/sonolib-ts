const baseUrl = 'https://testnet.sonocoin.io/api/rest/v1';
import { Client } from "../src/Client";

describe('client test', () => {
    it('get info', async () => {
        const client = new Client(baseUrl);

        const info = await client.info();
        console.log(info);
    });

    it('get header by hash', async () => {
        const client = new Client(baseUrl);

        const hash = "bff01a475000e90dacdc004441accfc4770d94d8e73e40ed7841ac5940b2cba0";

        try {
            const resp = await client.getHeader(hash);
            console.log(resp);
        } catch (e) {
            console.log('error', e)
        }
    });
    it('get header by height', async () => {
        const client = new Client(baseUrl);

        const height = 100;

        try {
            const resp = await client.getHeaderByHeight(height);
            console.log(resp);
        } catch (e) {
            console.log('error', e)
        }
    });

    it('get block by hash', async () => {
        const client = new Client(baseUrl);

        const hash = "bff01a475000e90dacdc004441accfc4770d94d8e73e40ed7841ac5940b2cba0";

        try {
            const resp = await client.getBlock(hash);
            console.log(JSON.stringify(resp));
        } catch (e) {
            console.log('error', e)
        }
    });

    it('get block by height', async () => {
        const client = new Client(baseUrl);

        const height = 100;

        try {
            const resp = await client.getBlockByHeight(height);
            console.log(JSON.stringify(resp));
        } catch (e) {
            console.log('error', e)
        }
    });

    it('get balance', async () => {
        const addresses: Array<string> = [
            "SCi6bbSEyk4iQJP4iFXTQfmBpPWWffbBUa7", // - First wallet
        ];

        const client = new Client(baseUrl);

        for (const val of addresses) {
            const balance = await client.getBalance(val);
            console.log(balance);
        }

        for (const val of addresses) {
            client.getBalance(val)
                .then(balance => console.log(balance))
                .catch(e => console.log(e));
        }
    });

    it('get nonce', async () => {
        const addresses: Array<string> = [
            "SCi6bbSEyk4iQJP4iFXTQfmBpPWWffbBUa7", // - First wallet
        ];

        const client = new Client(baseUrl);

        for (const val of addresses) {
            const nonce = await client.getNonce(val);
            console.log(nonce);
        }

        for (const val of addresses) {
            client.getNonce(val)
                .then(nonce => {
                    console.log(nonce);
                })
                .catch(e => console.log(e));
        }
    });
});
