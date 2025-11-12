import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, Tab } from './Tabs';

const mockTabs: Tab[] = [
  {
    id: 'tab1',
    label: 'Tab 1',
    content: <div>Content 1</div>,
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    content: <div>Content 2</div>,
  },
  {
    id: 'tab3',
    label: 'Tab 3',
    content: <div>Content 3</div>,
    disabled: true,
  },
];

describe('Tabs Component', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={mockTabs} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('displays content of first tab by default', () => {
    render(<Tabs tabs={mockTabs} />);
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('displays content of default tab when specified', () => {
    render(<Tabs tabs={mockTabs} defaultTab="tab2" />);
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    render(<Tabs tabs={mockTabs} />);

    const tab2Button = screen.getByText('Tab 2');
    fireEvent.click(tab2Button);

    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('calls onTabChange callback when tab is changed', () => {
    const handleTabChange = vi.fn();
    render(<Tabs tabs={mockTabs} onTabChange={handleTabChange} />);

    const tab2Button = screen.getByText('Tab 2');
    fireEvent.click(tab2Button);

    expect(handleTabChange).toHaveBeenCalledWith('tab2');
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it('does not switch to disabled tab', () => {
    render(<Tabs tabs={mockTabs} />);

    const disabledTab = screen.getByText('Tab 3');
    fireEvent.click(disabledTab);

    // Should still show content 1
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
  });

  it('applies disabled styles to disabled tabs', () => {
    render(<Tabs tabs={mockTabs} />);

    const disabledTab = screen.getByText('Tab 3');
    expect(disabledTab).toBeDisabled();
    expect(disabledTab).toHaveClass('disabled:opacity-50');
  });

  it('handles keyboard navigation with ArrowRight', () => {
    render(<Tabs tabs={mockTabs} />);

    const tab1Button = screen.getByText('Tab 1');

    // Press ArrowRight
    fireEvent.keyDown(tab1Button, { key: 'ArrowRight' });

    // Should switch to tab 2
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('handles keyboard navigation with ArrowLeft', () => {
    render(<Tabs tabs={mockTabs} defaultTab="tab2" />);

    const tab2Button = screen.getByText('Tab 2');

    // Press ArrowLeft
    fireEvent.keyDown(tab2Button, { key: 'ArrowLeft' });

    // Should switch to tab 1
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('wraps around when navigating right from last tab', () => {
    render(<Tabs tabs={mockTabs} defaultTab="tab2" />);

    const tab2Button = screen.getByText('Tab 2');

    // Press ArrowRight (should wrap to tab1, skipping disabled tab3)
    fireEvent.keyDown(tab2Button, { key: 'ArrowRight' });

    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('wraps around when navigating left from first tab', () => {
    render(<Tabs tabs={mockTabs} />);

    const tab1Button = screen.getByText('Tab 1');

    // Press ArrowLeft (should wrap to tab2, skipping disabled tab3)
    fireEvent.keyDown(tab1Button, { key: 'ArrowLeft' });

    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('applies underline variant styles by default', () => {
    render(<Tabs tabs={mockTabs} />);

    const tab1Button = screen.getByText('Tab 1');
    expect(tab1Button).toHaveClass('border-b-2', 'border-primary-600');
  });

  it('applies pills variant styles', () => {
    render(<Tabs tabs={mockTabs} variant="pills" />);

    const tab1Button = screen.getByText('Tab 1');
    expect(tab1Button).toHaveClass('rounded-lg', 'bg-primary-600');
  });

  it('applies fullWidth styles', () => {
    render(<Tabs tabs={mockTabs} fullWidth />);

    const tab1Button = screen.getByText('Tab 1');
    expect(tab1Button).toHaveClass('flex-1');
  });

  it('has proper ARIA attributes', () => {
    render(<Tabs tabs={mockTabs} />);

    // Check tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Content tabs');

    // Check active tab
    const tab1 = screen.getByText('Tab 1');
    expect(tab1).toHaveAttribute('role', 'tab');
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('id', 'tab-tab1');
    expect(tab1).toHaveAttribute('aria-controls', 'panel-tab1');
    expect(tab1).toHaveAttribute('tabIndex', '0');

    // Check inactive tab
    const tab2 = screen.getByText('Tab 2');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(tab2).toHaveAttribute('tabIndex', '-1');
  });

  it('has proper ARIA attributes on tabpanel', () => {
    render(<Tabs tabs={mockTabs} />);

    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('id', 'panel-tab1');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-tab1');
  });

  it('updates tabpanel ARIA when tab changes', () => {
    render(<Tabs tabs={mockTabs} />);

    const tab2Button = screen.getByText('Tab 2');
    fireEvent.click(tab2Button);

    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('id', 'panel-tab2');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-tab2');
  });

  it('handles empty tabs array gracefully', () => {
    render(<Tabs tabs={[]} />);

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
  });

  it('renders complex content in tabs', () => {
    const complexTabs: Tab[] = [
      {
        id: 'complex1',
        label: 'Complex Tab',
        content: (
          <div>
            <h2>Heading</h2>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        ),
      },
    ];

    render(<Tabs tabs={complexTabs} />);

    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});
