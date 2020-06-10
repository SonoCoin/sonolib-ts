const baseUrl = 'https://testnet.sonocoin.io/api/rest/v1';
import { Client } from "../src/Client";

describe('client test', () => {
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
