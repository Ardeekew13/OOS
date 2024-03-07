import React, { useState } from "react";
import {
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { signInWithEmailAndPassword, signOut, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { db, authentication } from "./firebaseConfig";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLoginPress = async () => {
    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(authentication, email, password);

      // Navigate to the Home screen upon successful login
      navigation.navigate("BottomTabs");
    } catch (error) {
      console.error("Error logging in:", error.message);
      // Handle the error appropriately (e.g., show an error message)
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate("Registration");
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
    </KeyboardAvoidingView>
  );
}
