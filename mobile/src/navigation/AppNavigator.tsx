import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Stack Screens
import { SplashScreen } from '../screens/SplashScreen';
import { LanguageSelectScreen } from '../screens/LanguageSelectScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { CustomerAuthScreen } from '../screens/CustomerAuthScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { AddressManageScreen } from '../screens/AddressManageScreen';
import { OrderConfirmationScreen } from '../screens/OrderConfirmationScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { HelpContactScreen } from '../screens/HelpContactScreen';
import { PolicyTermsScreen } from '../screens/PolicyTermsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="CustomerAuth" component={CustomerAuthScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="AddressManage" component={AddressManageScreen} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="HelpContact" component={HelpContactScreen} />
      <Stack.Screen name="PolicyTerms" component={PolicyTermsScreen} />
    </Stack.Navigator>
  );
};
