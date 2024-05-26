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
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { addDoc, collection, doc, setDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db, authentication } from "./firebaseConfig";

export default function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [Fname, setFname] = useState("");
  const [Lname, setLname] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(true);
  const navigation = useNavigation();

  const handleRegisterPress = async () => {
    if (!email || !password || !confirmPassword || !mobile || !Fname || !Lname || !address || !username) {
      Alert.alert('Invalid Input', 'All fields are required.');
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Validate mobile number
    if (mobile.length !== 11 || !mobile.startsWith("09")) {
      Alert.alert('Invalid Mobile Number', 'Mobile number must start with "09" and be 11 digits long.');
      return;
    }

    // Check if password and confirm password match
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'Password and Confirm Password fields do not match.');
      return;
    }

    setLoading(true); // Show loading indicator during registration

    try {
      // Check if username already exists
      const usernameQuery = query(collection(db, "Users"), where("username", "==", username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        setLoading(false); // Hide loading indicator
        Alert.alert('Username Taken', 'The username is already taken. Please choose a different one.');
        return;
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(authentication, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore with document ID as user ID
      await setDoc(doc(db, 'Users', user.uid), { // Set document ID to user UID
        email,
        mobile,
        Fname,
        Lname,
        address,
        username, // Save username
        type:"Buyer",
        created_at: serverTimestamp()
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

  const handleCloseRules = () => {
    setRulesVisible(false);
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
                  <Text className="font-bold my-2">Username</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] h-12  "
                    placeholder="Choose a Username"
                    value={username}
                    onChangeText={(username) => setUsername(username)}
                  />
                </View>
                <View>
                  <TouchableOpacity className="bg-[#24255F]  rounded-full mt-8 h-12 flex justify-center" onPress={handleRegisterPress}>
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-white text-center ">Register</Text>
                    )}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={rulesVisible}
        onRequestClose={handleCloseRules}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg">
            <Text className="text-xl font-bold mb-4 mt-20">Registration Rules</Text>
            <ScrollView>
              <Text className="mb-4">
                Create and Secure Your Account: Provide accurate personal information, including a valid email address and phone number. Use a strong password.
              </Text>
              <Text className="mb-4">
                Keep Information Updated: Ensure your delivery address and contact details are current to avoid issues with order processing.
              </Text>
              <Text className="mb-4">
                Review Order Details: Double-check the items, quantities, and customizations before confirming your order to avoid mistakes.
              </Text>
              <Text className="mb-4">
                Inspect Upon Arrival: Check your order immediately upon arrival to ensure all items are correct and in good condition.
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={handleCloseRules}
              className="bg-[#24255F] rounded-full mt-4 h-12 flex justify-center"
            >
              <Text className="text-white text-center">I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
