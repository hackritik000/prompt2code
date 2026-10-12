import React from 'react';
import { TabId } from '../types';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tabId: TabId) => void;
  onOpenSettings: () => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'report', label: 'Report' },
  { id: 'lost', label: 'Lost items' },
  { id: 'found', label: 'Found items' },
  { id: 'matches', label: 'Matches' },
  { id: 'items', label: 'All items' },
];

/**
 * Global navigation header for Campus Lost & Found.
 */
export default function Header({
  activeTab,
  onSelectTab,
  onOpenSettings,
}: HeaderProps): React.JSX.Element {
  return (
    <header>
      <div className="wrap bar">
        <h1>
          Lost &amp; Found
          <span>Campus matcher</span>
        </h1>

        <nav id="tabs" aria-label="Sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'on' : ''}
              onClick={() => onSelectTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          className="soft"
          id="setBtn"
          type="button"
          onClick={onOpenSettings}
        >
          AI settings
        </button>
      </div>
    </header>
  );
}
