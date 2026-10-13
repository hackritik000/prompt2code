/**
 * Campus Lost & Found Matching Engine (TypeScript Edition)
 *
 * Core algorithmic challenge:
 * Calculates a multi-factor similarity score (0% - 100%) between a lost-item report
 * and a found-item report based on:
 *   1. Category similarity (25% weight)
 *   2. Color similarity (20% weight)
 *   3. Location similarity (20% weight)
 *   4. Date timeline decay (15% weight)
 *   5. Description text similarity (20% weight)
 *
 * All functions are pure, deterministic, and free of DOM dependencies.
 */

import {
	COLOR_FAMILIES,
	STOP_WORDS,
	SYNONYMS,
	ZONES,
} from "../constants/options";
import { WEIGHTS } from "../constants/weights";
import type {
	Item,
	MatchCandidate,
	MatchComparison,
	SimilarityPartKey,
	SimilarityParts,
} from "../types";
import { getDayNumber } from "../utils/dateUtils";

/**
 * Computes Levenshtein edit distance between two strings.
 * Used for typo tolerance on words longer than 3 characters (e.g. "backpack" vs "backpak").
 *
 * @param a - First string
 * @param b - Second string
 * @returns Minimum single-character edits (insertions, deletions, substitutions)
 */
function levenshtein(a: string, b: string): number {
	const dp: number[] = [...Array(b.length + 1).keys()];
	for (let i = 1; i <= a.length; i++) {
		let prev = dp[0];
		dp[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const temp = dp[j];
			dp[j] = Math.min(
				dp[j] + 1,
				dp[j - 1] + 1,
				prev + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
			prev = temp;
		}
	}
	return dp[b.length];
}

/**
 * Checks if two words are identical or within a 1-character typo tolerance.
 */
function isSimilarWord(a: string, b: string): boolean {
	return a === b || (a.length > 3 && b.length > 3 && levenshtein(a, b) <= 1);
}

/**
 * Tokenizes text by normalizing to lowercase, removing punctuation,
 * filtering common English stop words, and mapping synonyms to canonical terms.
 */
export function tokenize(text: string): string[] {
	return (text || "")
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, " ")
		.split(/\s+/)
		.filter((word) => word && !STOP_WORDS.has(word))
		.map((word) => SYNONYMS[word] || word);
}

/**
 * Calculates text similarity using the Sørensen-Dice coefficient with typo tolerance.
 * Returns null when either description is empty, which excludes the factor from the weighted average.
 */
function descSim(a: string, b: string): number | null {
	const tokensA = tokenize(a);
	const tokensB = tokenize(b);
	if (!tokensA.length || !tokensB.length) return null;

	const used = new Set<number>();
	let matches = 0;

	for (const wordA of tokensA) {
		const matchIndex = tokensB.findIndex(
			(wordB, index) => !used.has(index) && isSimilarWord(wordA, wordB),
		);
		if (matchIndex > -1) {
			used.add(matchIndex);
			matches++;
		}
	}

	return (2 * matches) / (tokensA.length + tokensB.length);
}

/**
 * Calculates category similarity:
 * - Exact match: 1.0
 * - Either is "Other": 0.4 (partial credit for unclassified items)
 * - Different categories: 0.0
 */
function catSim(a: string, b: string): number {
	if (a === b) return 1.0;
	if (a === "Other" || b === "Other") return 0.4;
	return 0.0;
}

/**
 * Calculates color similarity:
 * - Exact match: 1.0
 * - Multicolor item: 0.5
 * - Same color family (e.g. blue & green, black & grey): 0.5
 * - Unrelated colors: 0.0
 */
export function colSim(a: string, b: string): number {
	if (a === b) return 1.0;
	if (a === "multicolor" || b === "multicolor") return 0.5;
	const isSameFamily = COLOR_FAMILIES.some(
		(family) => family.includes(a) && family.includes(b),
	);
	return isSameFamily ? 0.5 : 0.0;
}

/**
 * Calculates location similarity based on campus geography:
 * - Exact same location: 1.0
 * - Same campus zone (e.g. Library & Computer Lab in 'academic'): 0.6
 * - Different zones: 0.0
 */
export function locSim(a: string, b: string): number {
	if (a === b) return 1.0;
	if (ZONES[a] && ZONES[a] === ZONES[b]) return 0.6;
	return 0.0;
}

/**
 * Calculates date proximity similarity:
 * Items found before they were lost receive 0.0.
 * Items found up to 7 days after linearly decay from 1.0 to 0.0.
 */
export function dateSim(lostDate: string, foundDate: string): number {
	const diffDays = getDayNumber(foundDate) - getDayNumber(lostDate);
	if (diffDays < 0) return 0.0;
	return Math.max(0, 1 - diffDays / 7);
}

export type ItemComparisonInput = Pick<
	Item,
	"category" | "color" | "location" | "date" | "description"
>;

/**
 * Compares a lost item report against a found item report.
 * Computes individual component scores, weights them, and applies a cap
 * (max 40%) if the item categories do not match at all.
 */
export function compare(
	lost: ItemComparisonInput,
	found: ItemComparisonInput,
): MatchComparison {
	const parts: SimilarityParts = {
		category: catSim(lost.category, found.category),
		color: colSim(lost.color, found.color),
		location: locSim(lost.location, found.location),
		date: dateSim(lost.date, found.date),
		description: descSim(lost.description, found.description),
	};

	let weightedSum = 0;
	let totalApplicableWeight = 0;

	const keys = Object.keys(WEIGHTS) as SimilarityPartKey[];
	for (const key of keys) {
		const val = parts[key];
		// If description is missing/null, dynamically redistribute weights
		if (val === null) continue;
		weightedSum += WEIGHTS[key] * val;
		totalApplicableWeight += WEIGHTS[key];
	}

	let pct =
		totalApplicableWeight > 0
			? Math.round((100 * weightedSum) / totalApplicableWeight)
			: 0;

	// Domain rule: If items are entirely different categories, match cannot exceed 40%
	if (parts.category === 0) {
		pct = Math.min(pct, 40);
	}

	return { pct, parts };
}

/**
 * Finds and ranks candidates for a given target item among all items in storage.
 */
export function matchesFor(
	targetItem: Item,
	allItems: Item[],
	minThreshold: number = 45,
): MatchCandidate[] {
	return allItems
		.filter(
			(other) => other.type !== targetItem.type && other.status === "open",
		)
		.map((other): MatchCandidate => {
			const matchDetails =
				targetItem.type === "lost"
					? compare(targetItem, other)
					: compare(other, targetItem);

			return {
				item: other,
				...matchDetails,
			};
		})
		.filter((candidate) => candidate.pct >= minThreshold)
		.sort((a, b) => b.pct - a.pct);
}

export const Engine = {
	W: WEIGHTS,
	ZONES,
	tok: tokenize,
	descSim,
	compare,
	matchesFor,
};

export default Engine;
