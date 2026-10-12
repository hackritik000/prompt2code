# 🎓 Campus Lost & Found Matcher (React + TypeScript Edition)

A modern, accessible, and high-performance React + TypeScript application designed for campus communities to register lost and found items, automatically compute multi-factor similarity scores, and verify matches using student-crafted logic and optional AI assistance.

Built for **Code Verse: Prompt 2 Code** (Problem Statement 2: *Lost and Found Matcher*).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open the local URL displayed in the terminal (default: [http://localhost:3000](http://localhost:3000)).

### 3. Type-Check and Build for Production
```bash
npm run build
npm run preview
```

> 💡 **Original Files Preserved**: The original vanilla JS/HTML files are safely archived in the [`vanilla_backup/`](./vanilla_backup/) folder.

---

## 🧱 Project Architecture & Readability

The project is written in strict TypeScript with full type safety across components, models, and calculation engines:

```
compuse/
├── src/
│   ├── types/                 # Centralized TypeScript definitions
│   │   └── index.ts           # Item, MatchComparison, AiConfig, TabId types
│   ├── components/            # Strongly-typed UI components
│   │   ├── Header.tsx         # Navigation bar & AI settings trigger
│   │   ├── Footer.tsx         # Live formula weight breakdown display
│   │   ├── ReportTab.tsx      # Lost/Found report submission form
│   │   ├── MatchesTab.tsx     # Ranked matches view with score rings
│   │   ├── CandidateCard.tsx  # Candidate match card, breakdown bars & AI action
│   │   ├── ItemsTab.tsx       # Tabulated lists for Lost, Found, and All items
│   │   ├── ItemDetailModal.tsx# Inspection dialog for report details & match pairs
│   │   ├── AiSettingsModal.tsx# Google Gemini & OpenAI API configuration modal
│   │   ├── ItemTags.tsx       # Category, color, location & date badges
│   │   └── Toast.tsx          # Notification alert banner
│   ├── constants/             # Typed options, weights & demo data
│   │   ├── options.ts         # Categories, colors, campus zones, synonyms
│   │   ├── weights.ts         # Algorithmic weights & metric labels
│   │   └── demoData.ts        # High-coverage demo dataset for evaluation
│   ├── services/              # Pure business logic (no DOM or UI dependencies)
│   │   ├── matchingEngine.ts  # Core student-owned matching score algorithm
│   │   └── aiService.ts       # Resilient LLM comparison service with auto-retries
│   ├── utils/                 # Pure helper functions
│   │   ├── dateUtils.ts       # Date math, ISO formatters & timeline decay
│   │   └── stringUtils.ts     # Text normalization, capitalization & truncation
│   ├── hooks/                 # Custom generic React hooks
│   │   └── useLocalStorage.ts # Type-safe state persistence in localStorage
│   ├── App.tsx                # Application root state & router controller
│   ├── index.css              # Elegant typography & custom CSS design
│   ├── vite-env.d.ts          # Vite client types
│   └── main.tsx               # React 18 root mount
├── tsconfig.json              # TypeScript compiler configuration
├── vanilla_backup/            # Safe backup of the original vanilla files
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation & defense guide
```

---

## 🧠 Core Challenge: Matching Algorithm Defense Guide

Judges will ask how your algorithm calculates match scores. Here is the exact breakdown to present:

### 1. Mathematical Weight Distribution
The final match percentage is a **weighted average** of 5 independent similarity dimensions:

| Factor | Weight | Scoring Rule |
| :--- | :---: | :--- |
| **Category** | **25%** | `1.0` if exact match; `0.4` if either is "Other"; `0.0` otherwise. |
| **Color** | **20%** | `1.0` if exact match; `0.5` if "multicolor" or in same family (e.g. blue & green); `0.0` otherwise. |
| **Location** | **20%** | `1.0` if exact location; `0.6` if in same campus zone (e.g. Library & Computer Lab in Academic zone); `0.0` otherwise. |
| **Date** | **15%** | `0.0` if found before lost. Linearly decays over 7 days: $\max(0, 1 - \frac{\Delta\text{days}}{7})$. |
| **Description** | **20%** | Sørensen-Dice coefficient with typo tolerance on normalized keyword tokens. Skipped dynamically if blank. |

### 2. Typo-Tolerant Text Similarity
* **Stop Words Removal**: Words like *a, the, in, on, with* are removed.
* **Synonym Mapping**: Campus synonyms are normalized to canonical roots (e.g., `tumbler` / `flask` $\to$ `bottle`, `backpack` $\to$ `bag`, `mobile` $\to$ `phone`).
* **Levenshtein Distance**: Words longer than 3 characters with an edit distance $\le 1$ are recognized as matches (e.g., "backpak" $\approx$ "backpack").
* **Sørensen-Dice Coefficient**:
  $$\text{Similarity} = \frac{2 \times |\text{Tokens}_A \cap \text{Tokens}_B|}{|\text{Tokens}_A| + |\text{Tokens}_B|}$$

### 3. Category Guardrail Penalty
If two reports have completely mismatched categories (e.g., a *Phone* vs *Keys*), the overall match score is **hard-capped at 40%**, preventing false positives even if they share colors or locations.

---

## 🤖 AI Verification (Gemini & OpenAI)

In addition to the student-coded matching engine, the application provides an **Ask AI** second-opinion feature:
* **Offline-First**: The application works completely without an API key or internet connection.
* **Provider Support**: Seamlessly supports Google Gemini (`gemini-3.5-flash` or custom) and OpenAI-compatible endpoints.
* **Exponential Backoff**: Automatically handles transient rate limits (HTTP 429) and server overloads (HTTP 5xx) with 3 retries.
* **Structured JSON**: Prompts the LLM for strict JSON schema with match percentage and concise natural-language justification.

---

## 🛡️ Key Features & User Workflow

1. **Report Tab**: Quickly report lost or found items with category, color, location, date, and description.
2. **One-Click Demo Data**: Instantly populates 9 real-world campus reports for live demonstrations.
3. **Matches Tab**: Real-time matching cards showing circular percentage rings and breakdown progress bars for each dimension.
4. **Confirm Match**: Pair confirmed items and transition both to "Closed" status with cross-references.
5. **Item Lists & Modals**: Filterable views of Lost, Found, and All reports with open/closed counters and full inspection dialogs.
6. **Local Persistence**: All data is automatically stored in the browser's `localStorage` (`lf-items` and `lf-ai`).
