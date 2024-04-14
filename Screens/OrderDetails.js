import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const OrderDetails = ({ route, navigation }) => {
  const { order } = route.params;

  const handleAccept = async () => {
    try {
      await updateDoc(doc(db, 'Orders', order.id), {
        status: 'Ongoing',
      });
      console.log('Order status updated to Ongoing');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await updateDoc(doc(db, 'Orders', order.id), {
        status: 'Completed',
      });
      console.log('Order status updated to Completed');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await updateDoc(doc(db, 'Orders', order.id), {
        status: 'Cancelled',
      });
      console.log('Order status updated to Cancelled');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View className="bg-[#24255F] h-28"></View>
        <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
          <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
            Order Details
          </Text>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.text}>{order.id}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.text}>{order.status}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Total Price:</Text>
            <Text style={styles.text}>₱{order.totalPrice}</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.itemDetails}>
                <Text style={styles.label}>{item.product_Name}</Text>
                <Text style={styles.text}>Quantity: {item.qtyOrdered} kg</Text>
              </View>
            </View>
          ))}
          <View style={styles.detailsContainer}>
            <Text style={styles.heading}>Delivery Info:</Text>
            <Text style={styles.text}>Customer: {order.firstName} {order.lastName}</Text>
            <Text style={styles.text}>Address: <Text style={styles.text}>{order.deliveryInfo.address}</Text> </Text>
            <Text style={styles.text}>Phone Number: {order.deliveryInfo.phoneNumber}</Text>
          </View>
          {order.status === 'Pending' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAccept}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {order.status === 'Ongoing' && (
            <TouchableOpacity style={styles.button} onPress={handleComplete}>
              <Text style={styles.buttonText}>Completed</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsContainer: {
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  text: {
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#24255F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OrderDetails;
