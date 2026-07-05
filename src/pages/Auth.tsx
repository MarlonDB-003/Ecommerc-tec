import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, ShoppingBag, Shield, Zap } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) {
      toast({ title: 'Erro ao entrar', description: 'E-mail ou senha incorretos.', variant: 'destructive' });
    } else {
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password.length < 6) {
      toast({ title: 'Senha muito curta', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({ title: 'Senhas não coincidem', description: 'Verifique os campos de senha.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.displayName);
    if (error) {
      toast({ title: 'Erro ao cadastrar', description: 'Verifique os dados e tente novamente.', variant: 'destructive' });
    } else {
      navigate('/');
    }
    setIsLoading(false);
  };

  const passwordMismatch =
    signupForm.confirmPassword.length > 0 &&
    signupForm.password !== signupForm.confirmPassword;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-white/5 rounded-full" />
          <div className="absolute bottom-0 -right-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full" />
        </div>

        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à loja
          </Link>
        </div>

        <div className="relative space-y-10">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-3">
              Tech<span className="text-white/50">World</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Sua loja de tecnologia de última geração.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Catálogo completo</p>
                <p className="text-white/55 text-xs mt-0.5">Smartphones, gaming, consoles e componentes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Compra segura</p>
                <p className="text-white/55 text-xs mt-0.5">Seus dados protegidos em todas as transações</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Entrega rápida</p>
                <p className="text-white/55 text-xs mt-0.5">Receba seus produtos no menor tempo possível</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-white/30 text-xs">© 2024 TechWorld. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-border">
          <button
            onClick={() => navigate('/')}
            className="text-2xl font-black tracking-tight"
          >
            Tech<span className="text-primary">World</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-md">
            {/* Desktop back link */}
            <div className="hidden lg:flex justify-end mb-10">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar à loja
              </Link>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 mb-8">
                <TabsTrigger value="login" className="text-sm font-medium">Entrar</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Criar conta</TabsTrigger>
              </TabsList>

              {/* Login tab */}
              <TabsContent value="login">
                <div className="mb-7">
                  <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
                  <p className="text-muted-foreground text-sm mt-1">Entre com sua conta para continuar</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-11"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        className="pl-10 pr-11 h-11"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-semibold mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar na conta'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup tab */}
              <TabsContent value="signup">
                <div className="mb-7">
                  <h2 className="text-2xl font-bold">Crie sua conta</h2>
                  <p className="text-muted-foreground text-sm mt-1">Preencha os dados para se cadastrar</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name">
                      Nome{' '}
                      <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Como você quer ser chamado"
                        className="pl-10 h-11"
                        value={signupForm.displayName}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, displayName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 h-11"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10 pr-11 h-11"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="signup-confirm">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita a senha"
                        className={`pl-10 pr-11 h-11 ${passwordMismatch ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-destructive">As senhas não coincidem</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-semibold mt-2"
                    disabled={isLoading || passwordMismatch}
                  >
                    {isLoading ? 'Cadastrando...' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
