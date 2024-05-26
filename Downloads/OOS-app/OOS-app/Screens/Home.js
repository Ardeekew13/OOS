import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import app from "./firebaseConfig"; // Adjust the path to your firebaseConfig file
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage"; // Make sure to use correct import statement
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const db = getFirestore(app);
const storage = getStorage(app);

function Home() {
  const [productData, setProductData] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = collection(db, "Products");
        const snapshot = await getDocs(productsRef);

        const data = [];
        for (const doc of snapshot.docs) {
          const product = doc.data();
          const imageURL = product.image;

          data.push({
            id: doc.id,
            ...product,
            image: imageURL,
          });
        }

        const sortedData = data.sort((a, b) => b.Sales - a.Sales);
        const top3Products = sortedData.slice(0, 3);

        setProductData(top3Products);

        // Log the fetched top sales products
        console.log("Top Sales Products:", top3Products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const navigateToProductDetails = (product) => {
    navigation.navigate("ProductDetails", { product });
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View>
          <View className="bg-[#24255F] h-28"></View>
          <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
            <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">BEST SELLER</Text>
          </View>
          <View className="flex flex-row justify-center items-center  gap-2 flex-wrap rounded-t ">
            {productData.length > 0 ? (
              productData.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => navigateToProductDetails(item)}>
                  <View key={item.id}>
                    {item.image ? (
                      <Image style={{ width: 165, height: 150 }} source={{ uri: item.image }} className="rounded-t-xl" />
                    ) : (
                      <Text>No Image Available</Text>
                    )}

                    <View className="bg-white h-16 rounded-b-xl">
                      <Text className="text-center mt-1 font-semibold">{item.product_Name}</Text>
                      <Text className="ml-2 mt-1 font-extrabold">₱{item.Price}</Text>
                      <View className="left-24 bottom-4 flex flex-row px-4">
                        {/*<Entypo name="star" size={12} color="yellow" />
                        <Text className=" text-[12px] font-bold">{item.Sales}sold</Text>*/}
                        <Text className=" text-[12px] font-bold">{item.qty>0 ? 'Available' : 'Sold out'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

export default Home;
