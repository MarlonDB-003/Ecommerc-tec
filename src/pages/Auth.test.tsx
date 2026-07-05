import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    <a href={to}>{children}</a>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

import Auth from './Auth';

const mockNavigate = vi.fn();
const mockSignIn = vi.fn().mockResolvedValue({ error: null });
const mockSignUp = vi.fn().mockResolvedValue({ error: null });
const mockToast = vi.fn();
const mockUseAuth = vi.fn();

describe('Auth page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, signIn: mockSignIn, signUp: mockSignUp });
  });

  it('renders login tab by default', () => {
    render(<Auth />);
    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument();
  });

  it('renders TechWorld brand on the page', () => {
    render(<Auth />);
    const text = document.body.textContent ?? '';
    expect(text).toMatch(/TechWorld|Tech/);
  });

  it('renders login email and password fields', () => {
    render(<Auth />);
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
  });

  it('redirects to "/" when user is already logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'a@b.com', displayName: 'A' },
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
    render(<Auth />);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('calls signIn with email and password on login submit', async () => {
    render(<Auth />);
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), {
      target: { value: 'senha123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /entrar na conta/i }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'senha123');
    });
  });

  it('navigates to "/" after successful login', async () => {
    render(<Auth />);
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), {
      target: { value: 'senha123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /entrar na conta/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('shows error toast on login failure', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' });
    render(<Auth />);
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'bad@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /entrar na conta/i }));
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao entrar', variant: 'destructive' })
      );
    });
  });

  it('switches to signup tab and shows form', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    const signupTab = screen.getByRole('tab', { name: /criar conta/i });
    await user.click(signupTab);
    await waitFor(() => {
      expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
    });
  });

  it('shows password mismatch error in signup form', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    await user.click(screen.getByRole('tab', { name: /criar conta/i }));
    // Fill min-6 chars password field and confirm password field
    const allPasswordPlaceholders = screen.getAllByPlaceholderText(/mínimo|repita/i);
    await user.type(allPasswordPlaceholders[0], 'senha123');
    await user.type(allPasswordPlaceholders[allPasswordPlaceholders.length - 1], 'diferente');
    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });
  });

  it('shows toast for short password in signup', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    await user.click(screen.getByRole('tab', { name: /criar conta/i }));
    const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
    const confirmInput = screen.getByPlaceholderText('Repita a senha');
    await user.type(passwordInput, '123');
    await user.type(confirmInput, '123');
    // Submit the form directly instead of clicking the button
    fireEvent.submit(passwordInput.closest('form')!);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Senha muito curta' })
      );
    });
  });

  it('calls signUp on valid signup form submit', async () => {
    const user = userEvent.setup();
    render(<Auth />);
    await user.click(screen.getByRole('tab', { name: /criar conta/i }));
    await user.type(screen.getByPlaceholderText('Como você quer ser chamado'), 'João');
    const emailInputs = screen.getAllByPlaceholderText('seu@email.com');
    await user.type(emailInputs[emailInputs.length - 1], 'novo@test.com');
    const allPasswordPlaceholders = screen.getAllByPlaceholderText(/mínimo|repita/i);
    await user.type(allPasswordPlaceholders[0], 'senha123');
    await user.type(allPasswordPlaceholders[allPasswordPlaceholders.length - 1], 'senha123');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('novo@test.com', 'senha123', 'João');
    });
  });
});
