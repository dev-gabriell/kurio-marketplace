const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')

export async function sha256Hex(text: string) {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))
}

export const hashPassword = (password: string, salt: string) => sha256Hex(`${salt}:${password}`)

export const randomToken = () => `tok_${crypto.randomUUID()}`