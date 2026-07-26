import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Register from './Register';

// Mock react-select to avoid complex DOM structures during tests
vi.mock('react-select/creatable', () => ({
  default: ({ onChange, placeholder }) => (
    <input 
      data-testid="mock-creatable-select" 
      placeholder={placeholder}
      onChange={(e) => onChange({ label: e.target.value, value: e.target.value })}
    />
  )
}));

vi.mock('react-select', () => ({
  default: ({ onChange, placeholder }) => (
    <input 
      data-testid="mock-select" 
      placeholder={placeholder}
      onChange={(e) => onChange({ label: e.target.value, value: e.target.value })}
    />
  )
}));

describe('Register Component', () => {
  it('renders register form correctly', () => {
    render(
      <Register 
        setCurrentView={() => {}} 
        onLoginSuccess={() => {}} 
        setLoading={() => {}} 
        setErrorMsg={() => {}} 
        setSuccessMsg={() => {}} 
        clearMessages={() => {}} 
      />
    );
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Rahul Kumar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
  });

  it('handles register success', async () => {
    const setSuccessMsg = vi.fn();
    const clearMessages = vi.fn();
    const setLoading = vi.fn();
    const setCurrentView = vi.fn();
    const setErrorMsg = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration successful' }),
      })
    );

    render(
      <Register 
        onLoginSuccess={() => {}} 
        clearMessages={clearMessages} 
        setLoading={setLoading} 
        setErrorMsg={setErrorMsg} 
        setSuccessMsg={setSuccessMsg}
        setCurrentView={setCurrentView} 
      />
    );

    await userEvent.type(screen.getByPlaceholderText('e.g. Rahul Kumar'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    
    // Select role
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /join as/i }), 
      'TUTOR'
    );

    // Provide state and city
    fireEvent.change(screen.getByTestId('mock-select'), { target: { value: 'Maharashtra' } });
    fireEvent.change(screen.getByTestId('mock-creatable-select'), { target: { value: 'Mumbai' } });

    // Provide phone and gender
    await userEvent.type(screen.getByPlaceholderText('e.g. +91 9988776655'), '9876543210');
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /gender/i }),
      'MALE'
    );

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"email":"test@test.com"')
      }));
      expect(setErrorMsg).not.toHaveBeenCalled();
      expect(setSuccessMsg).toHaveBeenCalled();
    });
  });

  it('handles register failure', async () => {
    const setErrorMsg = vi.fn();
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' }),
      })
    );

    render(
      <Register 
        onLoginSuccess={() => {}} 
        clearMessages={() => {}} 
        setLoading={() => {}} 
        setErrorMsg={setErrorMsg} 
        setSuccessMsg={() => {}}
        setCurrentView={() => {}} 
      />
    );

    await userEvent.type(screen.getByPlaceholderText('e.g. Rahul Kumar'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('name@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123');
    
    // Provide state and city
    fireEvent.change(screen.getByTestId('mock-select'), { target: { value: 'Maharashtra' } });
    fireEvent.change(screen.getByTestId('mock-creatable-select'), { target: { value: 'Mumbai' } });

    // Provide phone and gender
    await userEvent.type(screen.getByPlaceholderText('e.g. +91 9988776655'), '9876543210');
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /gender/i }),
      'MALE'
    );

    const form = document.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(setErrorMsg).toHaveBeenCalledWith('Email already exists');
    });
  });
});
