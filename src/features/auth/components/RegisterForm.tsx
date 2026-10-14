import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { applyApiError } from '../errors'
import { useRegister } from '../mutations'
import { registerSchema, type RegisterInput } from '../schemas'
import { Field, PasswordField } from './Field'

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState<string>()
  const signup = useRegister()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ username, email, password }) => {
    setFormError(undefined)
    try {
      await signup.mutateAsync({ username, email, password })
      toast.success('Conta criada! Você já está conectado.')
      onSuccess()
    } catch (error) {
      applyApiError(error, setError, setFormError)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <Field
        label="Nome de usuário"
        placeholder="Nome de usuário"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <Field
        label="E-mail"
        type="email"
        placeholder="Digite seu e-mail"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordField
        label="Senha"
        placeholder="Senha"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordField
        label="Confirmar senha"
        placeholder="Confirmar senha"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {formError && (
        <p role="alert" className="text-xs text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={signup.isPending}>
        {signup.isPending ? 'Criando conta…' : 'Criar conta'}
      </Button>
    </form>
  )
}