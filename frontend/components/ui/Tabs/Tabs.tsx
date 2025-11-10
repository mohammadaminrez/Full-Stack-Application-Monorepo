'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab configurations */
  tabs: Tab[];
  /** Initially active tab ID */
  defaultTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Visual variant */
  variant?: 'underline' | 'pills';
  /** Full width tabs */
  fullWidth?: boolean;
}

/**
 * Tabs Component
 * Accessible tab navigation with keyboard support
 * Implements ARIA tablist pattern
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'underline',
  fullWidth = false,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, _index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
      handleTabChange(nextTab.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab =
        enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
      handleTabChange(prevTab.id);
    }
  };

  const activeTabContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Content tabs"
        className={cn(
          'flex gap-1',
          variant === 'underline' && 'border-b border-gray-200 dark:border-gray-700',
          fullWidth && 'w-full'
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'px-4 py-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                fullWidth && 'flex-1',

                // Underline variant
                variant === 'underline' &&
                  cn(
                    'border-b-2',
                    isActive
                      ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  ),

                // Pills variant
                variant === 'pills' &&
                  cn(
                    'rounded-lg',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4 animate-fade-in"
      >
        {activeTabContent}
      </div>
    </div>
  );
};
