
import React, { useState,useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView,TouchableWithoutFeedback,Keyboard, Platform, Button,SafeAreaView, Alert} from 'react-native';
import { collection,query,where,doc, getDoc} from 'firebase/firestore';
import {signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db,authentication } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/core';
import RegistrationForm from './RegistrationForm';
import { ActivityIndicator } from 'react-native';


export default LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [role, setRole]=useState('');
  const navigation=useNavigation()

const handleLogin = async () => {
  setIsLoading(true);
  try{
      const userCredential = await signInWithEmailAndPassword(authentication, email, password);
      const userId = userCredential.user.uid;

      const usersRef = collection(db,'User');
      const userDoc = await getDoc(doc(usersRef,userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
      const userRole = userDoc.data().role;
      const userStatus = userDoc.data().status
        if (userRole === "Citizen") {
          navigation.navigate('BottomTabs');
          if (userStatus==='Unverified'){
            Alert.alert(
              'Account is not verified',
              'Please verify your account before proceeding.',
              [{text: 'Verify',
              onPress: ()=>{
                navigation.navigate('Citizen Verification');
              }
              }]
            )
          }
        } else if (userRole === 'Admin') {
          navigation.navigate('BottomTabsAdmin');
        } else if (userRole === 'Police') {
          navigation.navigate('BottomTabsPolice');
        }
        else if (userRole === 'Tourist Police') {
          navigation.navigate('BottomTabsTourist');
        }  else {
          setError('User not found');
        }
        
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error.code === 'auth/user-not-found') {
        setError('User not found');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Try again later');
      } else {
        setError('Incorrect email or password');
      }
      console.error(error);
    }
  };
const handleRegister = () => {
  navigation.navigate('RegistrationForm');
};

  const validateInputs = () => {
    // Check that email is valid
    const emailRegex = /^\S+@\S+\.\S+$/;
    const isEmailValid = emailRegex.test(email);
    if (!isEmailValid) {
      setError('Invalid email format');
    } else {
      setError(null);
    }
  };
  return (
    
      <KeyboardAvoidingView behavio={Platform.OS==='ios'? 'padding':'null'} className="flex-1">
       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
         <View className="flex-1 justify-center bg-white">
         <Text className="font-bold ml-8 text-m">Welcome
         </Text>
         <Text className="ml-8 mt-1">Sign in to continue!</Text>
     <Image
        className="w-72 h-32 mb-3 items-center justify-center mx-auto"
        source={require('./images/alertado.jpg')}
      />
        <Text className="ml-5 mb-2 text-sm">Email</Text>
        <TextInput
        className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
          placeholder="Enter your Email"
          onChangeText={(email)=>{setEmail(email)}}
          onBlur={validateInputs}
        />
        <Text className="ml-5 mb-2 text-sm">Password</Text>
        <TextInput
        className="w-11/12 px-4 py-3 rounded-lg  border-2 border-[#E0E0E0] mx-auto mb-2"
          placeholder="Enter your Password"
          onChangeText={(password)=>{setPassword(password)}}
          secureTextEntry={true}
          onBlur={validateInputs}
        />
        {error? <Text className="color-red-500 mx-auto mb-5 mt-2">{error}</Text>:null}
        <TouchableOpacity
          className="w-11/12 mt-4 px-4 py-3 rounded-lg bg-[#E31A1A] items-center mx-auto"
          onPress={handleLogin}
          disabled={isLoading}
        >
        {isLoading ? (
          <ActivityIndicator size="large"  color="#FFFFFF" />
        ) : (
          <Text className="text-white text-lg font-medium mx-auto">Login</Text>
        )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegister}>
        <Text className="items-center justify-center mx-auto mt-5 text-xl text-[#626161]">Don't have an account? <Text className="text-[#E02424] underline">Sign up</Text></Text>
      </TouchableOpacity>
      
     
      
           </View>
         </TouchableWithoutFeedback>
       </KeyboardAvoidingView>
  );
};