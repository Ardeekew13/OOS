import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from './HomePage';
import SubPage from './ReportCrime'
import ProfilePage from './ProfilePage';
import { Entypo,MaterialCommunityIcons,AntDesign,FontAwesome5,Octicons  } from '@expo/vector-icons'; 
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons';
import FileComplaint from './FileComplaint';
import ReportCrime from './ReportCrime';
import AdminVerify from './AdminVerify';
import { createStackNavigator } from '@react-navigation/stack';
import ViewReports from './ViewReports';
import SOS from './SOS';
import ViewComplaints  from './ViewComplaints';



const Tab = createBottomTabNavigator();
function BottomTabs(){
  return (
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FE0000',
          },
          headerTitleStyle: {
            color: '#fff',
          },
          headerTitleAlign: 'center',
          tabBarLabelStyle: {
            color: '#fff',
          },
          tabBarActiveTintColor: '#FF0000',
        }}
      >
  <Tab.Screen
  name="Dashboard"
  component={HomePage}
  options={{
    tabBarLabel: 'Dashboard',
    tabBarIcon: ({ color, size }) => (
      <MaterialCommunityIcons
        name="view-dashboard-outline"
        size={25}
        color={color}
      />
    ),
  }}
/>
<Tab.Screen
  name="View Reports"
  component={ViewReports}
  options={{
    tabBarLabel: 'Reports',
    tabBarIcon: ({ color, size }) => (
      <AntDesign name="file1" size={22} color={color} />
    ),
  }}
/>




<Tab.Screen
  name="View Complaints"
  component={ViewComplaints}
  options={{
    tabBarLabel: 'ViewComplaints',
    tabBarIcon: ({ color, size }) => (
      <Octicons name="report" size={22} color={color} />
    ),
  }}
/>
<Tab.Screen
name="Send SOS"
component={SOS}
options={{
  tabBarLabel: 'SOS',
  tabBarIcon: ({ color, size }) => (
    <Ionicons
        name="notifications-outline"
        size={27}
        color={color}
      />
  ),
}}
/>
<Tab.Screen
  name="Profile Page"
  component={ProfilePage}
  options={{
    tabBarLabel: 'Profile Page',
    tabBarIcon: ({ color, size }) => (
      <FontAwesome5 name="user" size={23} color={color} />
    ),
  }}
/>
     </Tab.Navigator>
  );
}
export default BottomTabs;