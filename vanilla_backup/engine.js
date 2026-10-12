/* Matching engine: pure functions, no DOM.
   Score = weighted average of five similarities (each 0..1), shown as percentage. */
const Engine = (() => {
  const WEIGHTS = {
    category: 25,
    color: 20,
    location: 20,
    date: 15,
    description: 20,
  };

  const ZONES = {
    Library: "academic",
    "Classroom Block": "academic",
    "Computer Lab": "academic",
    Canteen: "central",
    Auditorium: "central",
    "Admin Block": "central",
    Hostel: "residential",
    Mess: "residential",
    "Sports Ground": "sports",
    Gym: "sports",
    "Main Gate": "entry",
    Parking: "entry",
  };

  const COLOR_FAMILIES = [
    ["black", "grey", "silver"],
    ["white", "silver", "grey"],
    ["blue", "green"],
    ["red", "pink", "orange"],
    ["yellow", "orange", "brown"],
  ];

  const SYNONYMS = {
    flask: "bottle",
    tumbler: "bottle",
    sipper: "bottle",
    backpack: "bag",
    rucksack: "bag",
    satchel: "bag",
    purse: "wallet",
    mobile: "phone",
    smartphone: "phone",
    cellphone: "phone",
    earbuds: "earphones",
    airpods: "earphones",
    headphones: "earphones",
    specs: "glasses",
    spectacles: "glasses",
    key: "keys",
    notebook: "book",
  };

  const STOP_WORDS = new Set(
    "a an the of with and is in on at my it its near has was".split(" "),
  );

  // Convert string to tokens, remove stop words, and map synonyms to canonical words.
  const tokenize = (str) =>
    (str || "")
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((word) => word && !STOP_WORDS.has(word))
      .map((word) => SYNONYMS[word] || word);

  // Levenshtein distance calculation for typo tolerance.
  function levenshtein(a, b) {
    const dp = [...Array(b.length + 1).keys()];
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

  const isSimilarWord = (a, b) =>
    a === b || (a.length > 3 && b.length > 3 && levenshtein(a, b) <= 1);

  // Description similarity using Dice coefficient. Returns null if empty to skip weighting.
  function descSim(a, b) {
    const tokensA = tokenize(a);
    const tokensB = tokenize(b);
    if (!tokensA.length || !tokensB.length) return null;

    const used = new Set();
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

  const catSim = (a, b) =>
    a === b ? 1 : a === "Other" || b === "Other" ? 0.4 : 0;

  const colSim = (a, b) =>
    a === b
      ? 1
      : a === "multicolor" ||
          b === "multicolor" ||
          COLOR_FAMILIES.some((fam) => fam.includes(a) && fam.includes(b))
        ? 0.5
        : 0;

  const locSim = (a, b) =>
    a === b ? 1 : ZONES[a] && ZONES[a] === ZONES[b] ? 0.6 : 0;

  const getDayNumber = (dateStr) => Date.parse(dateStr + "T00:00:00Z") / 864e5;

  const dateSim = (lostDate, foundDate) => {
    const diffDays = getDayNumber(foundDate) - getDayNumber(lostDate);
    return diffDays < 0 ? 0 : Math.max(0, 1 - diffDays / 7);
  };

  function compare(lost, found) {
    const parts = {
      category: catSim(lost.category, found.category),
      color: colSim(lost.color, found.color),
      location: locSim(lost.location, found.location),
      date: dateSim(lost.date, found.date),
      description: descSim(lost.description, found.description),
    };

    let sum = 0;
    let weight = 0;
    for (const key in WEIGHTS) {
      if (parts[key] === null) continue;
      sum += WEIGHTS[key] * parts[key];
      weight += WEIGHTS[key];
    }

    let pct = Math.round((100 * sum) / weight);
    if (parts.category === 0) pct = Math.min(pct, 40);

    return { pct, parts };
  }

  function matchesFor(item, allItems, minThreshold = 45) {
    return allItems
      .filter((other) => other.type !== item.type && other.status === "open")
      .map((other) => ({
        item: other,
        ...(item.type === "lost" ? compare(item, other) : compare(other, item)),
      }))
      .filter((res) => res.pct >= minThreshold)
      .sort((a, b) => b.pct - a.pct);
  }

  return { W: WEIGHTS, ZONES, tok: tokenize, descSim, compare, matchesFor };
})();

if (typeof module !== "undefined") module.exports = Engine;
