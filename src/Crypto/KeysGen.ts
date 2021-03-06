import { HDKeys, derivePath } from "./HDKeys";

export class KeysGen {

	private sodium: any;

	constructor(sodium) {
		this.sodium = sodium;
	}

	generateRandom = (): HDKeys => {
		const keyPair = this.sodium.crypto_sign_keypair();
		return new HDKeys(keyPair);
	};

	fromPrivateKey = (privateKey: string): HDKeys => {
		const pkBuf = Buffer.from(privateKey, 'hex');
		const seed = this.sodium.crypto_sign_ed25519_sk_to_seed(pkBuf);
		const keyPair = this.sodium.crypto_sign_seed_keypair(seed);
		return new HDKeys(keyPair);
	};

	fromSeed = (seed: string, path = 'm/0\''): HDKeys => {
		const { key } = derivePath(path, seed);
		return new HDKeys(this.sodium.crypto_sign_seed_keypair(key));
	};

}

