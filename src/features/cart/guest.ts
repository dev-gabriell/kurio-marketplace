const KEY = 'kurio:cartId'

export function getGuestCartId(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** Cria o id do carrinho de visitante na primeira vez que ele é necessário. */
export function ensureGuestCartId(): string {
  let id = getGuestCartId()
  if (!id) {
    id = crypto.randomUUID()
    try {
      localStorage.setItem(KEY, id)
    } catch {
      /* sem armazenamento: o carrinho de visitante não sobrevive ao refresh */
    }
  }
  return id
}

export function clearGuestCartId() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}