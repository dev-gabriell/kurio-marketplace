export interface StoredUser {
  id: string
  username: string
  email: string
  salt: string
  passwordHash: string // SHA-256 de "salt:senha". Nunca a senha em claro.
  createdAt: string
}

// ana@kurio.dev / Kurio@123 · bruno@kurio.dev / Kurio@456
export const seedUsers: StoredUser[] = [
  {
    id: 'user-ana',
    username: 'ana.silva',
    email: 'ana@kurio.dev',
    salt: 'kurio-salt-ana',
    passwordHash: '1cf032b454b775fa6664d257bc37f265ce10786c486a44d10489adb60c9d2446',
    createdAt: '2026-01-10T12:00:00.000Z',
  },
  {
    id: 'user-bruno',
    username: 'bruno.costa',
    email: 'bruno@kurio.dev',
    salt: 'kurio-salt-bruno',
    passwordHash: 'e532cd3f6c758aaf345e51ce5ee93d5323929ee1380c015542e55a2627cd4f56',
    createdAt: '2026-02-03T12:00:00.000Z',
  },
]