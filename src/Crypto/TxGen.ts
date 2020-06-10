import {TransactionRequest} from "./TransactionRequest";
import {Erc20Transfer} from "../Contracts";

export class TxGen {

	private readonly sodium;

	constructor(sodium) {
		this.sodium = sodium;
	}

	public generateTx() : TransactionRequest {
		return new TransactionRequest(this.sodium);
	}

	public generateErc20Transfer() : Erc20Transfer {
		return new Erc20Transfer(this.sodium);
	}

}
