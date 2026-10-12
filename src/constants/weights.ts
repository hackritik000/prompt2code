import { SimilarityPartKey } from '../types';

/**
 * Weights assigned to each similarity factor in the matching algorithm.
 * Total possible weight sum is 100%.
 */
export const WEIGHTS: Record<SimilarityPartKey, number> = {
  category: 25,
  color: 20,
  location: 20,
  date: 15,
  description: 20,
};

/**
 * Human-readable labels for the similarity breakdown bars.
 */
export const PART_LABELS: Record<SimilarityPartKey, string> = {
  category: 'Category',
  color: 'Color',
  location: 'Location',
  date: 'Date',
  description: 'Description',
};
