import { compress, decompress } from '@/utils/compressor'
import type { HashData } from './types'

export async function compressHashData(data: HashData): Promise<string> {
  return await compress(JSON.stringify(data))
}

export async function decompressHashData(data: string): Promise<HashData> {
  const decompressed = await decompress(data)
  return JSON.parse(decompressed)
}
