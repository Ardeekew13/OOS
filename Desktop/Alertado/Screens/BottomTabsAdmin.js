import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminHomepage from './AdminHomepage';
import { NavigationContainer } from '@react-navigation/native';
import { Entypo,MaterialCommunityIcons,AntDesign,FontAwesome5,Octicons, Ionicons  } from '@expo/vector-icons'; 
import ViewReportsAdmin from './ViewReportsAdmin';
import ViewComplaintsAdmin from './ViewComplaintsAdmin';
import ViewSOSAdmin from './ViewSOSAdmin'
import AdminVerify from './AdminVerify';
import AdminCreateAccount from './AdminCreateAccount';
import ProfilePage from './ProfilePage';



const Tab = createBottomTabNavigator();
function BottomTabsAdmin(){
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
      tabBarLabelPosition: 'below-icon',
    }}
  >
    <Tab.Screen
      name="Home Page"
      component={AdminHomepage}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="home" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="View Reports"
      component={ViewReportsAdmin}
      options={{
        tabBarLabel: 'Reports',
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="file1" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="View Complaints Admin"
      component={ViewComplaintsAdmin}
      options={{
        tabBarLabel: 'Complaints',
        tabBarIcon: ({ color, size }) => (
          <Octicons name="report" size={22} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="View SOS Admin"
      component={ViewSOSAdmin}
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
      name="Verify Users"
      component={AdminVerify}
      options={{
        tabBarLabel: 'Verify',
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="addusergroup" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={AdminCreateAccount}
      options={{
        tabBarLabel: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="setting" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
  name="Profile Page"
  component={ProfilePage}
  options={{
    tabBarLabel: 'Profile Page',
    tabBarIcon: ({ color, size }) => (
      <FontAwesome5 name="user" size={20} color={color} />
    ),
  }}
/>
  </Tab.Navigator>  
  );
}
export default BottomTabsAdmin;