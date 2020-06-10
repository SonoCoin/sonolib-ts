import * as bs58 from 'bs58';
// import * as keccak256 from 'keccak256';
import { BigInteger } from "big-integer";

const M = 100000000;
const MCountSymbols = 9;
import * as bigInt from 'big-integer';
import * as crypto from "crypto";

const addressChecksumLen = 4;
const ContractVersion = Buffer.from(new Uint8Array([16, 3]));

export const TxVersion = 1;

export const fromSatoshi = (value: number): number => {
	return value / M;
};

export const toBigInt = (value: number): BigInteger => {
	return bigInt(value);
};

export const COMMISSION = toBigInt(1000000);

export const toSatoshi = (value: number): BigInteger => {
	const str = value.toString();
	const dotIndex = str.indexOf('.');
	if (dotIndex == -1) {
		return bigInt(value).multiply(bigInt(M));
	}
	let strConverted = str.replace('.', '');
	if (str.indexOf('0.') === 0) {
		strConverted = str.replace('0.', '');
	}

	if (MCountSymbols - str.length + dotIndex < 0) throw new Error('value smaller then satoshi');
	const strConverted2 = addZeroToEnd(strConverted, MCountSymbols - str.length + dotIndex);
	return bigInt(strConverted2);
};

const addZeroToEnd = (str: string, count: number): string => {
	let newStr = str;
	for (let i = 0; i < count; i++) {
		newStr += '0';
	}
	return newStr;
};

export const NewAddress = (publicKey: Buffer, prefix: Buffer): string => {
	let payload = Buffer.alloc(0);
	payload = Buffer.concat([payload, prefix]);
	const pub256Key = crypto.createHash('sha256').update(publicKey).digest();
	const ripmd160 = crypto.createHash('ripemd160').update(pub256Key).digest();
	payload = Buffer.concat([payload, ripmd160]);
	const checksum = MakeChecksum(payload);

	payload = Buffer.concat([payload, checksum]);
	return bs58.encode(payload);
};

export const MakeChecksum = (payload: Buffer): Buffer => {
	const firstSha256 = crypto.createHash('sha256').update(payload).digest();
	const secondSha256 = crypto.createHash('sha256').update(firstSha256).digest();
	const checksum = Buffer.alloc(4);
	secondSha256.copy(checksum, 0, 0, addressChecksumLen);
	return checksum;
};

export const doubleSha256 = (val: Buffer): string => {
	const first = crypto.createHash('sha256').update(val).digest();
	const second = crypto.createHash('sha256').update(first).digest();
	return second.toString('hex');
};

export const BigIntToBufferLE = (val: BigInteger, size: number): Buffer => {
	const arr = val.toArray(256).value;
	const buf = Buffer.alloc(size);
	buf.set(arr.reverse());
	return buf
};

export const BigIntToBufferBE = (val: BigInteger, size: number): Buffer => {
	const arr = val.toArray(256).value;
	const buf = Buffer.alloc(size);
	buf.set(arr.reverse());
	return buf.reverse();
};

function errInvalidArgTypeMsg(
	name: string,
	expected: string,
	actual: string,
): string {
	return `The "${name}" argument must be of type ${expected}. Recieved type ${actual}`;
}

function errOutOfRangeMsg(expected: string, received: string | number): string {
	return `The value of "offset" is out of range. It must be ${expected}. Received ${received}`;
}

function boundsErrorMsg(value: number, length: number): string {
	if (Math.floor(value) !== value) {
		return errOutOfRangeMsg("an integer", value);
	}

	if (length < 0) return "Attempt to access memory outside buffer bounds";

	return errOutOfRangeMsg(`>= 0 and <=${length}`, value);
}

export function getFirstAndLast(
	buffer: Buffer,
	offset: number,
): { first: number; last: number } {
	if (!Buffer.isBuffer(buffer)) {
		throw new Error(
			errInvalidArgTypeMsg("buffer", "Buffer", typeof buffer),
		);
	}

	if (typeof (offset as unknown) !== "number") {
		throw new Error(
			errInvalidArgTypeMsg("offset", "number", typeof offset),
		);
	}

	const first = buffer[offset] as number | undefined;
	const last = buffer[offset + 7] as number | undefined;
	if (first === undefined || last === undefined) {
		throw new Error(boundsErrorMsg(offset, buffer.length - 8));
	}

	return { first, last };
}

export function readBigUInt64BE(buffer: Buffer, offset = 0): BigInteger {
	const {first, last} = getFirstAndLast(buffer, offset);

	const hi =
		first * 2 ** 24 +
		buffer[++offset] * 2 ** 16 +
		buffer[++offset] * 2 ** 8 +
		buffer[++offset];

	const lo =
		buffer[++offset] * 2 ** 24 +
		buffer[++offset] * 2 ** 16 +
		buffer[++offset] * 2 ** 8 +
		last;

	return bigInt(hi).shiftLeft(bigInt(32)).plus(bigInt(lo));
}
