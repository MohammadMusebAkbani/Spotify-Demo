import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMerchant } from '../config/MerchantProvider';
import { useCart } from '../hooks';
import {
  CartScreen,
  OrdersScreen,
  ProductDetailScreen,
  ProductListScreen,
} from '../screens';
import { AppHeader } from './AppHeader';

const Tab = createBottomTabNavigator();
const ShopStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();

function ShopStackNavigator() {
  const { theme } = useMerchant();

  return (
    <ShopStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.card || '#FFFFFF' },
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700', color: theme.text },
        headerShadowVisible: false,
      }}
    >
      <ShopStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          header: () => <AppHeader title="Catalog" />,
        }}
      />
      <ShopStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.title || 'Product Details',
          headerBackTitle: 'Back',
        })}
      />
    </ShopStack.Navigator>
  );
}

function CartStackNavigator() {
  const { theme } = useMerchant();

  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.card || '#FFFFFF' },
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700', color: theme.text },
        headerShadowVisible: false,
      }}
    >
      <CartStack.Screen
        name="CartList"
        component={CartScreen}
        options={{
          header: () => <AppHeader title="Shopping Cart" />,
        }}
      />
      <CartStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.title || 'Product Details',
          headerBackTitle: 'Back',
        })}
      />
    </CartStack.Navigator>
  );
}

function OrdersStackNavigator() {
  const { theme } = useMerchant();

  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.card || '#FFFFFF' },
        headerTintColor: theme.primary,
        headerTitleStyle: { fontWeight: '700', color: theme.text },
        headerShadowVisible: false,
      }}
    >
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={{
          header: () => <AppHeader title="Your Orders" />,
        }}
      />
    </OrdersStack.Navigator>
  );
}

export const AppNavigator: React.FC = () => {
  const { theme } = useMerchant();
  const { totalQuantity } = useCart();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted || '#94A3B8',
          tabBarStyle: {
            backgroundColor: theme.card || '#FFFFFF',
            borderTopColor: theme.border || '#E2E8F0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Shop"
          component={ShopStackNavigator}
          options={{
            tabBarLabel: 'Shop',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'bag-handle' : 'bag-handle-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Cart"
          component={CartStackNavigator}
          options={{
            tabBarLabel: 'Cart',
            tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
            tabBarBadgeStyle: {
              backgroundColor: theme.accent || theme.primary,
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: '700',
            },
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'cart' : 'cart-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Orders"
          component={OrdersStackNavigator}
          options={{
            tabBarLabel: 'Orders',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

