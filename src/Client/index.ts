import axios, {AxiosInstance} from "axios";
import {Balance} from "../Crypto/Dto/Balance";
import {BigInteger} from "big-integer";
import * as bigInt from "big-integer";
import {Nonce} from "../Crypto/Dto/Nonce";
import {TransactionRequest} from "../Crypto/TransactionRequest";
import {StaticCall} from "../Crypto/Dto/StaticCall";
import {Erc20Client} from "./Extended";
import {toSatoshi} from "../Crypto";

let config = {
	// baseURL: process.env.baseURL || process.env.apiUrl || ""
	timeout: 60 * 1000, // Timeout
	// withCredentials: true, // Check cross-site Access-Control
};

export class Client {

	protected readonly http: AxiosInstance;
	protected readonly baseAddress: string;
	public erc20: Erc20Client;

	constructor(baseAddress: string) {
		this.http = axios.create(config);
		this.baseAddress = baseAddress;

		this.erc20 = new Erc20Client(baseAddress, this.http);
	}

	public getBalance = async (address: string): Promise<Balance<BigInteger>> => {
		try {
			const { data } = await this.http.get<Balance<number>>(`${this.baseAddress}/account/${address}/balance`);
			return {
				address: 			data.address,
				confirmedAmount: 	bigInt(data.confirmedAmount),
				unconfirmedAmount: bigInt(data.unconfirmedAmount),
			} as Balance<BigInteger>;
		} catch (e) {
			throw e.response.data.message;
		}
	};

	// @TODO return
	// public getBulkWalletBalances = async(address: string[]): Promise<Balance<BigInteger>[]> => {
	// 	try {
	// 		const { data } = await this.http.get<Balance<number>[]>(`${this.uri}/wallet/balances`);
	// 		let newData: Balance<BigInteger>[] = [];
	// 		data.forEach(val => {
	// 			newData.push({
	// 				address: 			val.address,
	// 				confirmedAmount: 	bigInt(val.confirmedAmount),
	// 				unconfirmedAmount: bigInt(val.unconfirmedAmount),
	// 			} as Balance<BigInteger>)
	// 		});
	// 		return newData;
	// 	} catch (e) {
	// 		throw e.response.data.message;
	// 	}
	// };

	public getNonce = async (address: string): Promise<Nonce<BigInteger>> => {
		try {
			const { data } = await this.http.get<Nonce<number>>(`${this.baseAddress}/account/${address}/nonce`);
			return {
				confirmedNonce: bigInt(data.confirmedNonce),
				unconfirmedNonce: bigInt(data.unconfirmedNonce),
			} as Nonce<BigInteger>
		} catch (e) {
			throw e.response.data.message;
		}
	};

	public send = async (tx: TransactionRequest): Promise<boolean> => {
		try {
			const txJSON = tx.toJSON();
			const { data } = await this.http.post(`${this.baseAddress}/txs/publish`, txJSON,
				{ 'headers': { 'Content-Type': 'application/json' } });
			return data.result == 'ok';
		} catch (e) {
			throw e.response.data.message;
		}
	};

	public staticCall = async (address: string, payload: string): Promise<StaticCall<BigInteger>> => {
		return this.erc20.staticCall(address, payload);
	};
	public consumedFee = async (sender: string, contract: string | null, payload: string,
								value: BigInteger = toSatoshi(0), commission: BigInteger = toSatoshi(1000)): Promise<StaticCall<BigInteger>> => {
		return this.erc20.consumedFee(sender, contract, payload, value, commission);
	};

}
