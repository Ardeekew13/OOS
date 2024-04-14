import React, { useState } from "react";
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
  Alert,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [Fname, setFname] = useState("");
  const [Lname, setLname] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegisterPress = async () => {
    if (!email || !password || !confirmPassword || !mobile || !Fname || !Lname || !address) {
      Alert.alert('Invalid Input', 'All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (mobile.length !== 11 || !mobile.startsWith("09")) {
      Alert.alert('Invalid Mobile Number', 'Mobile number must start with "09" and be 11 digits long.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'Password and Confirm Password fields do not match.');
      return;
    }

    setLoading(true); // Show loading indicator during registration

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await addDoc(collection(db, 'Users'), {
        email,
        mobile,
        Fname,
        Lname,
        address,
        type:"Buyer",
        created_at: new Date().toISOString()
      });

      setLoading(false); // Hide loading indicator
      Alert.alert('Registration Successful', 'You have successfully registered.');
      navigation.navigate('Login'); // Navigate to the login screen
    } catch (error) {
      setLoading(false); // Hide loading indicator
      Alert.alert('Registration Error', error.message);
    }
  };

  const validateEmail = (email) => {
    // Email validation regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex">
          <ScrollView>
            <View className="bg-[#FFFAFA] h-full flex ">
              <Image
                className="w-full h-64"
                source={require("./Images/Login2.png")}
              />
              <View className="px-3 mt-5">
                <Text className="text-4xl font-bold text-[#8bcff1] mb-5">
                  Register
                </Text>
                <View>
                  <Text className="font-bold my-2">First Name</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your First Name"
                    value={Fname}
                    onChangeText={(Fname) => setFname(Fname)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Last Name</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your Last Name"
                    value={Lname}
                    onChangeText={(Lname) => setLname(Lname)}
                  />
                </View>
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
                  <Text className="font-bold my-2">Confirm Password</Text>
                  <TextInput
                    secureTextEntry={true}
                    className="border-2 px-2 py-1 rounded-[15px] h-12  "
                    placeholder="Confirm your Password"
                    value={confirmPassword}
                    onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Mobile Number</Text>
                  <TextInput
                    keyboardType="numeric"
                    className="border-2 px-2 py-1 rounded-[15px] h-12  "
                    placeholder="Enter your Mobile Number"
                    value={mobile}
                    onChangeText={(mobile) => setMobile(mobile)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Address</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] h-12  "
                    placeholder="Enter your Address"
                    value={address}
                    onChangeText={(address) => setAddress(address)}
                  />
                </View>
                <View>
                  <TouchableOpacity className="bg-[#24255F]  rounded-full mt-8 h-12 flex justify-center" onPress={handleRegisterPress}>
                    <Text className="text-white text-center ">Register</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-center mt-4">
                  <Text className=" text-center ">Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text className="font-bold underline  "> Login here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
