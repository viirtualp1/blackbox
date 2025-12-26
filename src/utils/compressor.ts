export async function compress(string: string): Promise<string> {
  const stream = new CompressionStream('deflate-raw')
  const writer = stream.writable.getWriter()

  writer.write(new TextEncoder().encode(string))
  writer.close()

  const buffer = await new Response(stream.readable).arrayBuffer()
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

export async function decompress(string: string): Promise<string> {
  if (string === '') return ''

  const buffer = Uint8Array.from(atob(string), (c) => c.charCodeAt(0))

  const blob = new Blob([buffer])
  const stream = blob
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))

  const response = new Response(stream)
  return response.text()
}
