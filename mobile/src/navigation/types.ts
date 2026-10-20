export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Onboarding: undefined;
  CustomerAuth: undefined;
  MainTabs: { screen?: keyof MainTabParamList };
  ProductList: { categoryId?: string; categoryTitle?: string; searchQuery?: string };
  ProductDetail: { productId: string; productTitle?: string };
  Checkout: undefined;
  AddressManage: { returnToCheckout?: boolean };
  OrderConfirmation: { orderId: string; orderNumber: string; totalAmount: number; village: string };
  OrderDetail: { orderId: string };
  Notifications: undefined;
  HelpContact: undefined;
  PolicyTerms: { type?: 'privacy' | 'terms' | 'delete' };
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};
