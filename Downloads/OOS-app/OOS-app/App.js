import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Screens/Login'
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Registration from './Screens/Registration';
import Home from './Screens/Home';
import BottomTabs from './Screens/BottomTabs';
import FishProducts from './Screens/FishProducts';
import ShellProducts from './Screens/ShellProducts';
import SquidProducts from './Screens/SquidProducts';
import SeaProducts from './Screens/SeaProducts';
import ProductDetails from './Screens/ProductDetails';
import Carts from './Screens/Carts';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import store from './Screens/store';
import authReducer from './Screens/authReducer';
import Checkout from './Screens/Checkout';
import SellerBottomTabs from './Screens/SellerBottomTabs';
import ProductListing from './Screens/ProductListing';
import Orderlist from './Screens/Orderlist';
import EditProduct from './Screens/EditProduct';
import AddProduct from './Screens/AddProduct';
import OrderDetails from './Screens/OrderDetails';
const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <Provider store={store}>
    <NavigationContainer>
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Registration" component={Registration} />
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="SellerBottomTabs" component={SellerBottomTabs} />
      <Stack.Screen name="Products" component={ProductListing} />
      <Stack.Screen name="Orders" component={Orderlist} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="Add Product" component={AddProduct} />
      <Stack.Screen name="EditProduct" component={EditProduct} />
      <Stack.Screen name="FishProducts" component={FishProducts} />
      <Stack.Screen name="ShellProducts" component={ShellProducts} />
      <Stack.Screen name="SquidProducts" component={SquidProducts} />
      <Stack.Screen name="SeaProducts" component={SeaProducts} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Checkout" component={Checkout} />
      <Stack.Screen name="Carts" component={Carts} />
    </Stack.Navigator>
    </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
