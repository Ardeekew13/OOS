// BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import Home from './Home';
import Products from './Products';
import Carts from './Carts';
import Profile from './Profile';
import Orders from './Orders';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBarOptions={{
        activeTintColor: '#D13E27',
        inactiveTintColor: 'black',
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={Products}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="shopping-bag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Carts"
        component={Carts}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={Orders}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list-alt" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabs;
