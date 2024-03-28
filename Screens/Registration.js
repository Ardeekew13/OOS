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
  Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebaseConfig';

export default function Registration() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const navigation = useNavigation();
  const auth = getAuth();

  const handleRegisterPress = async () => {
    try {
      if (password !== confirmPassword) {
        console.error("Passwords do not match");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user information to Firestore
      await setDoc(doc(db, "Users", user.uid), {
        Fname: fname,
        Lname: lname,
        email: email,
        mobile: mobile,
        created_at: serverTimestamp(),
        type:"buyer"
      });

      console.log('Registration successful');
    } catch (error) {
      console.error("Error registering user:", error.message);
    }
  };

  const handleLogInPress = () => {
    navigation.navigate("Login");
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerClassName="flex-grow">
          <SafeAreaView className="flex-1 bg-[#FFFAFA]">
            <View className="flex-1">
              <Image
                className="w-full h-60"
                source={require("./Images/Login2.png")}
              />
              <View className="px-3">
                <Text className="text-4xl font-bold text-[#8bcff1] mb-5">
                  Registration
                </Text>
                <View>
                  <Text className="font-bold my-2">First Name</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your first name"
                    value={fname}
                    onChangeText={(fname) => setFname(fname)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Last Name</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your last name"
                    value={lname}
                    onChangeText={(lname) => setLname(lname)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Email</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={(email) => setEmail(email)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Mobile Number</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChangeText={(mobile) => setMobile(mobile)}
                    keyboardType="phone-pad"
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Password</Text>
                  <TextInput
                    secureTextEntry
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(password) => setPassword(password)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Confirm Password</Text>
                  <TextInput
                    secureTextEntry
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
                  />
                </View>
                <View>
                  <TouchableOpacity className="bg-[#24255F] rounded-full mt-5 h-12 flex justify-center" onPress={handleRegisterPress}>
                    <Text className="text-white text-center ">Register</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-center mb-20 mt-5">
                  <Text className="text-center flex">
                    Already have an account? </Text>
                  <TouchableOpacity onPress={handleLogInPress}>
                    <Text className="font-bold underline">Log in here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
