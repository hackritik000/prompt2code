import React from 'react';
import { Item } from '../types';
import { capitalize } from '../utils/stringUtils';

interface ItemTagsProps {
  item: Item | null | undefined;
}

/**
 * Renders badges for Category, Color, Location, and Date.
 */
export default function ItemTags({ item }: ItemTagsProps): React.JSX.Element | null {
  if (!item) return null;

  return (
    <div className="tags">
      <span className="tag">{item.category}</span>
      <span className="tag">{capitalize(item.color)}</span>
      <span className="tag">{item.location}</span>
      <span className="tag">{item.date}</span>
    </div>
  );
}
