import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { applyApiError } from '../errors'
import { useLogin } from '../mutations'
import { loginSchema, type LoginInput } from '../schemas'
import { Field, PasswordField } from './Field'

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [formError, setFormError] = useState<string>()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined)
    try {
      await login.mutateAsync(values)
      toast.success('Bem-vindo de volta!')
      onSuccess()
    } catch (error) {
      applyApiError(error, setError, setFormError)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <Field
        label="E-mail"
        type="email"
        placeholder="contato@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordField
        label="Senha"
        placeholder="Senha"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <div className="text-right">
        <button
          type="button"
          onClick={() => toast('Recuperação de senha indisponível nesta demo.')}
          className="text-xs text-primary"
        >
          Esqueceu a senha?
        </button>
      </div>
      {formError && (
        <p role="alert" className="text-xs text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  )
}