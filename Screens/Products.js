import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, ScrollView,TouchableOpacity } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import app from "./firebaseConfig"; // Adjust the path to your firebaseConfig file
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage"; // Make sure to use correct import statement
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";



function Products() {

  const navigation = useNavigation();
  
const handleFishPress = () => {
  navigation.navigate("FishProducts");
};
const handleShellPress = () => {
  navigation.navigate("ShellProducts");
};
const handleSquidPress = () => {
  navigation.navigate("SquidProducts");
};
const handleSeaPress = () => {
  navigation.navigate("SeaProducts");
};




  return (
    <ScrollView>
    <SafeAreaView>
      <View>
        <View className="bg-[#24255F] h-28">
          <View className="bg-[#ffffff] h-7 w-72 top-10 flex justify-center mx-auto rounded-[24px] pl-5">
            <Text className="">Search Product</Text>
          </View>
        </View>
        <View className="bg-[#3F559D] h-14 w-52 mx-auto mb-5 mt-5 flex justify-center rounded-sm shadow">
          <Text className="text-center text-lg font-bold text-white tracking-tight">
            PRODUCTS
          </Text>
        </View>
        <View className="flex flex-row mt-2 justify-center items-center  gap-2 flex-wrap rounded-t ">
        <TouchableOpacity onPress={handleFishPress}>
          <View>
            <Image
              className="w-full h-60 rounded-t-xl"
              source={require("./Images/fish.jpg")}
              style={{ width: 165, height: 150 }}
            />
            <View className="bg-white h-10 rounded-b-xl flex justify-center">
              <Text className="text-center mt-1 font-semibold">Fish</Text>
            </View>
          </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShellPress}>
          <View>
            <Image
              className="w-full h-60 rounded-t-xl"
              source={require("./Images/shellfish2.jpg")}
              style={{ width: 165, height: 150 }}
            />
            <View className="bg-white h-10 rounded-b-xl  flex justify-center">
              <Text className="text-center mt-1 font-semibold">Shellfish</Text>
            </View>
          </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShellPress}>
          <View>
          <Image
            className="w-full h-60 rounded-t-xl"
            source={require("./Images/squid.jpg")}
            style={{ width: 165, height: 150 }}
          />
          <View className="bg-white h-10 rounded-b-xl flex justify-center">
            <Text className="text-center mt-1 font-semibold">Squid & Octopus</Text>
          </View>
        </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShellPress}>
        <View>
        <Image
          className="w-full h-60 rounded-t-xl"
          source={require("./Images/seaweeds.jpg")}
          style={{ width: 165, height: 150 }}
        />
        <View className="bg-white h-10 rounded-b-xl flex justify-center">
          <Text className="text-center mt-1 font-semibold">Seaweeds</Text>
        </View>
      </View>
      </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </ScrollView>
  );
}

export default Products;
