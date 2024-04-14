import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, TextInput  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, getDocs, query, where, orderBy } from 'firebase/firestore'; // Import onSnapshot for real-time updates
import { db } from './firebaseConfig';
import { Entypo } from '@expo/vector-icons'; 
import { getFirestore } from "firebase/firestore";

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
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

  useEffect(() => {
    // Function to fetch initial products and set up listener for real-time updates
    const fetchAndListenProducts = () => {
      const unsubscribe = onSnapshot(collection(db, 'Products'), (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      });
      return unsubscribe; // Return unsubscribe function to clean up the listener
    };

    const unsubscribe = fetchAndListenProducts(); // Fetch initial products and set up listener

    return () => {
      unsubscribe(); // Clean up listener when component unmounts
    };
  }, []); // Empty dependency array to run effect only once

  const navigateToProductDetails = (item) => {
    navigation.navigate('EditProduct', { productData: item });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
      <View className="bg-[#24255F] h-28">
      <View className="bg-[#ffffff] h-7 w-72 top-10 flex justify-center mx-auto rounded-[24px] pl-5">
        <TextInput
          placeholder="Search Product"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ paddingHorizontal: 10, fontSize: 16 }}
        />
      </View>
      <View className="bg-[#ffffff] w-64 h-12 top-16 mx-auto rounded-md flex justify-center z-20">
      <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
        Products
      </Text>
    </View>
    </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop:25 }} className="z-1">
            {products.length > 0 ? (
              products.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigateToProductDetails(item)}
                  style={{ width: '50%' }}
                >
                  <View style={{ padding: 10 }}>
                    {item.image ? (
                      <Image
                        style={{ width: '100%', height: 150, borderRadius: 8 }}
                        source={{ uri: item.image }}
                      />
                    ) : (
                      <Text>No Image Available</Text>
                    )}

                    <View style={{ backgroundColor: '#ffffff', height: 100, borderRadius: 8, padding: 10 }}>
                      <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.product_Name}</Text>
                      <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>₱{item.Price}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                        <Entypo name="star" size={12} color="yellow" />
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{item.Sales} sold</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#42a5f5', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}
          onPress={() => navigation.navigate('Add Product')}
        >
          <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductListing;
