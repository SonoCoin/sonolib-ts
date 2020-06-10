import * as libsodium from "libsodium-wrappers-sumo";
import {KeysGen, TxGen} from "./index";

export class Crypto {
    public keysGen: KeysGen;
    public tx: TxGen;

    constructor(sodium) {
        this.keysGen = new KeysGen(sodium);
        this.tx = new TxGen(sodium);
    }

    public static init = async (): Promise<Crypto> => {
        await libsodium.ready;
        return new Crypto(libsodium);
    };
}
