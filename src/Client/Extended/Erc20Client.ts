import {Balance, ContractMessageDto} from "../../Dtos";
import {BigInteger} from "big-integer";
import * as bigInt from "big-integer";
import * as bs58 from 'bs58';
import {AxiosInstance} from "axios";
import {StaticCall} from "../../Dtos/StaticCall";
import {BigIntToBufferBE, readBigUInt64BE, toSatoshi} from "../../Crypto";
import {Erc20BalanceHex, Erc20TransferHex} from "../../Contracts";

export class Erc20Client {

    protected readonly http: AxiosInstance;
    protected readonly baseAddress: string;

    constructor(baseAddress: string, http: AxiosInstance) {
        this.http = http;
        this.baseAddress = baseAddress;
    }

    public staticCall = async (contract: string, payload: string): Promise<StaticCall<BigInteger>> => {
        try {
            const params = {
                address: contract,
                payload: payload,
            };
            const { data } = await this.http.post(`${this.baseAddress}/contract/static_call`, params,
                { 'headers': { 'Content-Type': 'application/json' } });

            return {
                consumedFee: bigInt(data.consumedFee),
                result: data.result,
            } as StaticCall<BigInteger>
        } catch (e) {
            throw e.response.data.message;
        }
    };

    public consumedFee = async (sender: string, contract: string | null, payload: string,
                                value: BigInteger = toSatoshi(0), commission: BigInteger = toSatoshi(0)): Promise<StaticCall<BigInteger>> => {
        try {
            const msg = new ContractMessageDto<Number>(sender, contract, payload, Number(value), Number(commission));

            const { data } = await this.http.post(`${this.baseAddress}/contract/consumed_fee`, msg,
                { 'headers': { 'Content-Type': 'application/json' } });

            return {
                consumedFee: bigInt(data.consumedFee),
                result: data.result,
            } as StaticCall<BigInteger>
        } catch (e) {
            throw e.response.data.message;
        }
    };

    public getTransferFee = async (sender: string, contract: string, address: string, amount: BigInteger) : Promise<BigInteger> => {
        try {
            const addr = bs58.decode(address).toString('hex');
            const am = BigIntToBufferBE(amount, 8).toString('hex');
            const payload = Erc20TransferHex + addr + am;

            const data = await this.consumedFee(sender, contract, payload);

            return bigInt(data.consumedFee);
        } catch (e) {
            throw e;
        }
    };

    public getTokenBalance = async (contract: string, address: string) : Promise<Balance<BigInteger>> => {
        try {
            const addr = bs58.decode(address).toString('hex');
            const payload = Erc20BalanceHex + addr;
            const data = await this.staticCall(contract, payload);

            let balance = readBigUInt64BE(Buffer.from(data.result, 'hex'));

            return {
                address: 		    address,
                confirmedAmount: 	balance,
                unconfirmedAmount:  balance,
            } as Balance<BigInteger>;
        } catch (e) {
            throw e.response.data.message;
        }
    };

}
