import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
    it('renders the connection form initially', () => {
        render(<App />);
        const connectionHeader = screen.getByText(/Connect to PostgreSQL/i);
        expect(connectionHeader).toBeInTheDocument();
    });
});
