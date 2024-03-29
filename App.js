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


const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
 
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Registration" component={Registration} />
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="FishProducts" component={FishProducts} />
      <Stack.Screen name="ShellProducts" component={ShellProducts} />
      <Stack.Screen name="SquidProducts" component={SquidProducts} />
      <Stack.Screen name="SeaProducts" component={SeaProducts} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>

    </NavigationContainer>
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
