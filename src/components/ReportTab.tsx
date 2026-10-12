import React, { useState } from 'react';
import { Item, ItemType } from '../types';
import { CATEGORIES, COLORS, ZONES } from '../constants/options';
import { capitalize } from '../utils/stringUtils';
import { getIsoDate } from '../utils/dateUtils';

interface ReportTabProps {
  onAddReport: (item: Item) => void;
  onLoadDemo: () => void;
  showToast: (msg: string) => void;
}

/**
 * Report tab: Form to register a new lost or found item.
 */
export default function ReportTab({
  onAddReport,
  onLoadDemo,
  showToast,
}: ReportTabProps): React.JSX.Element {
  const today = getIsoDate(0);

  const [type, setType] = useState<ItemType>('lost');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [location, setLocation] = useState<string>(Object.keys(ZONES)[0]);
  const [date, setDate] = useState<string>(today);
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    if (!date || date > today) {
      showToast('Choose a date that is today or earlier.');
      return;
    }

    const newItem: Item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      type,
      category,
      color,
      location,
      date,
      description: description.trim(),
      status: 'open',
    };

    onAddReport(newItem);

    // Reset form fields
    setType('lost');
    setCategory(CATEGORIES[0]);
    setColor(COLORS[0]);
    setLocation(Object.keys(ZONES)[0]);
    setDate(today);
    setDescription('');
  };

  return (
    <section id="report" className="tab">
      <h2>Report an item</h2>
      <p className="lead">
        Tell us what was lost or found. Matches appear as soon as you save.
      </p>

      <form id="form" onSubmit={handleSubmit}>
        <div className="seg" role="radiogroup" aria-label="Report type">
          <label>
            <input
              type="radio"
              name="type"
              value="lost"
              checked={type === 'lost'}
              onChange={() => setType('lost')}
            />
            <span>I lost something</span>
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="found"
              checked={type === 'found'}
              onChange={() => setType('found')}
            />
            <span>I found something</span>
          </label>
        </div>

        <div className="grid">
          <label>
            Category
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label>
            Color
            <select
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            >
              {COLORS.map((col) => (
                <option key={col} value={col}>
                  {capitalize(col)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Where
            <select
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              {Object.keys(ZONES).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              max={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>

        <label>
          Description
          <textarea
            name="description"
            rows={3}
            placeholder="Brand, size, stickers, scratches, anything distinctive"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="row">
          <button className="cta" type="submit">
            Save report
          </button>
          <button className="soft" type="button" id="demo" onClick={onLoadDemo}>
            Load demo data
          </button>
        </div>
      </form>
    </section>
  );
}
