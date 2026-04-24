import * as Crypto from 'expo-crypto';
import type { IdGenerator } from '@/domain/ports/IdGenerator';

export class UuidV7Generator implements IdGenerator {
  next(): string {
    const bytes = Crypto.getRandomBytes(16);
    const ts = Date.now();

    bytes[0] = Math.floor(ts / 0x10000000000) & 0xff;
    bytes[1] = Math.floor(ts / 0x100000000) & 0xff;
    bytes[2] = (ts >>> 24) & 0xff;
    bytes[3] = (ts >>> 16) & 0xff;
    bytes[4] = (ts >>> 8) & 0xff;
    bytes[5] = ts & 0xff;
    bytes[6] = (bytes[6]! & 0x0f) | 0x70;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;

    return formatUuid(bytes);
  }
}

function formatUuid(b: Uint8Array): string {
  const h = (i: number) => b[i]!.toString(16).padStart(2, '0');
  return (
    h(0) + h(1) + h(2) + h(3) + '-' +
    h(4) + h(5) + '-' +
    h(6) + h(7) + '-' +
    h(8) + h(9) + '-' +
    h(10) + h(11) + h(12) + h(13) + h(14) + h(15)
  );
}
