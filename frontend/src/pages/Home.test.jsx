import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './Home';

describe('Home Component', () => {
  it('renders the hero section correctly', () => {
    render(<Home setCurrentView={vi.fn()} />);
    
    // Check main heading
    expect(screen.getByText('Find Qualified Home Tutors Near You')).toBeInTheDocument();
    
    // Check some of the body text
    expect(screen.getByText(/Finding the right home tutor should be simple/i)).toBeInTheDocument();
  });

  it('calls setCurrentView with "search" when Search button is clicked', () => {
    const mockSetCurrentView = vi.fn();
    render(<Home setCurrentView={mockSetCurrentView} />);
    
    const searchButton = screen.getByRole('button', { name: /Search Tutors Now/i });
    fireEvent.click(searchButton);
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('search');
    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
  });

  it('calls setCurrentView with "register" when Register button is clicked', () => {
    const mockSetCurrentView = vi.fn();
    render(<Home setCurrentView={mockSetCurrentView} />);
    
    const registerButton = screen.getByRole('button', { name: /Register as Guardian\/Tutor/i });
    fireEvent.click(registerButton);
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('register');
    expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
  });

  it('renders illustration correctly', () => {
    render(<Home setCurrentView={vi.fn()} />);
    const illustration = screen.getByAltText('Tutor & Guardian Illustration');
    expect(illustration).toBeInTheDocument();
    expect(illustration).toHaveAttribute('src', '/hero-illustration.png');
  });
});
