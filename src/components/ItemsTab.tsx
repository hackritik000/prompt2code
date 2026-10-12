import React from 'react';
import ItemTags from './ItemTags';
import { getItemTitle } from '../utils/stringUtils';
import { Item, TabId } from '../types';

interface TabConfig {
  heading: string;
  filterFn: (item: Item) => boolean;
  emptyMessage: string;
}

const TAB_CONFIGS: Record<Extract<TabId, 'lost' | 'found' | 'items'>, TabConfig> = {
  lost: {
    heading: 'Lost items',
    filterFn: (item: Item) => item.type === 'lost',
    emptyMessage: 'No lost reports yet. Use the Report tab to add one.',
  },
  found: {
    heading: 'Found items',
    filterFn: (item: Item) => item.type === 'found',
    emptyMessage: 'No found reports yet. Use the Report tab to add one.',
  },
  items: {
    heading: 'All items',
    filterFn: () => true,
    emptyMessage: 'Nothing here yet. Save a report to get started.',
  },
};

interface ItemsTabProps {
  tabId: Extract<TabId, 'lost' | 'found' | 'items'>;
  items: Item[];
  onDelete: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

/**
 * Reusable list view component for "Lost items", "Found items", and "All items".
 */
export default function ItemsTab({
  tabId,
  items,
  onDelete,
  onOpenDetail,
}: ItemsTabProps): React.JSX.Element {
  const config = TAB_CONFIGS[tabId] || TAB_CONFIGS.items;
  const filteredList = items.filter(config.filterFn);
  const openCount = filteredList.filter((item) => item.status === 'open').length;
  const closedCount = filteredList.length - openCount;

  // Most recent first, with closed/claimed items sorted towards the bottom
  const displayItems = filteredList
    .slice()
    .reverse()
    .sort((a, b) => (a.status === 'claimed' ? 1 : 0) - (b.status === 'claimed' ? 1 : 0));

  return (
    <section id={tabId} className="tab">
      <h2>{config.heading}</h2>

      <div className="stats">
        <span className="tag">{openCount} open</span>
        <span className="tag">{closedCount} closed</span>
      </div>

      {displayItems.length === 0 ? (
        <div className="empty">{config.emptyMessage}</div>
      ) : (
        displayItems.map((item) => {
          const isClaimed = item.status === 'claimed';

          return (
            <div
              key={item.id}
              className={`item ${isClaimed ? 'done' : ''}`}
              onClick={() => onOpenDetail(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenDetail(item.id);
              }}
            >
              <div>
                <button
                  className="link"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetail(item.id);
                  }}
                >
                  {item.type === 'lost' ? 'Lost' : 'Found'}: {getItemTitle(item)}
                </button>
                {isClaimed && <span className="tag">Closed</span>}
                <ItemTags item={item} />
              </div>

              <button
                className="soft"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                Delete
              </button>
            </div>
          );
        })
      )}
    </section>
  );
}
