import React from 'react';
import ItemTags from './ItemTags';
import CandidateCard from './CandidateCard';
import { getItemTitle } from '../utils/stringUtils';
import { matchesFor } from '../services/matchingEngine';
import { Item, AiConfig } from '../types';

interface MatchesTabProps {
  items: Item[];
  aiConfig: AiConfig;
  onConfirmMatch: (lostId: string, foundId: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenSettings: () => void;
}

/**
 * Matches tab: Displays all active lost items and their top scored candidate matches.
 */
export default function MatchesTab({
  items,
  aiConfig,
  onConfirmMatch,
  onOpenDetail,
  onOpenSettings,
}: MatchesTabProps): React.JSX.Element {
  const openLostItems = items.filter(
    (item) => item.type === 'lost' && item.status === 'open'
  );

  return (
    <section id="matches" className="tab">
      <h2>Matches</h2>
      <p className="lead">
        Best matches first. Every score shows exactly how it was built.
      </p>

      {openLostItems.length === 0 ? (
        <div className="empty">
          No open lost reports yet. Report a lost item, or load the demo data on
          the Report tab.
        </div>
      ) : (
        openLostItems.map((lostItem) => {
          const matches = matchesFor(lostItem, items);

          return (
            <article key={lostItem.id} className="card">
              <h3>
                <button
                  className="link"
                  type="button"
                  onClick={() => onOpenDetail(lostItem.id)}
                >
                  Lost: {getItemTitle(lostItem)}
                </button>
              </h3>

              <ItemTags item={lostItem} />

              {matches.length === 0 ? (
                <p className="lead">
                  No found item matches this yet. New found reports are compared
                  automatically.
                </p>
              ) : (
                matches.map((match) => (
                  <CandidateCard
                    key={match.item.id}
                    lostItem={lostItem}
                    match={match}
                    aiConfig={aiConfig}
                    onConfirm={onConfirmMatch}
                    onOpenDetail={onOpenDetail}
                    onOpenSettings={onOpenSettings}
                  />
                ))
              )}
            </article>
          );
        })
      )}
    </section>
  );
}
