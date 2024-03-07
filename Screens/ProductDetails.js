import React from "react";
import { View, Text, Image, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";

function ProductDetails({ route }) {
  const { product } = route.params;
  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView>
      <View className="mx-auto flex justify-content items-center z-10">
        <Image
          style={{ width: screenWidth, height: 250 }}
          source={{ uri: product.image }}
        />
      </View>
     
     <View className="ml-4">
          <Text className="text-3xl font-extrabold mt-2">
            {product.product_Name}
          </Text>

            <View className="flex flex-row items-center mt-2">
            <Text className="font-light">Price: </Text>
            <Text className="font-bold text-lg">₱{product.Price}</Text>
            </View>
      
       
     
     
     
      <View className="">
      <Text>Stock Available: {product.qty}</Text>
      <Text className="mt-4 font-bold">Description:</Text>
      <Text className="font-light mt-2">{product.Description}</Text>
      </View>
      </View>
      
      <TouchableOpacity className="bg-[#3F559D] h-14 w-11/12 top-48 mx-auto rounded-lg justify-center">
      <Text className="text-center text-white">Add to Cart</Text>
      </TouchableOpacity>
    
    </SafeAreaView>
  );
}

export default ProductDetails;
