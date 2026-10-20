import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Navbar } from './components/Navbar';
import { Sidebar, AdminTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ExcelExportModal } from './components/ExcelExportModal';
import { NewOrderAlertModal, NewOrderData } from './components/NewOrderAlertModal';
import { getAuthToken, clearAuthToken, adminApi } from './api/adminApi';
import { orderAlertService, showDesktopNotification } from './utils/orderAlert';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [incomingOrderModal, setIncomingOrderModal] = useState<NewOrderData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check existing session
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      adminApi('/auth/profile')
        .then(res => {
          if (res.success && res.user && res.user.role === 'admin') {
            setCurrentUser(res.user);
          } else {
            clearAuthToken();
          }
        })
        .catch(() => clearAuthToken())
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // Real-time Socket.io integration for admin room
  useEffect(() => {
    if (!currentUser) return;

    const socketUrl =
      (import.meta as any).env?.VITE_SOCKET_URL ||
      (import.meta as any).env?.VITE_API_URL?.replace(/\/api\/?$/, '') ||
      'http://localhost:5000';

    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket Admin] Connected to server, joining admin channel');
      socket.emit('join_admin_room');
    });

    socket.on('new_order_received', (data: any) => {
      console.log('[Socket Admin] New order received:', data);

      const alertData: NewOrderData = {
        orderId: data.orderId || data._id,
        orderNumber: data.orderNumber || 'AB-NEW',
        totalAmount: data.totalAmount || 0,
        customerName: data.customerName || data.deliveryAddress?.fullName || 'ग्राहक',
        village: data.village || data.deliveryAddress?.village || 'गाँव',
        itemsCount: data.itemsCount || data.items?.length,
        createdAt: data.createdAt
      };

      // 1. Play loud storekeeper bell chime sound
      orderAlertService.playChime();

      // 2. Display native desktop/browser notification
      showDesktopNotification(alertData);

      // 3. Show prominent new order alert modal & navbar banner
      setIncomingOrderModal(alertData);
      setNewOrderAlert(
        `नया ऑर्डर! #${alertData.orderNumber} (₹${alertData.totalAmount}) - ${alertData.customerName}, गाँव: ${alertData.village}`
      );
      setUnreadCount(prev => prev + 1);

      // 4. Trigger auto-refresh of orders & dashboard data
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  const handleOpenOrder = async (orderId: string) => {
    try {
      // First try fetching single order
      const res = await adminApi(`/orders/${orderId}`);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        return;
      }
    } catch (e) {}

    // Fallback search in admin orders
    try {
      const adminRes = await adminApi(`/admin/orders?limit=20`);
      if (adminRes.success && Array.isArray(adminRes.data)) {
        const found = adminRes.data.find((o: any) => o._id === orderId || o.orderNumber === orderId);
        if (found) {
          setSelectedOrder(found);
          return;
        }
      }
    } catch (e) {}

    // Fallback switch to orders page
    setActiveTab('orders');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={user => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        adminName={currentUser.fullName}
        unreadCount={unreadCount}
        onLogout={handleLogout}
        newOrderAlert={newOrderAlert}
        onClearAlert={() => setNewOrderAlert(null)}
        onViewOrderAlert={() => {
          if (incomingOrderModal) {
            handleOpenOrder(incomingOrderModal.orderId);
          } else {
            setActiveTab('orders');
          }
        }}
      />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenExportModal={() => setShowExportModal(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={`dash-${refreshKey}`}
              onSelectOrder={ord => setSelectedOrder(ord)}
              onGoToOrders={() => setActiveTab('orders')}
              onGoToProducts={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersPage
              key={`orders-${refreshKey}`}
              onSelectOrder={ord => setSelectedOrder(ord)}
              onOpenExportModal={() => setShowExportModal(true)}
            />
          )}

          {activeTab === 'products' && <ProductsPage />}

          {activeTab === 'categories' && <CategoriesPage />}

          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Real-time Incoming Order Alert Popup with Sound */}
      {incomingOrderModal && (
        <NewOrderAlertModal
          order={incomingOrderModal}
          onViewOrder={orderId => handleOpenOrder(orderId)}
          onDismiss={() => setIncomingOrderModal(null)}
        />
      )}

      {/* Order Details & Status Transition Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          currentAdmin={currentUser}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={() => {
            setSelectedOrder(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      {/* Excel Export Modal */}
      {showExportModal && (
        <ExcelExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};
