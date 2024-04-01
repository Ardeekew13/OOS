import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux'; // Assuming you're using Redux
import {  getFirestore, doc, updateDoc, addDoc, collection,getDoc  } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";

const Checkout = ({ route }) => {
  const { selectedItems, totalPrice } = route.params;
  const user = useSelector((state) => state.auth.user); // Assuming you store user info in Redux
  const firestore = getFirestore();
  const navigation = useNavigation();
  
  // State variables for input fields
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);

  // Fetch delivery information if available
  // Function to handle checkout
  const handleCheckout = async () => {
    try {
      const firestore = getFirestore(); // Get Firestore instance
  
      // Initialize an array to store batched writes
      const batch = [];
  
      // Update quantity selected and increment sales for each product in the cart
      selectedItems.forEach(async (item) => {
        const productRef = doc(firestore, 'Products', item.id);
        const newQty = item.qtyAvailable - item.qtyOrdered; // Deduct quantity ordered from available quantity
        const newSales = item.Sales + 1; // Increment sales by 1
  
        // Create batched writes for each product update
        batch.push(updateDoc(productRef, { qtyAvailable: newQty, Sales: newSales }));
      });
  
      // Remove checked-out items from the user's cart in Firestore if cart exists
      const userRef = doc(firestore, 'Users', user.uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData.myCart) {
          const updatedCart = userData.myCart.filter((cartItem) => {
            return !selectedItems.some((selectedItem) => selectedItem.id === cartItem.id);
          });
  
          // Update user document with the filtered cart items
          batch.push(updateDoc(userRef, { myCart: updatedCart }));
        } else {
          console.log('User has no cart items.');
        }
      } else {
        console.log('User document does not exist.');
      }
  
      // Execute batched writes
      await Promise.all(batch);
  
      // Create a new order document in the "Orders" collection
      const orderRef = await addDoc(collection(firestore, 'Orders'), {
        userId: user.uid, // User ID
        items: selectedItems, // Selected items
        totalPrice: totalPrice, // Total price
        deliveryInfo: { address, phoneNumber }, // Delivery information
        createdAt: new Date(), // Timestamp for order creation
        status: 'Pending'
      });
  
      console.log('Order placed successfully! Order ID:', orderRef.id);
  
      // After checkout, you can navigate to a success page or perform other actions
      // For example:
      // navigation.navigate('OrderConfirmation');
    } catch (error) {
      console.error('Error updating product quantities, removing cart items, and creating order:', error);
    }
  };
  
  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Selected Items:</Text>
        {/* Display selected items */}
        {selectedItems.map((item) => (
          <View key={item.id} style={{ marginBottom: 10 }}>
            <Text>{item.product_Name}</Text>
            <Text>Quantity: {item.qtyOrdered} kg</Text>
            <Text>Price: ₱{(item.Price * item.qtyOrdered).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={{ marginTop: 20, fontSize: 20, fontWeight: 'bold' }}>Total Price: ₱{totalPrice.toFixed(2)}</Text>

        {/* Input fields for delivery address and phone number */}
        {!hasDeliveryInfo && (
          <View>
            <TextInput
              style={{ marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
              placeholder="Delivery Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        )}

        {/* Checkout button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#24255F',
            padding: 16,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}
          onPress={handleCheckout}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Checkout;
