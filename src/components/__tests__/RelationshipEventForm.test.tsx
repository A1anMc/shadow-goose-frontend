import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RelationshipEventForm from '../RelationshipEventForm';

// Mock the relationship service
jest.mock('../../lib/relationship-service', () => ({
  RelationshipService: jest.fn().mockImplementation(() => ({
    createEvent: jest.fn(),
    getStakeholders: jest.fn(),
    getTags: jest.fn(),
  })),
}));

describe('RelationshipEventForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    expect(screen.getByText('Log Relationship Event')).toBeInTheDocument();
    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stakeholder/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/health score/i)).toBeInTheDocument();
  });

  it('allows adding discussion points', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const addButton = screen.getByText('+ Add Discussion Point');
    fireEvent.click(addButton);

    expect(screen.getByPlaceholderText(/enter discussion point/i)).toBeInTheDocument();
  });

  it('allows adding follow-up actions', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const addButton = screen.getByText('+ Add Follow-up Action');
    fireEvent.click(addButton);

    expect(screen.getByPlaceholderText(/enter follow-up action/i)).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Log Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/event title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/stakeholder is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/event title/i), {
      target: { value: 'Test Event' },
    });

    fireEvent.change(screen.getByLabelText(/event type/i), {
      target: { value: 'meeting' },
    });

    fireEvent.change(screen.getByLabelText(/stakeholder/i), {
      target: { value: '1' },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' },
    });

    // Submit form
    const submitButton = screen.getByText('Log Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Event',
          eventType: 'meeting',
          stakeholderId: '1',
          description: 'Test description',
        })
      );
    });
  });

  it('handles form cancellation', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('allows selecting multiple tags', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const tagCheckboxes = screen.getAllByRole('checkbox');
    
    // Select first tag
    fireEvent.click(tagCheckboxes[0]);
    expect(tagCheckboxes[0]).toBeChecked();

    // Select second tag
    fireEvent.click(tagCheckboxes[1]);
    expect(tagCheckboxes[1]).toBeChecked();

    // Unselect first tag
    fireEvent.click(tagCheckboxes[0]);
    expect(tagCheckboxes[0]).not.toBeChecked();
  });

  it('updates health score display', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const healthScoreSlider = screen.getByLabelText(/health score/i);
    const healthScoreDisplay = screen.getByText('75');

    fireEvent.change(healthScoreSlider, { target: { value: '85' } });

    expect(healthScoreDisplay).toHaveTextContent('85');
  });

  it('displays contact details fields', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('removes discussion points when delete button is clicked', () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    // Add a discussion point
    const addButton = screen.getByText('+ Add Discussion Point');
    fireEvent.click(addButton);

    const discussionInput = screen.getByPlaceholderText(/enter discussion point/i);
    fireEvent.change(discussionInput, { target: { value: 'Test discussion' } });

    // Remove the discussion point
    const deleteButton = screen.getByText('×');
    fireEvent.click(deleteButton);

    expect(screen.queryByPlaceholderText(/enter discussion point/i)).not.toBeInTheDocument();
  });

  it('validates email format in contact details', async () => {
    render(
      <RelationshipEventForm
        isOpen={true}
        onClose={mockOnCancel}
        onSuccess={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('Log Event');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });
});
