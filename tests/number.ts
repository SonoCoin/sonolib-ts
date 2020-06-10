import {BigIntToBufferBE, BigIntToBufferLE, readBigUInt64BE, toBigInt} from "../src/Crypto";

describe('number tests', () => {
    it('create wallet test', async () => {
        const num = toBigInt(5000);
        const hexLE = BigIntToBufferLE(num, 8);
        const hexBE = BigIntToBufferBE(num, 8);

        console.log(`${num}`)
        console.log(`${hexLE.toString('hex')}`)
        console.log(`${hexBE.toString('hex')}`)

        const num2 = readBigUInt64BE(hexBE);
        console.log(num2);
    });
});
