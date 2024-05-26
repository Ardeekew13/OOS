import React, { useState, useEffect } from "react";
import {
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db } from "./firebaseConfig";
import { useDispatch } from 'react-redux';
import { setUser } from './authActions';
import { collection, doc, getDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { authentication } from './firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const navigation = useNavigation();
  const dispatch = useDispatch(); 
  const authentication = getAuth();

  const handleLoginPress = async () => {
    setLoading(true); // Set loading state to true during login process
    try {
      // Check for empty email and password fields
      if (!email || !password) {
        Alert.alert('Invalid Input', 'Email and password cannot be empty.');
        return;
      }
      
      // Sign in with email and password
      const userCredentials = await signInWithEmailAndPassword(
        authentication,
        email,
        password
      );
  
      const userId = userCredentials.user.uid; // Get the UID of the authenticated user
  
      // Construct a reference to the user document in Firestore using the UID
      const userDocRef = doc(db, 'Users', userId);
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        // User document exists, retrieve its data
        const userData = userDocSnapshot.data();
        const userType = userData.type;
        
        // Dispatch user data to Redux
        dispatch(setUser(userCredentials.user));
        
        // Navigate based on user type
        if (userType === 'Buyer') {
          navigation.navigate('BottomTabs'); // Navigate to Buyer bottom tabs
        } else if (userType === 'Seller') {
          navigation.navigate('SellerBottomTabs'); // Navigate to Seller bottom tabs
        } else {
          // Handle other user types or scenarios
        }
      } else {
        console.log("User document not found");
        Alert.alert('Login Error', 'User document not found.');
        // Handle scenario where user document doesn't exist
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      // Handle the error appropriately (e.g., show an error message)
      let errorMessage = "Invalid Email or Password";
      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please check your email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      }
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false); // Set loading state back to false after login attempt
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate("Registration");
  };

  const handleCloseWelcome = () => {
    setWelcomeVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex">
          <View className="bg-[#FFFAFA] h-full flex ">
            <Image
              className="w-full h-64"
              source={require("./Images/Login2.png")}
            />
            <View className="px-3 mt-5">
              <Text className="text-4xl font-bold text-[#8bcff1] mb-5">
                Login
              </Text>
              <View>
                <Text className="font-bold my-2">Email</Text>
                <TextInput
                  className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                  placeholder="Enter your Email"
                  value={email}
                  onChangeText={(email) => setEmail(email)}
                />
              </View>
              <View>
                <Text className="font-bold my-2">Password</Text>
                <TextInput
                  secureTextEntry={true}
                  className="border-2 px-2 py-1 rounded-[15px] h-12  "
                  placeholder="Enter your Password"
                  value={password}
                  onChangeText={(password) => setPassword(password)}
                />
              </View>
              <View>
                <TouchableOpacity className="bg-[#24255F]  rounded-full mt-8 h-12 flex justify-center" onPress={handleLoginPress}>
                  <Text className="text-white text-center ">Login</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-center mt-4">
                <Text className=" text-center ">Don’t have an account?</Text>
                <TouchableOpacity onPress={handleRegisterPress}>
                  <Text className="font-bold underline  "> Register here</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
      {loading && (
        <View className="absolute w-full h-full flex justify-center items-center bg-black opacity-25">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={welcomeVisible}
        onRequestClose={handleCloseWelcome}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg">
            <Text className="text-xl font-bold mb-4">Welcome</Text>
            <Text className="mb-4">
              A Taste Of The Ocean is a digital platform that enables customers
              to conveniently purchase seafood products through the internet.
              The system offers a user-friendly interface where customers can
              browse a wide variety of fresh seafood options, such as fish,
              shrimps, crabs, seaweeds, and shells. Users can select their
              desired products, specify quantities, and add them to their
              virtual shopping cart.
            </Text>
            <TouchableOpacity onPress={handleCloseWelcome}>
              <Text className="text-blue-500 text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
