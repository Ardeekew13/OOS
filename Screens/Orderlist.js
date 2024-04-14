import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Assuming you have configured Firebase

export default function Orderlist() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Orders'));
        const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderPress = (order) => {
    // Navigate to Order Details screen and pass the order data as route params
    navigation.navigate('OrderDetails', { order });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View className="bg-[#24255F] h-28">
      </View>
      <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
        <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
          My Orders
        </Text>
      </View>
      <View style={{padding:10}}>
        {orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders available</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleOrderPress(item)}>
                <View style={styles.orderContainer}>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderIdText}>Order ID: {item.id}</Text>
                    <Text style={styles.productNameText}>Status: {item.status}</Text>
                    <Text style={styles.customerNameText}>Customer: {item.firstName} {item.lastName}</Text>
                    <Text style={styles.productNameText}>Total Price: ₱{item.totalPrice}</Text>
                    {/* Add more order details as needed */}
                  </View>
                  <Image source={{ uri: item.image }} style={styles.image} />
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noOrdersText: {
    fontSize: 18,
    textAlign: 'center',
  },
  orderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  orderDetails: {
    flex: 1,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productNameText: {
    fontSize: 14,
  },
  customerNameText: {
    fontSize: 14,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
