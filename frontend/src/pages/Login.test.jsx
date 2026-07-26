import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Login from './Login';

describe('Login Component', () => {
  it('renders login form correctly', () => {
    render(<Login setCurrentView={() => {}} onLoginSuccess={() => {}} setLoading={() => {}} setErrorMsg={() => {}} clearMessages={() => {}} />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('handles login success', async () => {
    const onLoginSuccess = vi.fn();
    const clearMessages = vi.fn();
    const setLoading = vi.fn();
    const setErrorMsg = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token' }),
      })
    );

    render(
      <Login 
        onLoginSuccess={onLoginSuccess} 
        clearMessages={clearMessages} 
        setLoading={setLoading} 
        setErrorMsg={setErrorMsg} 
        setCurrentView={() => {}} 
      />
    );

    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
      }));
      expect(onLoginSuccess).toHaveBeenCalledWith({ token: 'fake-token' });
    });
  });

  it('handles login failure', async () => {
    const setErrorMsg = vi.fn();
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      })
    );

    render(
      <Login 
        onLoginSuccess={() => {}} 
        clearMessages={() => {}} 
        setLoading={() => {}} 
        setErrorMsg={setErrorMsg} 
        setCurrentView={() => {}} 
      />
    );

    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(setErrorMsg).toHaveBeenCalledWith('Invalid credentials');
    });
  });
});
