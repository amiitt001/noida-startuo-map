import React from 'react';
import { useSaved } from '../hooks/useSaved';

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onOpenSubmit: () => void;
}

export const MoreDrawer: React.FC<MoreDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenSubmit,
}) => {
  const { count: savedCount } = useSaved();

  if (!isOpen) return null;

  const handleItemClick = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-4/5 max-w-sm h-full bg-white shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between border-b border-[#c6c6cc]/40 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1a1f2c] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px] text-[#FF6B35]">hub</span>
              </div>
              <span className="font-h2 text-base font-bold text-[#030612]">
                Menu & Navigation
              </span>
            </div>
            <button onClick={onClose} className="p-1 text-[#76777c] hover:text-[#030612]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleItemClick('/founders')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1c1b1c] hover:bg-[#f6f3f4]"
            >
              <span className="material-symbols-outlined text-lg text-[#545f72]">group</span>
              <span>Founders Directory</span>
            </button>

            <button
              onClick={() => handleItemClick('/investors')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1c1b1c] hover:bg-[#f6f3f4]"
            >
              <span className="material-symbols-outlined text-lg text-[#545f72]">payments</span>
              <span>Investors & Funds</span>
            </button>

            <button
              onClick={() => handleItemClick('/ecosystem')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1c1b1c] hover:bg-[#f6f3f4]"
            >
              <span className="material-symbols-outlined text-lg text-[#545f72]">analytics</span>
              <span>Ecosystem Analytics</span>
            </button>

            <button
              onClick={() => handleItemClick('/saved')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1c1b1c] hover:bg-[#f6f3f4]"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-[#545f72]">bookmark</span>
                <span>Saved Bookmarks</span>
              </div>
              {savedCount > 0 && (
                <span className="bg-[#FF6B35] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <div className="border-t border-[#c6c6cc]/40 my-3" />

            <button
              onClick={() => handleItemClick('/admin')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#FF6B35] hover:bg-[#f6f3f4]"
            >
              <span className="material-symbols-outlined text-lg text-[#FF6B35]">admin_panel_settings</span>
              <span>Admin Console</span>
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              onClose();
              onOpenSubmit();
            }}
            className="w-full py-3 bg-[#FF6B35] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Submit Startup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
