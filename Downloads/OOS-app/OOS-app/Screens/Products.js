import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

function Products() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const db = getFirestore();
      const productsCollectionRef = collection(db, 'Products');
      let q = query(productsCollectionRef, orderBy('product_Name'));

      if (activeTab !== 'All') {
        q = query(productsCollectionRef, where('Category', '==', activeTab), orderBy('product_Name'));
      }

      if (searchQuery) {
        const searchTerm = capitalizeFirstLetter(searchQuery.toLowerCase().trim());
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
        setError(null); // Clear error if successful
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error fetching products. Please check your index settings in Firebase.');
      }
    };

    fetchProducts();
  }, [searchQuery, activeTab]);

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="bg-[#24255F] h-20">
        <View className="bg-white h-8 w-48 mt-5 mx-auto rounded-full pl-2">
          <TextInput
            placeholder="Search Product"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="px-2 text-lg"
          />
        </View>
      </View>
      
      <View className="bg-white flex-row my-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 ">
        {['All', 'Fish', 'Shellfish', 'Squid & Octopus', 'Seaweeds'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabChange(tab)}
            className={`px-4 h-10 flex justify-center ${activeTab === tab ? 'bg-[#24255F]' : ''}`}
          >
            <Text className={`text-center ${activeTab === tab ? 'text-white' : 'text-black'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>
      <ScrollView className="flex-1 mt-2">
        <View className="flex flex-row flex-wrap justify-center gap-2">
          {products.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              onPress={() => navigation.navigate('ProductDetails', { product: product })}
            >
              <View>
                <Image
                  className="w-40 h-36 rounded-t-lg"
                  source={{ uri: product.image }}
                />
                <View className="bg-white h-10 rounded-b-lg flex justify-center">
                  <Text className="text-center mt-1 font-semibold">{product.product_Name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Products;
