import { useState, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { NETWORKS, WALLET_LABEL, WALLET_TYPES, type CheckoutFormValues, type Wallet } from './schemas'

const control =
  'h-10 w-full rounded border border-border bg-background px-3 text-xs placeholder:text-muted-foreground'

type Aria = { id: string; required?: boolean; 'aria-invalid': boolean; 'aria-describedby'?: string }

function Field({
  name,
  label,
  required,
  hideLabel,
  children,
}: {
  name: keyof CheckoutFormValues
  label: string
  required?: boolean
  hideLabel?: boolean
  children: (aria: Aria) => ReactNode
}) {
  const {
    formState: { errors },
  } = useFormContext<CheckoutFormValues>()
  const error = errors[name]?.message
  const id = `checkout-${name}`
  return (
    <div>
      <label htmlFor={id} className={cn('mb-1 block text-xs', hideLabel && 'sr-only')}>
        {label}
        {required && <span aria-hidden="true" className="text-primary">*</span>}
      </label>
      {children({
        id,
        required,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${id}-erro` : undefined,
      })}
      {error && (
        <p id={`${id}-erro`} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface Props {
  wallets: Wallet[]
  onSubmit: () => void
}

export function CollectorForm({ wallets, onSubmit }: Props) {
  const { register, setValue } = useFormContext<CheckoutFormValues>()
  const [other, setOther] = useState(false)
  const [notice, setNotice] = useState('')

  function toggleOther(checked: boolean) {
    setOther(checked)
    const wallet = wallets.find((w) => w.role === (checked ? 'secondary' : 'primary'))
    setValue('walletAddress', wallet?.address ?? '')
    if (wallet) {
      setValue('walletType', wallet.type)
      setValue('network', wallet.network)
    }
    setNotice(checked && !wallet ? 'Nenhuma carteira secundária cadastrada. Informe os dados manualmente.' : '')
  }

  return (
    <form id="checkout-form" onSubmit={onSubmit} noValidate aria-labelledby="perfil-titulo">
      <h2 id="perfil-titulo" className="text-base font-bold">Perfil do colecionador</h2>

      <div className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Field name="displayName" label="Nome de exibição" required>
          {(a) => <input {...a} className={control} autoComplete="nickname" {...register('displayName')} />}
        </Field>
        <Field name="username" label="Nome de usuário" required>
          {(a) => <input {...a} className={control} autoComplete="username" {...register('username')} />}
        </Field>

        <Field name="network" label="Rede" required>
          {(a) => (
            <select {...a} className={control} {...register('network')}>
              <option value="">Selecione uma rede</option>
              {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
        </Field>
        <Field name="profileName" label="Nome do perfil" required>
          {(a) => <input {...a} className={control} {...register('profileName')} />}
        </Field>

        <Field name="walletAddress" label="Endereço da carteira" required>
          {(a) => (
            <input {...a} className={control} placeholder="Endereço 0x da carteira" spellCheck={false} {...register('walletAddress')} />
          )}
        </Field>
        <Field name="secondaryWallet" label="ENS ou carteira secundária (opcional)" hideLabel>
          {(a) => (
            <input {...a} className={control} placeholder="ENS ou carteira secundária (opcional)" spellCheck={false} {...register('secondaryWallet')} />
          )}
        </Field>

        <Field name="walletType" label="Tipo de carteira" required>
          {(a) => (
            <select {...a} className={control} {...register('walletType')}>
              <option value="">Selecione uma carteira</option>
              {WALLET_TYPES.map((t) => <option key={t} value={t}>{WALLET_LABEL[t]}</option>)}
            </select>
          )}
        </Field>
        <Field name="referralCode" label="Código de indicação" required>
          {(a) => <input {...a} className={control} autoComplete="off" {...register('referralCode')} />}
        </Field>

        <Field name="email" label="E-mail" required>
          {(a) => <input {...a} type="email" className={control} autoComplete="email" {...register('email')} />}
        </Field>
        <Field name="ensName" label="Nome ENS" required>
          {(a) => (
            <div className="flex gap-2">
              <input {...a} className={control} spellCheck={false} {...register('ensName')} />
              <select aria-label="Sufixo ENS" className="h-10 w-20 shrink-0 rounded border border-border bg-background px-2 text-xs">
                <option>.eth</option>
              </select>
            </div>
          )}
        </Field>
      </div>

      <label className="mt-5 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={other}
          onChange={(e) => toggleOther(e.target.checked)}
          className="size-4 accent-primary"
        />
        Usar outra carteira?
      </label>
      <p role="status" className="mt-1 min-h-4 text-xs text-muted-foreground">{notice}</p>

      <div className="mt-4 sm:max-w-[48%]">
        <Field name="notes" label="Observação do colecionador (opcional)">
          {(a) => <textarea {...a} rows={6} className={cn(control, 'h-auto py-2')} {...register('notes')} />}
        </Field>
      </div>
    </form>
  )
}