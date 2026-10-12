import React, { useEffect, useRef } from 'react';
import { Item } from '../types';
import { capitalize, getItemTitle } from '../utils/stringUtils';

interface ItemDetailModalProps {
  item: Item | null;
  allItems: Item[];
  onClose: () => void;
}

/**
 * Item detail inspection modal dialog.
 */
export default function ItemDetailModal({
  item,
  allItems,
  onClose,
}: ItemDetailModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [item]);

  if (!item) return null;

  const isClosed = item.status === 'claimed';
  const pairedItem = isClosed ? allItems.find((x) => x.id === item.pair) : undefined;

  const details: [string, string][] = [
    ['Category', item.category],
    ['Color', capitalize(item.color)],
    ['Where', item.location],
    ['Date', item.date],
    ['Description', item.description || 'None given'],
  ];

  return (
    <dialog
      id="detail"
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Close when clicking dialog backdrop
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div id="dBody">
        <h2>{item.type === 'lost' ? 'Lost' : 'Found'} item</h2>
        <p>
          <span className="tag">{isClosed ? 'Closed' : 'Open'}</span>
        </p>

        <dl className="ov">
          {details.map(([key, val]) => (
            <React.Fragment key={key}>
              <dt>{key}</dt>
              <dd>{val}</dd>
            </React.Fragment>
          ))}
        </dl>

        {isClosed && (
          <p className="note">
            {item.type === 'lost'
              ? 'This item has been found.'
              : 'This item has been claimed by its owner.'}
            {pairedItem && (
              <>
                {' It was matched with a '}
                {pairedItem.type}
                {' report: '}
                {getItemTitle(pairedItem)}, {pairedItem.location},{' '}
                {pairedItem.date}.
              </>
            )}
          </p>
        )}
      </div>

      <form method="dialog" onSubmit={onClose}>
        <button className="soft" type="submit">
          Close
        </button>
      </form>
    </dialog>
  );
}
