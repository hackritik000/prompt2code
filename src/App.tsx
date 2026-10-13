import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ReportTab from './components/ReportTab';
import MatchesTab from './components/MatchesTab';
import ItemsTab from './components/ItemsTab';
import ItemDetailModal from './components/ItemDetailModal';
import AiSettingsModal from './components/AiSettingsModal';
import Toast from './components/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getDemoItems } from './constants/demoData';
import { Item, AiConfig, TabId } from './types';

export default function App(): React.JSX.Element {
  // Synchronized persistent storage
  const [items, setItems] = useLocalStorage<Item[]>('lf-items', []);
  const [config, setConfig] = useLocalStorage<AiConfig>('lf-ai', {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('report');
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string): void => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  // Save new lost or found report
  const handleAddReport = (newItem: Item): void => {
    setItems((prev) => [...prev, newItem]);
    showToast(`${newItem.type === 'lost' ? 'Lost' : 'Found'} report saved.`);
    setActiveTab('matches');
  };

  // Load sample demo reports
  const handleLoadDemo = (): void => {
    const demoItems = getDemoItems();
    setItems((prev) => [...prev, ...demoItems]);
    showToast('Demo data added.');
    setActiveTab('matches');
  };

  // Confirm match between a lost report and a found report
  const handleConfirmMatch = (lostId: string, foundId: string): void => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === lostId) {
          return { ...item, status: 'claimed', pair: foundId };
        }
        if (item.id === foundId) {
          return { ...item, status: 'claimed', pair: lostId };
        }
        return item;
      })
    );
    showToast('Match confirmed. Both reports are closed.');
  };

  // Delete an item report
  const handleDeleteItem = (id: string): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Report deleted.');
  };

  // AI Settings configuration handlers
  const handleSaveConfig = (newConfig: AiConfig): void => {
    setConfig(newConfig);
    showToast(
      newConfig.key
        ? 'AI check enabled.'
        : 'No key set. Matching stays offline.'
    );
  };

  const handleRemoveKey = (): void => {
    setConfig((prev) => ({ ...prev, key: '' }));
    showToast('Key removed.');
  };

  const selectedItem =
    items.find((item) => item.id === activeDetailId) || null;

  return (
    <>
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="wrap">
        {activeTab === 'report' && (
          <ReportTab
            onAddReport={handleAddReport}
            onLoadDemo={handleLoadDemo}
            showToast={showToast}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab
            items={items}
            aiConfig={config}
            onConfirmMatch={handleConfirmMatch}
            onOpenDetail={setActiveDetailId}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'lost' && (
          <ItemsTab
            tabId="lost"
            items={items}
            onDelete={handleDeleteItem}
            onOpenDetail={setActiveDetailId}
          />
        )}

        {activeTab === 'found' && (
          <ItemsTab
            tabId="found"
            items={items}
            onDelete={handleDeleteItem}
            onOpenDetail={setActiveDetailId}
          />
        )}

        {activeTab === 'items' && (
          <ItemsTab
            tabId="items"
            items={items}
            onDelete={handleDeleteItem}
            onOpenDetail={setActiveDetailId}
          />
        )}
      </main>

      <Footer />

      {/* Item Details Modal */}
      <ItemDetailModal
        item={selectedItem}
        allItems={items}
        onClose={() => setActiveDetailId(null)}
      />

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isSettingsOpen}
        config={config}
        onSave={handleSaveConfig}
        onRemoveKey={handleRemoveKey}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast Notification Alert */}
      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
