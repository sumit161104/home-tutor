import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import Home from './Home';

describe('Home Component', () => {
  it('renders the hero section correctly', () => {
    render(<HelmetProvider><Home setCurrentView={vi.fn()} /></HelmetProvider>);
    
    // Check main heading
    expect(screen.getByText('Find Qualified Home Tutors Near You')).toBeInTheDocument();
    
    // Check some of the body text
    expect(screen.getByText(/Finding the right home tutor should be simple/i)).toBeInTheDocument();
  });

  it('calls setCurrentView with "search" when Search button is clicked', () => {
    const mockSetCurrentView = vi.fn();
    render(<HelmetProvider><Home setCurrentView={mockSetCurrentView} /></HelmetProvider>);
    
    const searchButton = screen.getByRole('button', { name: /Search Tutors Now/i });
    fireEvent.click(searchButton);
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('search');
    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
  });

  it('calls setCurrentView with "register" when Register button is clicked', () => {
    const mockSetCurrentView = vi.fn();
    render(<HelmetProvider><Home setCurrentView={mockSetCurrentView} /></HelmetProvider>);
    
    const registerButton = screen.getByRole('button', { name: /Register as Guardian\/Tutor/i });
    fireEvent.click(registerButton);
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('register');
    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
  });

  it('renders illustration correctly', () => {
    render(<HelmetProvider><Home setCurrentView={() => {}} /></HelmetProvider>);
    const illustration = screen.getByAltText('Tutor & Guardian Illustration');
    expect(illustration).toBeInTheDocument();
    expect(illustration).toHaveAttribute('src', '/hero-illustration.png');
  });
});
