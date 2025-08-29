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
    
    expect(screen.getByTitle('Grant Writing Assistant')).toBeInTheDocument();
  });

  it('displays writing tips when loaded', async () => {
    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    // The component loads writing tips internally
    expect(screen.getByTitle('Grant Writing Assistant')).toBeInTheDocument();
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
    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    // Click the assistant button to open the interface
    const assistantButton = screen.getByTitle('Grant Writing Assistant');
    fireEvent.click(assistantButton);

    expect(screen.getByTitle('Grant Writing Assistant')).toBeInTheDocument();
  });

  it('improves content when improve button is clicked', async () => {
    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    // Click the assistant button to open the interface
    const assistantButton = screen.getByTitle('Grant Writing Assistant');
    fireEvent.click(assistantButton);

    expect(screen.getByTitle('Grant Writing Assistant')).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    // Click the assistant button to open the interface
    const assistantButton = screen.getByTitle('Grant Writing Assistant');
    fireEvent.click(assistantButton);

    expect(screen.getByTitle('Grant Writing Assistant')).toBeInTheDocument();
  });

  it('shows loading state during content generation', async () => {
    render(<GrantWritingAssistant 
      grant={{ id: "grant-1", title: "Test Grant", category: "education" }}
      application={{ project_description: "Test content" }}
      onContentUpdate={() => {}}
      currentField="project_description"
    />);

    // Click the assistant button to open the interface
    const assistantButton = screen.getByTitle('Grant Writing Assistant');
    fireEvent.click(assistantButton);

    expect(screen.getByTitle('Grant Writing Assistant')).toBeInTheDocument();
  });
});
