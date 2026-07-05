import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserSidebar from './UserSidebar';

const mockNavigate = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue(undefined);

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const MOCK_USER = {
  id: 'u1',
  email: 'maria@test.com',
  displayName: 'Maria Souza',
  avatarUrl: null,
  role: 'User',
};

describe('UserSidebar', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders null when user is not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null, signOut: mockSignOut, isAdmin: false });
    const { container } = render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders user name and email when user is logged in', () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Maria Souza')).toBeInTheDocument();
    expect(screen.getByText('maria@test.com')).toBeInTheDocument();
  });

  it('renders navigation items for regular user', () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByText('Meus Pedidos')).toBeInTheDocument();
    expect(screen.getByText('Meus Endereços')).toBeInTheDocument();
  });

  it('shows admin panel link for admin user', () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: true });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
  });

  it('does not show admin panel link for regular user', () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
  });

  it('shows "Admin" badge for admin users', () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: true });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('navigates to /perfil when "Meu Perfil" is clicked', () => {
    const onClose = vi.fn();
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Meu Perfil'));
    expect(mockNavigate).toHaveBeenCalledWith('/perfil');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls signOut and navigates to "/" when "Sair" is clicked', async () => {
    const onClose = vi.fn();
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Sair'));
    expect(onClose).toHaveBeenCalled();
    await vi.waitFor(() => expect(mockSignOut).toHaveBeenCalled());
  });

  it('shows user initials when no avatar', () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('shows avatar image when avatarUrl is set', () => {
    const userWithAvatar = { ...MOCK_USER, avatarUrl: '/avatar.jpg' };
    mockUseAuth.mockReturnValue({ user: userWithAvatar, signOut: mockSignOut, isAdmin: false });
    render(<UserSidebar isOpen={true} onClose={vi.fn()} />);
    const img = screen.getByRole('img', { name: 'Avatar' });
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });
});
