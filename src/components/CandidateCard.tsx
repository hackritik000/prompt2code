import React, { useState } from 'react';
import ItemTags from './ItemTags';
import { PART_LABELS } from '../constants/weights';
import { getItemTitle } from '../utils/stringUtils';
import { compareWithAI, getAiErrorMessage } from '../services/aiService';
import { Item, MatchCandidate, AiConfig, SimilarityPartKey } from '../types';

interface CandidateCardProps {
  lostItem: Item;
  match: MatchCandidate;
  aiConfig: AiConfig;
  onConfirm: (lostId: string, foundId: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenSettings: () => void;
}

/**
 * Candidate match card shown under a lost item.
 */
export default function CandidateCard({
  lostItem,
  match,
  aiConfig,
  onConfirm,
  onOpenDetail,
  onOpenSettings,
}: CandidateCardProps): React.JSX.Element {
  const foundItem = match.item;
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);

  const handleAskAi = async (): Promise<void> => {
    if (!aiConfig?.key) {
      onOpenSettings();
      return;
    }

    setIsAskingAi(true);
    setAiMessage('Asking the AI...');

    try {
      const result = await compareWithAI(
        lostItem,
        foundItem,
        aiConfig,
        (statusNote) => setAiMessage(statusNote)
      );
      setAiMessage(
        `AI estimate: ${result.score}% likely the same item. ${result.reason}`
      );
    } catch (err) {
      setAiMessage(getAiErrorMessage(err));
    } finally {
      setIsAskingAi(false);
    }
  };

  const partKeys = Object.keys(PART_LABELS) as SimilarityPartKey[];

  return (
    <div
      className="cand"
      onClick={() => onOpenDetail(foundItem.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpenDetail(foundItem.id);
      }}
    >
      {/* Percentage Match Circular Ring */}
      <div
        className="ring"
        style={{ '--p': match.pct } as React.CSSProperties}
      >
        <b>{match.pct}%</b>
      </div>

      <div>
        <button
          className="link"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(foundItem.id);
          }}
        >
          Found: {getItemTitle(foundItem)}
        </button>

        <ItemTags item={foundItem} />

        {/* Breakdown Similarity Tracks */}
        <div className="bars">
          {partKeys.map((key) => {
            const label = PART_LABELS[key];
            const score = match.parts[key];
            const isSkipped = score == null;
            const percentage = isSkipped ? 0 : Math.round(score * 100);

            return (
              <React.Fragment key={key}>
                <span>
                  {label}
                  {isSkipped ? ' (skipped)' : ''}
                </span>
                <div className="trk">
                  <i style={{ width: `${percentage}%` }}></i>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="row">
          <button
            className="soft"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(lostItem.id, foundItem.id);
            }}
          >
            Confirm match
          </button>

          <button
            className="soft"
            type="button"
            disabled={isAskingAi}
            onClick={(e) => {
              e.stopPropagation();
              handleAskAi();
            }}
          >
            Ask AI
          </button>
        </div>

        {/* Optional AI Second Opinion Container */}
        {aiMessage && <div className="ai">{aiMessage}</div>}
      </div>
    </div>
  );
}
