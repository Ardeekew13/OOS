import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker'; 
import { useNavigation } from '@react-navigation/native';


const AdminVerify = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'Citizen', 'Police', 'Tourist Police', 'Pending'
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return {
          marginTop:10,
          backgroundColor: '#FFA500',
          color: 'white',
          borderRadius: 30,
          fontWeight: 'bold',
          padding: 10, // Add padding to control the width
        };
      case 'Ongoing':
        return {
          backgroundColor: '#08BAE1',
          color: 'white',
          borderRadius: 10,
          fontWeight: 'bold',
          padding: 10, // Add padding to control the width
        };
      case 'Verified':
        return {
          backgroundColor: 'green',
          color: 'white',
          borderRadius: 30,
          fontWeight: 'bold',
          padding: 10, // Add padding to control the width
        };
      case 'Rejected':
        return {
          backgroundColor: 'purple',
          color: 'white',
          borderRadius: 10,
          fontWeight: 'bold',
          padding: 10, // Add padding to control the width
        };
      case 'Unverified':
        return {
          marginTop:10,
          backgroundColor: 'red',
          color: 'white',
          borderRadius: 10,
          fontWeight: 'bold',
          padding: 10, // Add padding to control the width
        };
      default:
        return {
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 10,
          fontWeight: 'bold',
          padding: 10, // Add padding to control the width
        };
    }
  };
  useEffect(() => {
    const db = getFirestore();
    const usersCollection = collection(db, 'User');
    let userFilter = [];

    if (filter === 'all') {
      // Fetch all users, excluding the "admin" role
      userFilter = where('role', '!=', 'Admin');
    } else if (filter === 'Pending') {
      // Fetch users with 'Pending' status, excluding the "admin" role
      userFilter = where('status', '==', 'Pending', 'role', '!=', 'Admin');
    } else {
      // Fetch users based on their roles, excluding the "admin" role
      userFilter = where('role', '==', filter, 'role', '!=', 'Admin');
    }

    const unsubscribe = onSnapshot(query(usersCollection, userFilter), (querySnapshot) => {
      const users = [];

      querySnapshot.forEach((documentSnapshot) => {
        const user = documentSnapshot.data();
        user.id = documentSnapshot.id;
        users.push(user);
      });

      setUsers(users);
    });

    return () => unsubscribe();
  }, [filter]);

  const handleClick = (user) => {
    // Navigate to UserProfile and pass the user data as params
    navigation.navigate('User Profile', { user });
  };

  return (
    <SafeAreaView style={{ flex: 1}}>
      <ScrollView>
        <View>
          <Picker
            selectedValue={filter}
            onValueChange={(itemValue) => setFilter(itemValue)}>
            <Picker.Item label="Show All Users" value="all" />
            <Picker.Item label="Show Citizens" value="Citizen" />
            <Picker.Item label="Show Police" value="Police" />
            <Picker.Item label="Show Tourist Police" value="Tourist Police" />
            <Picker.Item label="Show Pending" value="Pending" />
          </Picker>
          {users.map((user) => (
            <View key={user.id} style={{ flex: 1, backgroundColor: 'white', margin: 10, borderRadius: 10 }}>
              <TouchableOpacity onPress={() => handleClick(user)}>
                <ImageBackground style={{ height: 120, margin: 10 }}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                    <Image style={{ width: 80, height: 80, margin: 10, borderRadius: 40 }} source={{ uri: user.selfiePicture }} />
                    <View style={{ flex: 1, flexDirection: 'column',marginTop:15 }}>
                      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{user.Lname}, {user.Fname}</Text>
                      <Text style={{fontStyle:'italic'}}>{user.role}</Text>
                      <Text style={{marginTop:15}}>Account Status: <Text style={[getStatusStyle(user.status), styles.statusText]}>{user.status}</Text></Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  // ... your existing styles ...

  statusText: {
    margin:50, // Add padding as needed
   
    paddingHorizontal:40,
    width:50,
    height:20,
  },
});
export default AdminVerify;
