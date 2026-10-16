import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthNavigation, type AuthTab } from '../navigation'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

const rootApi = getRouteApi('__root__')

const trigger =
  'flex-none rounded-none border-0 bg-transparent px-0 text-base shadow-none ' +
  'data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'

const social = () => toast('Login social indisponível nesta demo.')

const DESCRIPTION: Record<AuthTab, string> = {
  login: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
  register: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
}

export function AuthDialog() {
  const { auth, redirect: redirectTo } = rootApi.useSearch()
  const { closeAuth, switchTab, finishAuth } = useAuthNavigation()
  const tab: AuthTab = auth ?? 'login'

  return (
    <Dialog
      open={auth !== undefined}
      onOpenChange={(open) => {
        if (!open) closeAuth()
      }}
    >
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto border-0 bg-card p-0 sm:max-w-[340px]">
        <Tabs value={tab} onValueChange={(v) => switchTab(v as AuthTab)}>
          <div className="px-6 pt-8">
            <DialogTitle className="sr-only">Acessar a Kurio</DialogTitle>
            <TabsList className="mx-auto h-auto w-fit bg-transparent p-0">
              <TabsTrigger value="login" className={trigger}>Entrar</TabsTrigger>
              <span aria-hidden="true" className="mx-3 h-4 w-px bg-primary/60" />
              <TabsTrigger value="register" className={trigger}>Criar conta</TabsTrigger>
            </TabsList>
            <DialogDescription className="mt-4 text-center text-xs leading-5">
              {DESCRIPTION[tab]}
            </DialogDescription>
            {redirectTo && (
              <p role="status" className="mt-3 text-center text-xs text-primary">
                Entre para continuar.
              </p>
            )}
          </div>
          <div className="px-6 py-5">
            <TabsContent value="login">
              <LoginForm onSuccess={() => finishAuth(redirectTo)} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onSuccess={() => finishAuth(redirectTo)} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t border-border px-6 py-5">
          <p className="mb-3 text-center text-xs">Ou continue com</p>
          <div className="space-y-2">
            <button type="button" onClick={social} className="flex h-9 w-full items-center justify-center gap-2 rounded border border-border text-xs">
              <span aria-hidden="true" className="font-bold text-[#4285f4]">G</span> Continuar com Google
            </button>
            <button type="button" onClick={social} className="flex h-9 w-full items-center justify-center gap-2 rounded border border-border text-xs">
              <span aria-hidden="true" className="font-bold text-[#1877f2]">f</span> Continuar com Facebook
            </button>
          </div>
        </div>
        <div aria-hidden="true" className="h-2 bg-primary" />
      </DialogContent>
    </Dialog>
  )
}