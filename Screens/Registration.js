import React, { useState } from "react";
import { Text, Image, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';

export default function Registration() {
  const [username, setUsername] = useState("");
  const [Fname, setFname] = useState("");
  const [Lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();

  const handleRegisterPress = () => {
    navigation.navigate('Registration'); 
  };


  return (
    <ScrollView>
    <SafeAreaView className="flex">
      <View className="bg-[#FFFAFA] h-full flex ">
        <Image
          className="w-full h-60"
          source={require("./Images/Login2.png")}
        />
        <View className="px-3">
          <Text className="text-4xl font-bold text-[#8bcff1] mb-5">Registration</Text>
          <View>
          <Text className="font-bold my-2">First Name</Text>
          <TextInput
            className="border-2 px-2 py-1 rounded-[15px] mb-2 "
            placeholder="Enter your first name"
            value={password}
            onChangeText={(text) => setUsername(text)}
          />
          </View>
          <View>
          <Text className="font-bold my-2">Last Name</Text>
          <TextInput
            className="border-2 px-2 py-1 rounded-[15px] mb-2 "
            placeholder="Enter your Last name"
            value={password}
            onChangeText={(text) => setUsername(text)}
          />
          </View>
          <View>
            <Text className="font-bold my-2">Email</Text>
            <TextInput
              className="border-2 px-2 py-1 rounded-[15px] mb-2 "
              placeholder="Enter your Email Address"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
          <View>
          <Text className="font-bold my-2">Password</Text>
          <TextInput
            className="border-2 px-2 py-1 rounded-[15px] mb-2 "
            placeholder="Enter your Password"
            value={password}
            onChangeText={(text) => setUsername(text)}
          />
          </View>
          <View>
          <Text className="font-bold my-2">Confirm Password</Text>
          <TextInput
            className="border-2 px-2 py-1 rounded-[15px] "
            placeholder="Confirm Password"
            value={password}
            onChangeText={(text) => setUsername(text)}
          />
          </View>
          <View>
          <TouchableOpacity className="bg-[#24255F]  rounded-full mt-5 h-12 flex justify-center">
            <Text className="text-white text-center ">
              Register
            </Text>
          </TouchableOpacity>
          </View>
          <Text className=" my-2 text-center mt-2">
            Already have an account?
            <TouchableOpacity onPress={handleRegisterPress}>
            <Text className="font-bold underline"> Log in here</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
    </ScrollView>
  );
}
