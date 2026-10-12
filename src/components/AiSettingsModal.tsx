import React, { useState, useEffect, useRef } from 'react';
import { AiConfig, AiProvider } from '../types';

interface AiSettingsModalProps {
  isOpen: boolean;
  config: AiConfig;
  onSave: (newConfig: AiConfig) => void;
  onRemoveKey: () => void;
  onClose: () => void;
}

/**
 * AI configuration modal dialog.
 */
export default function AiSettingsModal({
  isOpen,
  config,
  onSave,
  onRemoveKey,
  onClose,
}: AiSettingsModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [key, setKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [base, setBase] = useState<string>('');

  // Synchronize internal form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProvider(config?.provider || 'gemini');
      setKey(config?.key || '');
      setModel(config?.model || '');
      setBase(config?.base || '');

      if (dialogRef.current && !dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    } else {
      if (dialogRef.current && dialogRef.current.open) {
        dialogRef.current.close();
      }
    }
  }, [isOpen, config]);

  const isGemini = provider === 'gemini';

  const handleSave = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSave({
      provider,
      key: key.trim(),
      model: model.trim(),
      base: base.trim(),
    });
    onClose();
  };

  const handleRemoveKey = (): void => {
    setKey('');
    onRemoveKey();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      id="dlg"
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <form onSubmit={handleSave}>
        <h2>AI settings</h2>
        <p className="lead">
          Optional. Matching works fully without it. Your key stays in this
          browser.
        </p>

        <label>
          Provider
          <select
            id="prov"
            value={provider}
            onChange={(e) => setProvider(e.target.value as AiProvider)}
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI-compatible</option>
          </select>
        </label>

        <label>
          API key
          <input
            id="key"
            type="password"
            autoComplete="off"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </label>

        <label>
          Model
          <input
            id="model"
            placeholder={isGemini ? 'gemini-3.5-flash' : 'model name'}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>

        {!isGemini && (
          <label id="baseRow">
            Base URL
            <input
              id="base"
              placeholder="https://api.openai.com/v1"
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
          </label>
        )}

        <div className="row">
          <button className="cta" id="saveCfg" type="submit">
            Save
          </button>
          <button className="soft" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="soft"
            id="clrCfg"
            type="button"
            onClick={handleRemoveKey}
          >
            Remove key
          </button>
        </div>
      </form>
    </dialog>
  );
}
