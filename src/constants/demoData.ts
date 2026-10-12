import { Item } from '../types';
import { getIsoDate } from '../utils/dateUtils';

/**
 * Creates sample test items simulating realistic campus lost and found reports.
 * Used for evaluation, live demos, and testing edge cases.
 *
 * @returns List of sample items
 */
export const getDemoItems = (): Item[] => [
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'lost',
    category: 'Bottle',
    color: 'black',
    location: 'Library',
    date: getIsoDate(0),
    description: 'Black water bottle',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'found',
    category: 'Bottle',
    color: 'black',
    location: 'Library',
    date: getIsoDate(0),
    description: 'Black bottle',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'lost',
    category: 'Bag',
    color: 'blue',
    location: 'Canteen',
    date: getIsoDate(2),
    description: 'Blue backpack with a Nike logo',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'found',
    category: 'Bag',
    color: 'blue',
    location: 'Auditorium',
    date: getIsoDate(1),
    description: 'Navy rucksack, Nike logo on the front',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'lost',
    category: 'Keys',
    color: 'red',
    location: 'Parking',
    date: getIsoDate(1),
    description: 'Bunch of keys with a red keyring',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'found',
    category: 'Keys',
    color: 'red',
    location: 'Main Gate',
    date: getIsoDate(0),
    description: 'Keys on a red keychain',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'lost',
    category: 'Phone',
    color: 'black',
    location: 'Classroom Block',
    date: getIsoDate(1),
    description: 'Black Samsung mobile with cracked cover',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'found',
    category: 'Phone',
    color: 'black',
    location: 'Computer Lab',
    date: getIsoDate(0),
    description: 'Samsung smartphone, black, cover cracked',
    status: 'open',
  },
  {
    id: Math.random().toString(36).slice(2, 9),
    type: 'found',
    category: 'Wallet',
    color: 'brown',
    location: 'Mess',
    date: getIsoDate(0),
    description: 'Brown leather wallet',
    status: 'open',
  },
];
