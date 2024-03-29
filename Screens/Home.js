import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import app from "./firebaseConfig"; // Adjust the path to your firebaseConfig file
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, ref, getStorage } from "firebase/storage"; // Make sure to use correct import statement
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Ionicons";

const db = getFirestore(app);
const storage = getStorage(app);
function Home() {
  const [productData, setProductData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = collection(db, "Products");
        const snapshot = await getDocs(productsRef);
  
        const data = [];
        for (const doc of snapshot.docs) {
          const product = doc.data();
  
          // Fetch the download URL for the image using the correct storage object
          const storageRef = ref(storage, product.image);
          const imageURL = await getDownloadURL(storageRef);
  
          data.push({
            id: doc.id,
            ...product,
            image: imageURL,
          });
        }
  
        // Sort products by Sales in descending order
        const sortedData = data.sort((a, b) => b.Sales - a.Sales);
  
        // Take only the top 3 products
        const top3Products = sortedData.slice(0, 3);
  
        setProductData(top3Products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <ScrollView>
    <SafeAreaView>
      <View>
        <View className="bg-[#24255F] h-28">
         
        </View>
        <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
          <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
            BEST SELLER
          </Text>
        </View>
        <View className="flex flex-row justify-center items-center  gap-2 flex-wrap rounded-t ">
          {productData.length > 0 ? (
            productData.map((item) => (
              <View key={item.id}>
                {item.image ? (
                  <Image
                    style={{ width: 165, height: 150 }}
                    source={{ uri: item.image }}
                    className="rounded-t-xl"
                  />
                ) : (
                  <Text>No Image Available</Text>
                )}

                <View className="bg-white h-16 rounded-b-xl">
                  <Text className="text-center mt-1 font-semibold">{item.product_Name}</Text>

                  <Text className="ml-2 mt-1 font-extrabold">₱{item.Price}</Text>
                  <View className="left-24 bottom-4 flex flex-row px-4">
                    <Entypo name="star" size={12} color="yellow" />
                    <Text className=" text-[8px] font-bold">{item.Sales}sold</Text>
                  </View>
                </View>
              </View>
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
