import {BigIntToBufferBE, HDKeys, toBigInt, TransactionInput, TransactionRequest} from "../Crypto";
import {BigInteger} from "big-integer";
import * as bs58 from 'bs58';

export const Erc20TransferHex = "5d359fbd";
export const Erc20BalanceHex = "70a08231";

export class Erc20Transfer {

    private _txRequest: TransactionRequest;
    private _sender: string;

    constructor(sodium: any) {
        this._txRequest = new TransactionRequest(sodium);
    }

    // amount = commission in sono from transfer
    public addSender(address: string, keyPair: HDKeys, amount: BigInteger, nonce: BigInteger) : Erc20Transfer {
        this._sender = address;
        this._txRequest.addSender(address, keyPair, amount, nonce);
        return this;
    }

    // amount of tokens
    // commission in SONO
    public addTransfer(contract: string, address: string, amount: BigInteger, commission: BigInteger) : Erc20Transfer {
        const addr = bs58.decode(address).toString('hex');
        const am = BigIntToBufferBE(amount, 8).toString('hex');
        const payload = Erc20TransferHex + addr + am;
        this._txRequest.addContractExecution(this._sender, contract, payload, toBigInt(0), commission);
        return this;
    }

    public sign() : TransactionRequest {
        return this._txRequest.sign();
    }

}