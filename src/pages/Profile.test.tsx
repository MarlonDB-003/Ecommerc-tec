import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockUseAuth() }));
const mockUseAuth = vi.fn();
const mockUpdateUser = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));
const mockToast = vi.fn();

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

vi.mock('@/services/userService', () => ({
  userService: {
    getMyProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

import Profile from './Profile';
import { userService } from '@/services/userService';

const MOCK_USER = { id: 'u1', email: 'user@test.com', displayName: 'Maria', avatarUrl: null };
const MOCK_PROFILE = {
  userId: 'u1', email: 'user@test.com', displayName: 'Maria',
  phone: '92999999999', avatarUrl: null, isAdmin: false,
};

describe('Profile page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getMyProfile).mockResolvedValue(MOCK_PROFILE);
    vi.mocked(userService.updateProfile).mockResolvedValue(MOCK_PROFILE);
    mockUseAuth.mockReturnValue({ user: MOCK_USER, updateUser: mockUpdateUser, isLoading: false });
  });

  it('redirects to /auth when no user', () => {
    mockUseAuth.mockReturnValue({ user: null, updateUser: mockUpdateUser, isLoading: false });
    render(<Profile />);
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('does not redirect while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, updateUser: mockUpdateUser, isLoading: true });
    render(<Profile />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders Header and Footer', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('calls getMyProfile on mount', async () => {
    render(<Profile />);
    await waitFor(() => expect(userService.getMyProfile).toHaveBeenCalled());
  });

  it('populates form with profile data after loading', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Maria')).toBeInTheDocument();
    });
  });

  it('shows "Meu Perfil" heading', async () => {
    render(<Profile />);
    await waitFor(() => expect(screen.getByText('Meu Perfil')).toBeInTheDocument());
  });

  it('calls updateProfile on save button click', async () => {
    render(<Profile />);
    await waitFor(() => screen.getByDisplayValue('Maria'));
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalled());
  });

  it('shows toast on profile load error', async () => {
    vi.mocked(userService.getMyProfile).mockRejectedValue(new Error('Network error'));
    render(<Profile />);
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Erro ao carregar perfil' })
      );
    });
  });

  it('shows phone field populated from profile', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('92999999999')).toBeInTheDocument();
    });
  });

  it('shows user email on the page', async () => {
    render(<Profile />);
    await waitFor(() => {
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
    });
  });
});
