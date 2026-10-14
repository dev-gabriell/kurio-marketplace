import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  createdAt: z.string(),
})
export type User = z.infer<typeof userSchema>

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
  expiresAt: z.string(),
})
export type AuthResponse = z.infer<typeof authResponseSchema>

export const sessionResponseSchema = z.object({ user: userSchema, expiresAt: z.string() })

const email = z.string().min(1, 'Informe seu e-mail.').email('Digite um e-mail válido.')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerBodySchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'O nome de usuário deve ter ao menos 3 caracteres.')
    .max(24, 'O nome de usuário deve ter no máximo 24 caracteres.')
    .regex(/^[\w.-]+$/, 'Use apenas letras, números, ponto, hífen ou sublinhado.'),
  email,
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'Inclua ao menos uma letra.')
    .regex(/\d/, 'Inclua ao menos um número.'),
})
export type RegisterBody = z.infer<typeof registerBodySchema>

export const registerSchema = registerBodySchema
  .extend({ confirmPassword: z.string().min(1, 'Confirme sua senha.') })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })
export type RegisterInput = z.infer<typeof registerSchema>