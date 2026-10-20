import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Layers,
  Settings,
  FileSpreadsheet
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'orders' | 'products' | 'categories' | 'settings';

interface SidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onOpenExportModal: () => void;
  pendingOrdersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenExportModal,
  pendingOrdersCount = 0
}) => {
  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'डैशबोर्ड (Overview)',
      icon: LayoutDashboard
    },
    {
      id: 'orders' as AdminTab,
      label: 'ऑर्डर प्रबंधन (Orders)',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      id: 'products' as AdminTab,
      label: 'सामान सूची (Products)',
      icon: PackageCheck
    },
    {
      id: 'categories' as AdminTab,
      label: 'श्रेणियां (Categories)',
      icon: Layers
    },
    {
      id: 'settings' as AdminTab,
      label: 'दुकान सेटिंग्स (Settings)',
      icon: Settings
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 md:min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                isActive
                  ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-500/10'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onOpenExportModal}
            className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Excel रिपोर्ट डाउनलोड करें</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
