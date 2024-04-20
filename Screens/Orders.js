import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Button } from "react-native";
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { db } from "./firebaseConfig";
import { SafeAreaView } from 'react-native-safe-area-context';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  const auth = getAuth();
  useEffect(() => {
  const user = auth.currentUser;
  if (user) {
    let ordersRef = collection(db, 'Orders');
    if (activeTab !== 'All') {
      ordersRef = query(ordersRef, where('status', '==', activeTab));
    }

    // Add a where clause to filter orders by userId
    ordersRef = query(ordersRef, where('userID', '==', user.uid));
  
      const unsubscribe = onSnapshot(ordersRef, snapshot => {
        const fetchedOrders = [];
        snapshot.forEach(doc => {
          const orderData = doc.data();
          console.log('Orders:', fetchedOrders);
          const orderItems = orderData.items.map(item => ({
            Availability: item.Availability,
            Category: item.Category,
            Description: item.Description,
            Price: item.Price,
            Sales: item.Sales,
            added_at: item.added_at,
            id: item.id,
            image: item.image,
            product_Name: item.product_Name,
            qty: item.qty,
            qtyOrdered: item.qtyOrdered,
            // Add other item properties as needed
          }));
          const order = {
            id: doc.id,
            createdAt: orderData.createdAt,
            deliveryInfo: orderData.deliveryInfo,
            status: orderData.status,
            totalPrice: orderData.totalPrice,
            userId: orderData.userId,
            items: orderItems,
            // Add other order properties as needed
          };
          fetchedOrders.push(order);
  
          // Access and log properties of each item in the items array
          orderItems.forEach(item => {
            console.log('Image:', item.image);
            console.log('Product Name:', item.product_Name);
            // Log other item properties as needed
          });
        });
        setOrders(fetchedOrders);
        console.log('Orders:', fetchedOrders); // Log the fetched orders here
      });
  
      return () => unsubscribe();
    }
  }, [auth, activeTab]);

  const handleCancelOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, 'Orders', orderId), {
        status: 'Cancelled'
      });
      console.log('Order cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="bg-[#24255F] h-28">
      </View>
      <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
        <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
          Orders
        </Text>
      </View>
      <View className="bg-[#ffffff] p-2 flex-row">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
      <TouchableOpacity onPress={() => handleTabChange('All')} className={`px-4 ${activeTab === 'All' ? 'text-blue-500' : 'text-black'}`}>
        <Text>All</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabChange('Pending')} className={`px-4 ${activeTab === 'Pending' ? 'text-blue-500' : 'text-black'}`}>
        <Text>Pending</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabChange('Ongoing')} className={`px-4 ${activeTab === 'Ongoing' ? 'text-blue-500' : 'text-black'}`}>
      <Text>Ongoing</Text>
    </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabChange('Completed')} className={`px-4 ${activeTab === 'Completed' ? 'text-blue-500' : 'text-black'}`}>
        <Text>Completed</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleTabChange('Cancelled')} className={`px-4 ${activeTab === 'Cancelled' ? 'text-blue-500' : 'text-black'}`}>
        <Text>Cancelled</Text>
      </TouchableOpacity>
    </ScrollView>
      </View>
      <ScrollView className="mt-2" style={{ flex: 1 }}>
        {orders.map(order => (
          <View key={order.id} className="bg-white p-4 mb-5">
            {order.items.map((item, index) => (
              <View key={item.id} className="flex-row space-x-2 m-2">
              <View>
              <Image
              source={{ uri: item.image }} 
              style={{ width: 100, height: 100 }}
            />
            </View>
            <View>
                <Text className="font-bold">{item.product_Name}</Text>      
              <Text>Order Total: ₱{order.totalPrice}</Text>
              <Text>Status: {order.status}</Text>
              {order.status === 'Pending' && index === 0 && (
                <Button title="Cancel" onPress={() => handleCancelOrder(order.id)} />
              )}
              </View>
              </View>
              
            ))}
            
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default Orders;
