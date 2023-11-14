import { useNavigation } from '@react-navigation/core';
import React from 'react'
import { View, Text, Image, Button, TouchableOpacity,TextInput, Alert, Modal, ScrollView} from 'react-native';
import { getAuth, signOut, onAuthStateChanged  } from '@firebase/auth';


const auth = getAuth();
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

const AdminCreateAccount =()=>{
const navigation=useNavigation();
const handleRegister = () => {
    navigation.navigate('AdminRegisterPolice');
};
const Signout =()=>{
  const auth = getAuth();
  signOut(auth).then(() => {
    navigation.navigate('LoginForm');
  }).catch((error) => {
    // An error happened.
  });
  }
  return (
    <ScrollView>
        <View className="mt-2">
          <View className="bg-[#D01010] m-2 rounded-md">
            <TouchableOpacity onPress={handleRegister}>
                <Text className="text-xl font-bold mx-auto p-4 text-white">Register Account</Text>
            </TouchableOpacity>
          </View>
        
          <View className=" bg-[#D01010] m-2 rounded-md">
          <TouchableOpacity className="" onPress={Signout}>
            <Text className="text-xl font-bold mx-auto p-4 text-white">Log Out</Text>
            </TouchableOpacity>
          </View>
          
        </View>
    </ScrollView>
    
  )
}
  export default AdminCreateAccount;