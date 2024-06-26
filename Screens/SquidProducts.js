import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native'; // Import Dimensions
import { getDocs, collection, query, where } from 'firebase/firestore';
import app from './firebaseConfig';
import { getFirestore } from 'firebase/firestore';
import { getDownloadURL, ref, getStorage } from 'firebase/storage';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";

const db = getFirestore(app);
const storage = getStorage(app);

function SquidProducts({ category }) {
  const [squidData, setSquidData] = useState([]);
  const navigation = useNavigation();

  const windowWidth = Dimensions.get('window').width; // Get window width
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = collection(db, 'Products');
        const q = query(productsRef, where('Category', '==', 'Squid'));

        const snapshot = await getDocs(q);

        const data = [];
        for (const doc of snapshot.docs) {
          const product = doc.data();

          const storageRef = ref(storage, product.image);
          const imageURL = await getDownloadURL(storageRef);

          data.push({
            id: doc.id,
            ...product,
            image: imageURL,
          });
        }

        setSquidData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const navigateToProductDetails = (product) => {
    // Navigate to ProductDetails screen and pass the product data
    navigation.navigate('ProductDetails', { product });
  };
  return (
    <ScrollView>
      <SafeAreaView>
        <View className="bg-[#24255F] h-28">
          <View className="bg-[#ffffff] h-7 w-72 top-10 flex justify-center mx-auto rounded-[24px] pl-5">
            <Text className="">Search Product</Text>
          </View>
        </View>
        <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
          <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
            Squid & Octopus
          </Text>
        </View>
        <View className="flex flex-row justify-center items-center flex-wrap rounded-t">
          {squidData.length > 0 ? (
            squidData.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigateToProductDetails(item)}
                style={{ width: windowWidth / 2, paddingHorizontal: 8, marginBottom: 16 }} // Set width dynamically
              >
                <View key={item.id} className="p-2">
                  {item.image ? (
                    <Image
                      style={{ width: 165, height: 150 }}
                      source={{ uri: item.image }}
                      className="rounded-t-xl"
                    />
                  ) : (
                    <Text>No Image Available</Text>
                  )}

                  <View className="bg-white h-16 w-[165px] rounded-b-xl">
                    <Text className="text-center mt-1 font-semibold">{item.product_Name}</Text>
                    <Text className="ml-2 mt-1 font-extrabold">₱{item.Price}</Text>
                    <View className="left-16 bottom-4 flex flex-row px-4">
                      <Entypo name="star" size={12} color="yellow" />
                      <Text className="text-xs font-bold">{item.Sales}sold</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

export default SquidProducts;
