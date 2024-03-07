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
import { db,authentication,storage} from './firebaseConfig';
import {createUserWithEmailAndPassword,getAuth } from 'firebase/auth';

export default function Registration() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation=useNavigation()
  const auth=getAuth();
  const handleRegisterPress = async () => {
    try {
      // Create a user with email and password
      await createUserWithEmailAndPassword(auth, email, password);

      console.log('Succesful')
    } catch (error) {
      console.error("Error registering user:", error.message);
      // Handle the error appropriately (e.g., show an error message)
    }
  };

  const handleLogInPress = () => {
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView>
          <SafeAreaView className="flex">
            <View className="bg-[#FFFAFA] h-screen flex ">
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
                    placeholder="Enter your Last name"
                    value={lname}
                    onChangeText={(lname) => setLname(lname)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Email</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your Email Address"
                    value={email}
                    onChangeText={(email) => setEmail(email)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Password</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] mb-2 h-12 "
                    placeholder="Enter your Password"
                    value={password}
                    onChangeText={(password) => setPassword(password)}
                  />
                </View>
                <View>
                  <Text className="font-bold my-2">Confirm Password</Text>
                  <TextInput
                    className="border-2 px-2 py-1 rounded-[15px] h-12 "
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(confirmPassword) =>
                      setConfirmPassword(confirmPassword)
                    }
                  />
                </View>
                <View>
                  <TouchableOpacity className="bg-[#24255F]  rounded-full mt-5 h-12 flex justify-center" onPress={handleRegisterPress}>
                    <Text className="text-white text-center ">Register</Text>
                  </TouchableOpacity>
                </View>
                <Text className=" my-2 text-center mt-2">
                  Already have an account?
                  <TouchableOpacity onPress={handleLogInPress}>
                    <Text className="font-bold underline"> Log in here</Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
