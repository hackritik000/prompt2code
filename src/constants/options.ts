/**
 * Options and vocabulary used across the Campus Lost & Found application.
 */

export const CATEGORIES: readonly string[] = [
  'Bottle',
  'Bag',
  'Wallet',
  'Phone',
  'Keys',
  'ID card',
  'Earphones',
  'Glasses',
  'Book',
  'Clothing',
  'Other',
];

export const COLORS: readonly string[] = [
  'black',
  'white',
  'grey',
  'silver',
  'blue',
  'green',
  'red',
  'pink',
  'orange',
  'yellow',
  'brown',
  'multicolor',
];

/**
 * Campus locations grouped by geographic zone.
 * Items in the same zone receive partial location similarity credit (0.6).
 */
export const ZONES: Record<string, string> = {
  Library: 'academic',
  'Classroom Block': 'academic',
  'Computer Lab': 'academic',
  Canteen: 'central',
  Auditorium: 'central',
  'Admin Block': 'central',
  Hostel: 'residential',
  Mess: 'residential',
  'Sports Ground': 'sports',
  Gym: 'sports',
  'Main Gate': 'entry',
  Parking: 'entry',
};

/**
 * Related color families for partial color matching (0.5 score).
 */
export const COLOR_FAMILIES: readonly string[][] = [
  ['black', 'grey', 'silver'],
  ['white', 'silver', 'grey'],
  ['blue', 'green'],
  ['red', 'pink', 'orange'],
  ['yellow', 'orange', 'brown'],
];

/**
 * Campus item synonyms mapped to standardized canonical tokens.
 */
export const SYNONYMS: Record<string, string> = {
  flask: 'bottle',
  tumbler: 'bottle',
  sipper: 'bottle',
  backpack: 'bag',
  rucksack: 'bag',
  satchel: 'bag',
  purse: 'wallet',
  mobile: 'phone',
  smartphone: 'phone',
  cellphone: 'phone',
  earbuds: 'earphones',
  airpods: 'earphones',
  headphones: 'earphones',
  specs: 'glasses',
  spectacles: 'glasses',
  key: 'keys',
  notebook: 'book',
};

/**
 * English stop words excluded during text tokenization to focus on salient keywords.
 */
export const STOP_WORDS: ReadonlySet<string> = new Set(
  'a an the of with and is in on at my it its near has was'.split(' ')
);
