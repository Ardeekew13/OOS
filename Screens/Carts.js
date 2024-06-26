import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'; // Assuming you're using Redux and React Navigation
import { useNavigation, useIsFocused } from '@react-navigation/native'; // Import useNavigation hook
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import Decimal from 'decimal.js';

// Define CustomCheckbox component
const CustomCheckbox = ({ checked, onPress }) => (
  <TouchableOpacity onPress={onPress} className="flex justify-center mr-2">
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#24255F',
        backgroundColor: checked ? '#24255F' : 'transparent',
      }}
    />
  </TouchableOpacity>
);

const Carts = () => {
  const [cartProducts, setCartProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const user = useSelector((state) => state.auth.user); // Assuming you store user info in Redux
  const [totalPrice, setTotalPrice] = useState(0);
  const navigation = useNavigation(); // Initialize navigation hook
  const isFocused = useIsFocused(); // Initialize isFocused hook

  // Fetch cart products function
  const fetchCartProducts = useCallback(async () => {
    if (user) {
      try {
        const userRef = doc(getFirestore(), 'Users', user.uid);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists() && userDoc.data().myCart) {
          // Set the cart products
          setCartProducts(userDoc.data().myCart);
        } else {
          // User has no items in the cart or cart is not available in Firestore
          setCartProducts([]);
          setSelectedItems([]); // Reset selected items when cart is empty
          setTotalPrice(0); // Reset total price when cart is empty or not available
        }
      } catch (error) {
        console.error('Error fetching cart products:', error);
        // Set total price to 0 if there's an error fetching cart products
        setTotalPrice(0);
      }
    }
  }, [user]);
  
  

  useEffect(() => {
    fetchCartProducts();
  }, [fetchCartProducts, isFocused]);

  // Calculate total price when cartProducts or the selectedItems state change
  useEffect(() => {
    // Calculate the total price when selectedItems or cartProducts change
    const newTotalPrice = selectedItems.reduce((sum, item) => {
      const qtyOrdered = parseFloat(item.qtyOrdered);
      const pricePerKg = parseFloat(item.Price);

      if (!isNaN(qtyOrdered) && !isNaN(pricePerKg)) {
        const itemTotalPrice = qtyOrdered * pricePerKg;
        return sum + itemTotalPrice;
      }

      return sum;
    }, 0);

    setTotalPrice(newTotalPrice);
  }, [selectedItems, cartProducts]);

  // Handle item selection toggle
  const handleItemToggle = (itemId) => {
    const updatedSelectedItems = [...selectedItems];
    const index = updatedSelectedItems.findIndex((item) => item.id === itemId);

    if (index !== -1) {
      // Item is already selected, remove it
      updatedSelectedItems.splice(index, 1);
    } else {
      // Item is not selected, add it
      const selectedItem = cartProducts.find((item) => item.id === itemId);
      if (selectedItem) {
        updatedSelectedItems.push(selectedItem);
      }
    }

    setSelectedItems(updatedSelectedItems);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, quantity) => {
    const updatedCart = cartProducts.map((item) => {
      if (item.id === itemId) {
        const currentQty = new Decimal(item.qtyOrdered);
        const newQty = currentQty.plus(quantity);
  
        // Ensure that the quantity is at least 1/4 kg
        const updatedQty = newQty.gte(0.25) ? newQty.toNumber() : 0.25;
  
        // Round the quantity to the nearest 1/4 kg
        const roundedQty = Math.round(updatedQty * 4) / 4;
  
        return { ...item, qtyOrdered: roundedQty };
      }
      return item;
    });
  
    // Update the selectedItems state
    const updatedSelectedItems = updatedCart.filter((item) =>
      selectedItems.some((selectedItem) => selectedItem.id === item.id)
    );
  
    setSelectedItems(updatedSelectedItems);
  
    // Update the cartProducts state
    setCartProducts(updatedCart);
  };

  // Handle checkout button press
 const handleCheckout = async () => {
  // Navigate to Checkout screen and pass selected items and total price
  navigation.navigate('Checkout', { selectedItems, totalPrice });

  // Reset selected items and total price after checking out
  setSelectedItems([]);
  setTotalPrice(0);

  // Fetch cart products again to update the cart
  await fetchCartProducts();
};
  return (
    <ScrollView>
      <SafeAreaView>
        <View className="bg-[#24255F] h-28">
        </View>
        <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
          <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
            My Cart
          </Text>
        </View>
        <View>
          <FlatList
            data={cartProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                className="flex-row p-2 bg-white rounded-lg overflow-hidden mb-2 shadow-lg"
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'white',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <CustomCheckbox
                  checked={selectedItems.some((selectedItem) => selectedItem.id === item.id)}
                  onPress={() => handleItemToggle(item.id)}
                />
                <Image className="w-20 h-20" source={{ uri: item.image }} />
                <View className="flex-1 pl-2">
                  <Text className="font-bold text-lg">{item.product_Name}</Text>
                  <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => handleQuantityChange(item.id, -0.25)}>
                    <View className="rounded-full p-2 bg-gray-200">
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>-</Text>
                    </View>
                  </TouchableOpacity>
                  <Text className="mx-2">{item.qtyOrdered}kg</Text>
                  <TouchableOpacity onPress={() => handleQuantityChange(item.id, 0.25)}>
                    <View className="rounded-full p-2 bg-gray-200">
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>+</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                  <Text>₱{item.Price}</Text>
                </View>
              </View>
            )}
          />

          <View className="p-2 bg-white rounded-lg mb-2 shadow-lg">
            <Text className="font-bold">Total Price: ₱{totalPrice}</Text>
          </View>

          {/* Checkout button */}
          {totalPrice > 0 && selectedItems.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: '#24255F',
                padding: 16,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 8,
              }}
              onPress={handleCheckout}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Checkout</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Carts; 
