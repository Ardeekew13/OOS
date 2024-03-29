import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

function Products() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const db = getFirestore();
      const productsCollectionRef = collection(db, 'Products');
      let q = query(
        productsCollectionRef,
        orderBy('product_Name'),
      );
  
      if (searchQuery) {
        const searchTerm = capitalizeFirstLetter(searchQuery.toLowerCase().trim());
        // Add where clause to filter products whose names start with the entered letter
        q = query(
          productsCollectionRef,
          orderBy('product_Name'),
          where('product_Name', '>=', searchTerm),
          where('product_Name', '<', searchTerm + '\uf8ff')
        );
      }
  
      try {
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    fetchProducts();
  }, [searchQuery]);
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
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
        <TextInput
          placeholder="Search Product"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ paddingHorizontal: 10, fontSize: 16 }}
        />
      </View>
    </View>
    <View className="bg-[#3F559D] h-14 w-52 mx-auto mb-5 mt-5 flex justify-center rounded-sm shadow">
      <Text className="text-center text-lg font-bold text-white tracking-tight">
        PRODUCTS
      </Text>
    </View>
    
    {searchQuery !== '' ? (
      <View className="flex flex-row mt-2 justify-center items-center gap-2 flex-wrap rounded-t ">
        {products.map((product) => (
          <TouchableOpacity 
          key={product.id} 
          onPress={() => navigation.navigate('ProductDetails', { product: product })}
        >
            <View>
              <Image
                className="w-full h-60 rounded-t-xl"
                source={{ uri: product.image }} 
                style={{ width: 165, height: 150 }}
              />
              <View className="bg-white h-10 rounded-b-xl flex justify-center">
                <Text className="text-center mt-1 font-semibold">{product.product_Name}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    ) : (
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
          <TouchableOpacity onPress={handleSquidPress}>
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
        <TouchableOpacity onPress={handleSeaPress}>
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
        )}
      </View>
    </SafeAreaView>
    </ScrollView>
  );
}

export default Products;
