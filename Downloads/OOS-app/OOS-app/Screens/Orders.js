import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Button, Alert } from "react-native";
import { collection, query, where, onSnapshot, updateDoc, getDoc, doc } from 'firebase/firestore';
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

  const handleCancelOrder = async (orderId, productId) => {
    try {
      Alert.alert(
        'Cancel Product',
        'Are you sure you want to cancel this product?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              // Find the order document with the specified orderId
              const orderRef = doc(db, 'Orders', orderId);
              const orderSnapshot = await getDoc(orderRef);
          
              // Check if the order exists
              if (orderSnapshot.exists()) {
                // Get the current items array from the order data
                const currentItems = orderSnapshot.data().items;
          
                // Filter out the canceled product based on the productId
                const updatedItems = currentItems.filter(item => item.id !== productId);
          
                // Update the order document with the updated items array
                await updateDoc(orderRef, { items: updatedItems });
          
                console.log('Product cancelled successfully.');
              } else {
                console.error('Order not found.');
              }
            },
          },
        ],
        { cancelable: false },
      );
    } catch (error) {
      console.error('Error cancelling product:', error);
    }
  };
  
  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  const specialProducts = ["Talaba", "Swaki", "Kuhol", "Sikadsikad", "Toyom"];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="bg-[#24255F] h-28" />
      <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
        <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
          Orders
        </Text>
      </View>
      <View className="bg-[#ffffff]  flex-row">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
          <TouchableOpacity onPress={() => handleTabChange('All')} className={`px-4 ${activeTab === 'All' ? 'bg-[#24255F] p-2' : 'text-black p-2'}`}>
            <Text className={`px-4 ${activeTab === 'All' ? 'text-white' : 'text-black'}`}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('Pending')} className={`px-4 ${activeTab === 'Pending' ? 'bg-[#24255F] p-2' : 'text-black p-2'}`}>
            <Text className={`px-4 ${activeTab === 'Pending' ? 'text-white' : 'text-black'}`}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('On the way')} className={`px-4 ${activeTab === 'On the way' ? 'bg-[#24255F] p-2' : 'text-black p-2'}`}>
            <Text className={`px-4 ${activeTab === 'On the way' ? 'text-white' : 'text-black'}`}>Ongoing</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('Delivered')} className={`px-4 ${activeTab === 'Delivered' ? 'bg-[#24255F] p-2' : 'text-black p-2'}`}>
            <Text className={`px-4 ${activeTab === 'Delivered' ? 'text-white' : 'text-black'}`}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTabChange('Cancelled')} className={`px-4 ${activeTab === 'Cancelled' ? 'bg-[#24255F] p-2' : 'text-black p-2'}`}>
            <Text className={`px-4 ${activeTab === 'Cancelled' ? 'text-white' : 'text-black'}`}>Cancelled</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <ScrollView className="mt-2" style={{ flex: 1 }}>
        {orders.map(order => (
          <View key={order.id} className="bg-white p-4 mb-5">
            {order.items.map((item, index) => (
              <View key={item.id} className="flex-row space-x-2 m-2 justify-between items-center">
                <View>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 100, height: 100 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="font-bold">{item.product_Name}</Text>
                  <Text>Quantity: {specialProducts.includes(item.product_Name) ? "per sack" : `${item.qtyOrdered} kg`}</Text>
                  <Text>Order Total: ₱{order.totalPrice}</Text>
                  <Text>Status: {order.status} </Text>
                </View>
                {order.status === 'Pending' && (
                  <TouchableOpacity
                  className="bg-blue-500 py-2 px-4"
                  title="Cancel"
                  onPress={() => handleCancelOrder(order.id, item.id)}
                >
                  <Text className="text-center text-white">Cancel</Text>
                </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default Orders;
