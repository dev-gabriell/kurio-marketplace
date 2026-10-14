import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { isApiError } from '@/lib/http'

export function applyApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  setFormError: (message: string) => void,
) {
  if (!isApiError(error)) return setFormError('Algo deu errado. Tente novamente.')
  if (error.code === 'timeout') return setFormError('O servidor demorou para responder. Tente novamente.')
  if (error.status === null) {
    return setFormError('Sem conexão com o servidor. Verifique sua internet e tente novamente.')
  }
  if (error.fields) {
    for (const [field, message] of Object.entries(error.fields)) {
      setError(field as Path<T>, { type: 'server', message })
    }
    return
  }
  setFormError(error.status >= 500 ? 'O servidor falhou. Tente novamente em instantes.' : error.message)
}