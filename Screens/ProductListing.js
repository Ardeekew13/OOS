import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore'; // Import onSnapshot for real-time updates
import { db } from './firebaseConfig';
import { Entypo } from '@expo/vector-icons'; 

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

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
        <View style={{ backgroundColor: '#24255F', height: 112 }} />
        <View style={{ backgroundColor: '#ffffff', width:288,  height: 48, justifyContent: 'center', alignItems: 'center' }} className="mx-auto bottom-5">
          <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#24255F' }}>Products</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
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

                    <View style={{ backgroundColor: '#ffffff', height: 80, borderRadius: 8, padding: 10 }}>
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
