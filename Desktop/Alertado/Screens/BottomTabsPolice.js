import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PoliceHomepage from './PoliceHomepage';
import SubPage from './ReportCrime'
import ProfilePagePolice from './ProfilePagePolice';
import { Entypo,MaterialCommunityIcons,AntDesign,FontAwesome5,Octicons  } from '@expo/vector-icons'; 
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; 
import { FontAwesome } from '@expo/vector-icons';
import FileComplaint from './ViewComplaints';
import ReportCrime from './ReportCrime';
import AdminVerify from './AdminVerify';
import { createStackNavigator } from '@react-navigation/stack';
import ViewReportsPolice from './ViewReportsPolice';
import ViewComplaintsPolice from './ViewComplaintsPolice';
import ViewSOSPolice from './ViewSOSPolice'



const Tab = createBottomTabNavigator();
function BottomTabsPolice(){
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
  component={PoliceHomepage}
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
  component={ViewReportsPolice}
  options={{
    tabBarLabel: 'Reports',
    tabBarIcon: ({ color, size }) => (
      <AntDesign name="file1" size={22} color={color} />
    ),
  }}
/>
<Tab.Screen
  name="View Complaints Police"
  component={ViewComplaintsPolice}
  options={{
    tabBarLabel: 'Complaints',
    tabBarIcon: ({ color, size }) => (
      <Octicons name="report" size={22} color={color} />
    ),
  }}
/>
<Tab.Screen
  name="View SOS Police"
  component={ViewSOSPolice}
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
  name="Profile Page Police"
  component={ProfilePagePolice}
  options={{
    tabBarLabel: 'Profile Page Police',
    tabBarIcon: ({ color, size }) => (
      <FontAwesome5 name="user" size={23} color={color} />
    ),
  }}
/>


     </Tab.Navigator>
  );
}
export default BottomTabsPolice;