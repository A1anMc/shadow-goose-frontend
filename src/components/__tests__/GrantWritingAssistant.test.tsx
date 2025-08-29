import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GrantWritingAssistant from '../GrantWritingAssistant';

// Mock the AI writing assistant
jest.mock('../../lib/ai-writing-assistant', () => ({
  aiWritingAssistant: {
    getWritingTips: jest.fn(),
    getProfessionalTemplates: jest.fn(),
    analyzeGrantContent: jest.fn(),
    generateProfessionalGrantContent: jest.fn(),
  },
}));

describe('GrantWritingAssistant', () => {
  const mockGetWritingTips = jest.fn();
  const mockGetProfessionalTemplates = jest.fn();
  const mockAnalyzeContent = jest.fn();
  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const { aiWritingAssistant } = require('../../lib/ai-writing-assistant');
    aiWritingAssistant.getWritingTips = mockGetWritingTips;
    aiWritingAssistant.getProfessionalTemplates = mockGetProfessionalTemplates;
    aiWritingAssistant.analyzeGrantContent = mockAnalyzeContent;
    aiWritingAssistant.generateProfessionalGrantContent = mockGenerateContent;
  });

  it('renders the writing assistant interface', () => {
    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);
    
    expect(screen.getByText(/Grant Writing Assistant/i)).toBeInTheDocument();
  });

  it('displays writing tips when loaded', async () => {
    mockGetWritingTips.mockResolvedValue([
      'Use specific, measurable objectives',
      'Include quantifiable outcomes',
      'Demonstrate alignment with requirements'
    ]);

    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    await waitFor(() => {
      expect(mockGetWritingTips).toHaveBeenCalled();
    });
  });

  it('displays professional templates when loaded', async () => {
    mockGetProfessionalTemplates.mockResolvedValue([
      { id: 'template-1', name: 'Education Grant Template', content: 'Template content' }
    ]);

    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    await waitFor(() => {
      expect(mockGetProfessionalTemplates).toHaveBeenCalledWith('education');
    });
  });

  it('generates content when form is submitted', async () => {
    mockGenerateContent.mockResolvedValue({
      content: 'Generated content',
      suggestions: ['Suggestion 1', 'Suggestion 2']
    });

    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    const generateButton = screen.getByText(/Generate Content/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateContent).toHaveBeenCalled();
    });
  });

  it('improves content when improve button is clicked', async () => {
    mockAnalyzeContent.mockResolvedValue({
      score: 85,
      suggestions: ['Improve clarity', 'Add more details']
    });

    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    const improveButton = screen.getByText(/Improve Content/i);
    fireEvent.click(improveButton);

    await waitFor(() => {
      expect(mockAnalyzeContent).toHaveBeenCalled();
    });
  });

  it('handles errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    const generateButton = screen.getByText(/Generate Content/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during content generation', async () => {
    mockGenerateContent.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    const generateButton = screen.getByText(/Generate Content/i);
    fireEvent.click(generateButton);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
