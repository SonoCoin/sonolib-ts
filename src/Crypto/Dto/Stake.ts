import {BigInteger} from "big-integer";
import {TransferDto} from "./Transfer";
import {BigIntToBufferLE} from "../utils";
import * as bs58 from 'bs58';

export class StakeDto<T> extends TransferDto<T> {

    nodeId: string;

    constructor(address: string, value: T, commission: T, nodeId: string) {
        super(address, value, commission);
        this.nodeId = nodeId;
    }
}

export class Stake extends StakeDto<BigInteger> {

    toBytes(): Buffer {
        const addr = bs58.decode(this.address);
        const value = BigIntToBufferLE(this.value, 8);
        const commission = BigIntToBufferLE(this.commission, 8);

        let node_id = Buffer.alloc(0);
        if (this.nodeId) {
            node_id = Buffer.from(this.nodeId, 'hex');
        }

        return Buffer.concat([addr, value, commission, node_id]);
    }

}
