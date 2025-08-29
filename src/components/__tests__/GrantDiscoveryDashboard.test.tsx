import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GrantDiscoveryDashboard from '../GrantDiscoveryDashboard';

// Mock the services
jest.mock('../../lib/grant-discovery-engine', () => ({
  grantDiscoveryEngine: {
    discoverGrants: jest.fn(),
    getGrantCategories: jest.fn(),
    getGrantIndustries: jest.fn(),
    getGrantLocations: jest.fn(),
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GrantDiscoveryDashboard', () => {
  const mockDiscoverGrants = jest.fn();
  const mockGetCategories = jest.fn();
  const mockGetIndustries = jest.fn();
  const mockGetLocations = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockDiscoverGrants.mockResolvedValue({
      grants: [
        {
          id: 1,
          title: 'Test Grant 1',
          organization: 'Test Org',
          amount: 50000,
          deadline: '2025-12-31',
          category: 'Film',
          status: 'open',
        },
        {
          id: 2,
          title: 'Test Grant 2',
          organization: 'Test Org 2',
          amount: 75000,
          deadline: '2025-11-30',
          category: 'Arts',
          status: 'open',
        },
      ],
      totalFound: 2,
      matchesFound: 2,
      searchTime: 150,
      sources: ['Screen Australia', 'Creative Australia'],
    });

    mockGetCategories.mockResolvedValue(['Film', 'Arts', 'Documentary']);
    mockGetIndustries.mockResolvedValue(['Film', 'Arts', 'Media']);
    mockGetLocations.mockResolvedValue(['NSW', 'VIC', 'QLD']);

    // Mock the module
    const { grantDiscoveryEngine } = require('../../lib/grant-discovery-engine');
    grantDiscoveryEngine.discoverGrants = mockDiscoverGrants;
    grantDiscoveryEngine.getGrantCategories = mockGetCategories;
    grantDiscoveryEngine.getGrantIndustries = mockGetIndustries;
    grantDiscoveryEngine.getGrantLocations = mockGetLocations;
  });

  it('renders the dashboard with search form', () => {
    render(<GrantDiscoveryDashboard />);
    
    expect(screen.getByText('Grant Discovery Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Search Criteria')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Funding Amount')).toBeInTheDocument();
    expect(screen.getByText('Search Grants')).toBeInTheDocument();
  });

  it('loads initial data on mount', async () => {
    render(<GrantDiscoveryDashboard />);
    
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
      expect(mockGetIndustries).toHaveBeenCalled();
      expect(mockGetLocations).toHaveBeenCalled();
    });
  });

  it('performs grant search when form is submitted', async () => {
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Fill in search criteria
    const industrySelect = screen.getByLabelText(/industry/i);
    fireEvent.change(industrySelect, { target: { value: 'Film' } });

    const locationSelect = screen.getByLabelText(/location/i);
    fireEvent.change(locationSelect, { target: { value: 'NSW' } });

    const minAmountInput = screen.getByLabelText(/minimum amount/i);
    fireEvent.change(minAmountInput, { target: { value: '10000' } });

    const maxAmountInput = screen.getByLabelText(/maximum amount/i);
    fireEvent.change(maxAmountInput, { target: { value: '100000' } });

    // Submit the form
    const searchButton = screen.getByText('Search Grants');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockDiscoverGrants).toHaveBeenCalledWith({
        industry: ['Film'],
        location: ['NSW'],
        fundingAmount: { min: 10000, max: 100000 },
        eligibility: [],
        deadline: expect.any(String),
        keywords: [],
        status: 'open',
      });
    });
  });

  it('displays search results after successful search', async () => {
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Submit search
    const searchButton = screen.getByText('Search Grants');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Grant 1')).toBeInTheDocument();
      expect(screen.getByText('Test Grant 2')).toBeInTheDocument();
      expect(screen.getByText('Test Org')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
      expect(screen.getByText('$75,000')).toBeInTheDocument();
    });
  });

  it('displays search statistics', async () => {
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Submit search
    const searchButton = screen.getByText('Search Grants');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('2 grants found')).toBeInTheDocument();
      expect(screen.getByText('Search completed in 150ms')).toBeInTheDocument();
      expect(screen.getByText('Sources: Screen Australia, Creative Australia')).toBeInTheDocument();
    });
  });

  it('handles search errors gracefully', async () => {
    mockDiscoverGrants.mockRejectedValue(new Error('Search failed'));
    
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Submit search
    const searchButton = screen.getByText('Search Grants');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('allows adding and removing keywords', async () => {
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Add a keyword
    const keywordInput = screen.getByPlaceholderText(/enter keyword/i);
    fireEvent.change(keywordInput, { target: { value: 'documentary' } });
    fireEvent.keyPress(keywordInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('documentary')).toBeInTheDocument();

    // Remove the keyword
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    expect(screen.queryByText('documentary')).not.toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Try to set invalid amount range
    const minAmountInput = screen.getByLabelText(/minimum amount/i);
    const maxAmountInput = screen.getByLabelText(/maximum amount/i);
    
    fireEvent.change(minAmountInput, { target: { value: '100000' } });
    fireEvent.change(maxAmountInput, { target: { value: '50000' } });

    // Submit the form
    const searchButton = screen.getByText('Search Grants');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/minimum amount cannot be greater than maximum/i)).toBeInTheDocument();
    });
  });

  it('clears search results when form is reset', async () => {
    render(<GrantDiscoveryDashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalled();
    });

    // Submit search to get results
    const searchButton = screen.getByText('Search Grants');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Test Grant 1')).toBeInTheDocument();
    });

    // Reset the form
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Grant 1')).not.toBeInTheDocument();
    });
  });
});
