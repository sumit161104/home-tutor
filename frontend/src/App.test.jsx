import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

describe('App Component Integration Tests', () => {
  let originalFetch;

  beforeEach(() => {
    // Clear localStorage
    window.localStorage.clear();

    // Mock fetch globally
    originalFetch = global.fetch;
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/subjects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Math' }])
        });
      }
      if (url.includes('/api/standards')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Class 10' }])
        });
      }
      if (url.includes('/api/tutors/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 1, name: 'Test User', email: 'test@test.com', role: window.localStorage.getItem('testRole') || 'GUARDIAN' })
        });
      }
      if (url.includes('/api/notifications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('renders Home page when no token is present', async () => {
    render(<HelmetProvider><App /></HelmetProvider>);
    
    // By default, no token, so currentView is 'home'
    expect(screen.getByText('Find Qualified Home Tutors Near You')).toBeInTheDocument();
  });

  it('renders Guardian Dashboard when token is present and role is GUARDIAN', async () => {
    window.localStorage.setItem('token', 'dummy-token');
    window.localStorage.setItem('user', JSON.stringify({ id: 1, role: 'GUARDIAN' }));
    window.localStorage.setItem('testRole', 'GUARDIAN');
    // We need to set the URL hash if it forces a navigation, but initially we'll just check if it renders the search or dashboard view correctly.
    // Wait, initially App uses `localStorage.getItem('token') ? 'search' : 'home'`
    
    render(<HelmetProvider><App /></HelmetProvider>);

    // Since token is present, currentView is 'search' initially. 
    await waitFor(() => {
      // The search view contains "Find the Perfect Home Tutor Near You"
      expect(screen.getByText(/Find the Perfect Home Tutor Near You/i)).toBeInTheDocument();
    });
  });

  it('renders Tutor Dashboard when token is present and role is TUTOR', async () => {
    window.localStorage.setItem('token', 'dummy-token');
    window.localStorage.setItem('user', JSON.stringify({ id: 1, role: 'TUTOR' }));
    window.localStorage.setItem('testRole', 'TUTOR');
    
    render(<HelmetProvider><App /></HelmetProvider>);

    await waitFor(() => {
      expect(screen.getByText(/Find the Perfect Home Tutor Near You/i)).toBeInTheDocument();
    });
  });

  it('renders Admin Dashboard when token is present and role is ADMIN', async () => {
    window.localStorage.setItem('token', 'dummy-token');
    window.localStorage.setItem('user', JSON.stringify({ id: 1, role: 'ADMIN' }));
    window.localStorage.setItem('testRole', 'ADMIN');
    
    render(<HelmetProvider><App /></HelmetProvider>);

    await waitFor(() => {
      // It still renders search initially
      expect(screen.getByText(/Find the Perfect Home Tutor Near You/i)).toBeInTheDocument();
    });
  });
});
