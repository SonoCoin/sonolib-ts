import {TransactionRequestBase, TransactionRequestDto} from "./Dto";
import * as bigInt from "big-integer";
import * as _ from 'lodash';
import {BigInteger} from "big-integer";
import { HDKeys } from "./index";
import {doubleSha256, TxVersion} from "./utils";
import {
    ContractMessage, ContractMessageDto,
    Stake, StakeDto,
    TransactionInput,
    TransactionInputDto,
    TransactionType,
    Transfer,
    TransferDto
} from "./Dto";

export class TransactionRequest extends TransactionRequestBase {

    private readonly _sodium: any;
    private readonly _signers: { [address: string]: HDKeys };

    constructor(sodium: any) {
        super();
        this._sodium = sodium;

        this.version = TxVersion;
        this.inputs = [];
        this._signers = {};
        this.type = TransactionType.Account;
    }

    getTransfersCommission(): BigInteger {
        let commission = bigInt(0);

        this.transfers.forEach(val => {
            commission = commission.plus(val.commission);
        });

        return commission;
    }

    private generateHash() : string {
        const payload = this.toBytes();
        return doubleSha256(payload);
    }

    public toBytes() : Buffer {
        let payload = Buffer.alloc(8); // 4 + 4
        payload.writeUInt32LE(this.type, 0); // 4 bytes
        payload.writeUInt32LE(this.version, 4); // 4 bytes

        const inputs = this.inputs?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        const transfers = this.transfers?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        const messages = this.messages?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        const stakes = this.stakes?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        return Buffer.concat([payload, inputs, transfers, messages, stakes]);
    }

    public validateValue() {
        const transfersValue = this.transfers?.reduce((sum, cur) => {
            return sum.plus(cur.value).plus(cur.commission);
        }, bigInt(0)) || bigInt(0);

        const stakesValue = this.stakes?.reduce((sum, cur) => {
            return sum.plus(cur.value).plus(cur.commission);
        }, bigInt(0)) || bigInt(0);

        const messagesValue = this.messages?.reduce((sum, cur) => {
            return sum.plus(cur.value).plus(cur.commission);
        }, bigInt(0)) || bigInt(0);

        const outValue = transfersValue.plus(stakesValue).plus(messagesValue);

        const inValue = this.inputs?.reduce((sum, cur) => {
            return sum.plus(cur.value);
        }, bigInt(0)) || bigInt(0);

        if (!inValue.equals(outValue)) {
            throw new Error(
                `Wrong sum in transaction, inValue: ${inValue.toString()}, outValue: ${outValue.toString()}`
            )
        }
    }

    public addSender(address: string, keyPair: HDKeys, value: BigInteger, nonce: BigInteger) : TransactionRequest {
        this.inputs = [...this.inputs, new TransactionInput(address, keyPair.publicKey, value, nonce)];
        this._signers[address] = keyPair;
        return this;
    }

    public addTransfer(address: string, value: BigInteger, commission: BigInteger) : TransactionRequest {
        if (!this.transfers) this.transfers = [];
        this.transfers = [...this.transfers, new Transfer(address, value, commission)];
        return this;
    }

    private checkContractsData() {
        if (!this.messages) this.messages = [];
    }

    public addContractCreation(sender: string, payload: string, value: BigInteger, commission: BigInteger) : TransactionRequest {
        this.checkContractsData();
        this.messages = [...this.messages, new ContractMessage(sender, null, payload, value, commission)];
        return this;
    }

    public addContractExecution(sender: string, address: string, payload: string, value: BigInteger, commission: BigInteger) {
        this.checkContractsData();
        this.messages = [...this.messages, new ContractMessage(sender, address, payload, value, commission)];
        return this;
    }

    public addStake(address: string, value: BigInteger, commission: BigInteger, nodeId: string) {
        if (!this.stakes) this.stakes = [];
        this.stakes = [...this.stakes, new Stake(address, value, commission, nodeId)];
        return this;
    }

    public validate() {
        this.validateValue();
    }

    public sign() : TransactionRequest {
        this.validate();

        this.inputs.forEach(input => {
            let msg = this.msgForSignUser(input);

            const key = this._signers[input.address];

            const sigUintArray = key.sign(this._sodium, msg);
            input.sign = Buffer.from(sigUintArray).toString('hex');
        });

        this.hash = this.generateHash();

        return this;
    }

    private msgForSignUser(input: TransactionInput) : Buffer {
        let payload = Buffer.alloc(8); // 4 + 4
        payload.writeUInt32LE(this.type, 0); // 4 bytes
        payload.writeUInt32LE(this.version, 4); // 4 bytes

        const inputPayload = input.toBytes();

        const transfers = this.transfers?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        const messages = this.messages?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        const stakes = this.stakes?.reduce((res, item) => {
            return Buffer.concat([res, item.toBytes()]);
        }, Buffer.alloc(0)) || Buffer.alloc(0);

        return Buffer.concat([payload, inputPayload, transfers, messages, stakes]);
    }

    public toJSON(): string {
        const tx: TransactionRequestDto<number> = {
            ..._.pick(this, ['hash', 'type', 'version']),
            inputs: this.inputs?.map((item) : TransactionInputDto<number> => (
                {
                    ..._.pick(item, ['type', 'address', 'sign', 'publicKey']),
                    value: Number(item.value),
                    nonce: Number(item.nonce),
                }
            )),
            transfers: this.transfers?.map((item) : TransferDto<number> => (
                {
                    ..._.pick(item, ['address']),
                    value: Number(item.value),
                    commission: Number(item.commission),
                }
            )),
            messages: this.messages?.map((item) : ContractMessageDto<number> => (
                {
                    ..._.pick(item, ['sender', 'address', 'payload']),
                    value: Number(item.value),
                    commission: Number(item.commission),
                }
            )),
            stakes: this.stakes?.map((item) : StakeDto<number> => (
                {
                    ..._.pick(item, ['address', 'nodeId']),
                    value: Number(item.value),
                    commission: Number(item.commission),
                }
            )),
        };

        return JSON.stringify(tx);
    };

    public toHex(): string {
        const buf = this.toBytes();
        return buf.toString('hex');
    }

}
