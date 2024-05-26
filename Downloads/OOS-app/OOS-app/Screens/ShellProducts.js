import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from './firebaseConfig';
import Entypo from '@expo/vector-icons/Entypo';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'Products'), where('Category', '==', 'Shellfish'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);


  const navigateToProductDetails = (product) => {
    // Navigate to product details screen with the selected item
    navigation.navigate('ProductDetails', { product});
  };

  return (
    <ScrollView>
      <SafeAreaView>
        <View className="bg-[#24255F] h-28">
         
        </View>
        <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
          <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
            Shellfish
          </Text>
        </View>
        <View className="flex flex-row justify-center items-center flex-wrap rounded-t">
          {products.length > 0 ? (
            products.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigateToProductDetails(item)}
                style={{ width: '50%' }}
              >
                <View className="p-2">
                  {item.image ? (
                    <Image
                      style={{ width: '100%', height: 150 }}
                      source={{ uri: item.image }}
                      className="rounded-t-xl"
                    />
                  ) : (
                    <Text>No Image Available</Text>
                  )}

                  <View className="bg-white h-16 rounded-b-xl">
                    <Text className="text-center mt-1 font-semibold">{item.product_Name}</Text>
                    <Text className="ml-2 mt-1 font-extrabold">₱{item.Price}</Text>
                    <View className="left-16 bottom-4 flex flex-row px-4">
                      {/*<Entypo name="star" size={12} color="yellow" />
                      <Text className="text-xs font-bold">{item.Sales}sold</Text>*/}
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
      </SafeAreaView>
    </ScrollView>
  );
};

export default ProductListing;
