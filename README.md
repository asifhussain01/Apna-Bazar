# Apna Bazar (ShopEase)
### A Production-Ready, Rural-Friendly E-Commerce Mobile Platform

> **Primary Principle:** *Simple for customers, powerful for the shop owner.*

---

## 🌾 1. Overview & Vision

**Apna Bazar (ShopEase)** is an end-to-end, production-ready rural commerce application designed specifically for rural families, villagers, elderly individuals, and first-time digital shoppers in India. 

### Why Rural E-Commerce is Different
- **No Complex Street Addresses:** Customers specify deliveries by village name, nearby landmark (e.g. *Shiv Mandir*, *Panchayat Bhawan*, or *Near School*).
- **Cash on Delivery (COD) as First-Class Citizen:** Rural customers pay in cash when goods physically arrive at their doorstep.
- **Bilingual & Regional-First:** Seamless Hindi and English localization with high-contrast text, familiar icons, and large touch targets (min 52px).
- **Resilient on 2G/3G & Offline:** Local cart preservation via AsyncStorage, product catalog caching, and atomic idempotency keys preventing duplicate orders on spotty network connections.

---

## 🏛️ 2. Architectural Blueprint

The platform consists of three core applications sharing a unified database and real-time event layer:

```
apna-bazar/
├── backend/            # Node.js + Express + MongoDB + Socket.IO + ExcelJS + JWT
│   ├── src/
│   │   ├── config/     # Database and environment configurations
│   │   ├── models/     # User, Category, Product, Order, Notification, ShopSetting, AuditLog
│   │   ├── controllers/# Auth, Products, Orders, Admin, Notifications, Settings
│   │   ├── services/   # Atomic OrderService, ExcelExportService, SocketService, PushService
│   │   ├── middleware/ # Rate limiters, JWT auth, Role authorization, Zod validation
│   │   ├── scripts/    # Database seeder (seed.ts) and Admin creator (createAdmin.ts)
│   │   └── tests/      # Automated unit tests (Price calculation, Transitions, Excel injection)
│   └── package.json
│
├── mobile/             # Android-First React Native + Expo + TypeScript
│   ├── src/
│   │   ├── components/ # Large-touch Button, ProductCard, Timeline, OfflineNotice, Header
│   │   ├── screens/    # All 16 rural-friendly customer screens
│   │   ├── store/      # CartStore (AsyncStorage), AuthStore, LocalizationStore
│   │   ├── i18n/       # Hindi (hi.json) and English (en.json) dictionaries
│   │   └── api/        # Client, Socket, Products, Orders
│   ├── App.tsx
│   └── app.json
│
├── admin/              # Responsive Web Admin Portal (React + Vite + Tailwind + Lucide)
│   ├── src/
│   │   ├── pages/      # Dashboard, Orders, Inventory, Categories, Settings, Login
│   │   ├── components/ # OrderDetailModal, ProductModal, ExcelExportModal, MetricsCard
│   │   └── api/        # Admin API & Excel report generator
│   └── package.json
│
└── shared/             # Shared TypeScript types and order status contracts
```

---

## 📱 3. Customer Mobile Application (16 Screens)

Built with **React Native**, **Expo**, **TypeScript**, and **Zustand**:

1. **Splash Screen (`SplashScreen.tsx`):** ShopEase Apna Bazar branding, warm saffron visual styling, automated language and persistent session check.
2. **Language Selection Screen (`LanguageSelectScreen.tsx`):** Large visual cards for **हिन्दी (Hindi)** and **English**, designed to easily extend to Gujarati, Marathi, Bengali, etc.
3. **Onboarding Screen (`OnboardingScreen.tsx`):** 3 illustrated steps (Pure groceries, simple village address, Cash on Delivery) with a one-tap Skip button.
4. **Home Screen (`HomeScreen.tsx`):** Prominent search bar, category circles, free delivery threshold banner, today's deals, and popular village essentials.
5. **Category Screen (`CategoryScreen.tsx`):** Clean visual category list with large iconography.
6. **Product Listing Screen (`ProductListScreen.tsx`):** 2-column card grid with filters (In Stock Only, Price Low-to-High, Price High-to-Low).
7. **Product Details Screen (`ProductDetailScreen.tsx`):** Image gallery, bold sale price with MRP savings pill, pack size/unit badge (e.g. 5 kg, 1 L), stock status, and quantity stepper.
8. **Shopping Cart (`CartScreen.tsx`):** Local AsyncStorage persistence so the cart is never lost when the app closes; interactive Free Delivery progress bar; itemized bill breakdown.
9. **Village Address Management (`AddressManageScreen.tsx`):** Specifically requests Village/Town, District, State, PIN, and **Nearby Landmark** (temple, school, shop) without forcing GPS coordinates.
10. **Simple Checkout (`CheckoutScreen.tsx`):** Supports guest and registered customers; displays Cash on Delivery; prevents duplicate submissions via client-generated idempotency keys.
11. **Order Confirmation (`OrderConfirmationScreen.tsx`):** Order number display, delivery estimate (2-4 hours), and direct call shopkeeper button.
12. **My Orders (`MyOrdersScreen.tsx`):** Active Orders and Past Orders tabs with localized status badges.
13. **Order Details & Delivery Tracking (`OrderDetailScreen.tsx`):** 6-step visual timeline (*Placed → Confirmed → Packing → Shipped → Out for Delivery → Delivered*) with real-time Socket.io updates.
14. **Notifications (`NotificationScreen.tsx`):** Persistent database notifications, unread count badge, and tap-to-view order status.
15. **Profile & Account Settings (`ProfileScreen.tsx`):** Language switcher, saved addresses, logout, and privacy options.
16. **Help & Contact Shopkeeper (`HelpContactScreen.tsx`):** One-tap Call and WhatsApp links (with safety confirmation dialogs), shop hours, and FAQs.
17. **Privacy Policy, Terms & Account Deletion (`PolicyTermsScreen.tsx`):** Transparent privacy policy and complete account deletion workflow.

---

## 💻 4. Web Admin Dashboard & Order Management

Built with **React 18**, **Vite**, **Tailwind CSS**, and **Socket.io Client**:

- **Real-Time Sound & Toast:** Live Socket.IO notification whenever a villager places a new order.
- **Analytics Metrics:** Total orders, Orders awaiting confirmation, Packing, Shipped, Delivered, Total revenue, and Low-stock count.
- **State-Machine Order Progression:**
  $$\text{PLACED} \longrightarrow \text{CONFIRMED} \longrightarrow \text{PREPARING} \longrightarrow \text{SHIPPED} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \text{DELIVERED}$$
  *Includes controlled cancellation and rejection with mandatory reason recording.*
- **Independent COD Cash Collection:** Toggle COD cash received independently from shipment delivery status.
- **Product & Inventory Management:** Add/edit products with bilingual names, units, SKU, pricing, stock counters, and low-stock warning badges.
- **Shop Configuration:** Manage shop phone number, WhatsApp contact, delivery fees (default ₹20), and free delivery threshold (default ₹499).

---

## 📊 5. Excel Reports & Business Operations

The backend generates native Excel files using **ExcelJS** via `/api/admin/orders/export-excel`:
- **Formula Injection Neutralization:** Cell text beginning with `=`, `+`, `-`, `@`, or tab characters are automatically prefixed with a single quote `'` to prevent CSV/Excel formula injection.
- **UTF-8 & Unicode Support:** Correct rendering of Hindi text (e.g. *रामपुर गाँव*, *आशीर्वाद आटा*).
- **Two Distinct Sheets:**
  1. **Orders Summary:** Order ID, Date, Customer Name, Mobile, Village, Landmark, Delivery Charges, Total, COD Status, Order Status.
  2. **Order Line Items:** Item-level breakdown with SKU, Unit, Quantity, Unit Price, and Item Subtotal.
- **Formatting:** Styled Navy/Forest headers, frozen top rows, auto column widths, and proper currency cell formatting (`₹#,##0.00`).

---

## 🔒 6. Security, Concurrency & Data Integrity

- **Server-Side Price Validation:** Product prices and delivery fees are recomputed on the server; client-submitted totals are never trusted.
- **Atomic Concurrency Protection:** Stock reservation uses atomic MongoDB updates:
  ```typescript
  Product.findOneAndUpdate(
    { _id: item.productId, stockQuantity: { $gte: item.quantity } },
    { $inc: { stockQuantity: -item.quantity } }
  );
  ```
  *If any item fails, reserved stock is automatically rolled back.*
- **Idempotency Protection:** Unique `idempotencyKey` prevents duplicate orders if a user taps twice or network retries occur.
- **Role-Based Authorization:** Strict JWT verification ensures customers cannot access admin endpoints.
- **Rate Limiting & Helmet:** Protected against brute-force attacks on login, registration, and order creation.

---

## 🚀 7. Step-by-Step Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (Local instance or MongoDB Atlas)
- Expo CLI (`npm install -g expo-cli`)

### Step 1: Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Seed initial admin account and realistic village catalog
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

> **Default Seeded Admin Credentials:**
> - **Phone:** `9876543210`
> - **Password:** `admin1234`
> - *(Or run `npm run create-admin` for an interactive prompt)*

### Step 2: Admin Dashboard Setup
```bash
cd ../admin
npm install

# Start Vite development server
npm run dev
# Admin dashboard opens on http://localhost:5173
```

### Step 3: Customer Mobile App Setup
```bash
cd ../mobile
npm install

# Start Expo development server
npx expo start
# Press 'a' for Android emulator or scan QR with Expo Go on a real Android device
```

---

## 🧪 8. Automated Testing

Run the automated test suite in the backend directory:
```bash
cd backend
npm test
```
The suite verifies:
1. **Order & Free Delivery Rules:** Threshold calculations (₹499 free delivery, ₹20 standard fee).
2. **State Machine Transitions:** Prohibits invalid state jumps and protects terminal states.
3. **Excel Sanitization:** Verifies formula injection prevention and Unicode handling.

---

## 📦 9. Production Android Release (EAS Build)

To build a standalone production APK or Android App Bundle (AAB):

```bash
cd mobile

# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to your Expo account
eas login

# 3. Configure build profile
eas build:configure

# 4. Generate Android APK for direct testing
eas build -p android --profile preview

# 5. Generate production App Bundle for Google Play Store
eas build -p android --profile production
```

---

## 📄 License & Attribution
Built for **ShopEase - Apna Bazar**. Production-ready rural e-commerce codebase.
