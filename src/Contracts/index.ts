import * as createKeccakHash from 'keccak';

export * from './Erc20Transfer';

export class Contracts {

    public static funcHex(funcName, ...args) {
        const payload = funcName + "(" + args.join(',') + ")";
        let buf = createKeccakHash('keccak256').update(payload).digest('hex');
        return buf.slice(0, 8);
    }

    public static funcHexFromString(func) {
        let buf = createKeccakHash('keccak256').update(func).digest('hex');
        return buf.slice(0, 8);
    }

}