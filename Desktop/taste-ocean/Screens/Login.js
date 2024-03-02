import React, { useState } from "react";
import { Text, Image, View, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleRegisterPress = () => {
    navigation.navigate('Registration'); 
  };


  return (
    <SafeAreaView className="flex">
      <View className="bg-[#FFFAFA] h-full flex ">
        <Image
          className="w-full h-60"
          source={require("./Images/Login2.png")}
        />
        <View className="px-3">
          <Text className="text-4xl font-bold text-[#8bcff1] mb-5">Login</Text>
          <View>
            <Text className="font-bold my-2">Email</Text>
            <TextInput
              className="border-2 px-2 py-1 rounded-[15px] mb-2 "
              placeholder="Enter your Email"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
          <View>
          <Text className="font-bold my-2">Password</Text>
          <TextInput
            className="border-2 px-2 py-1 rounded-[15px] "
            placeholder="Enter your Password"
            value={password}
            onChangeText={(text) => setUsername(text)}
          />
          </View>
          <View>
          <TouchableOpacity className="bg-[#24255F]  rounded-full mt-5 h-12 flex justify-center">
            <Text className="text-white text-center ">
              Login
            </Text>
          </TouchableOpacity>
          </View>
          <Text className=" my-2 text-center mt-2">
            Don’t have an account?
            <TouchableOpacity onPress={handleRegisterPress}>
            <Text className="font-bold underline"> Register here</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
