import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, SafeAreaView } from "react-native";
import { useAuth } from "firebase/auth"; // Import your authentication context
import { collection, doc, getDoc,getFirestore } from "firebase/firestore";


function Carts() {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth(); // Assume you have a custom hook for authentication

  useEffect(() => {
    const fetchCartData = async () => {
      if (user) {
        try {
          // Fetch the user's document from Firestore
          const userRef = doc(firestore, "users", user.uid);
          const userSnapshot = await getDoc(userRef);

          if (userSnapshot.exists()) {
            // Get the cart array from the user's document
            const userCart = userSnapshot.data().cart || [];
            setCartItems(userCart);
          }
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      }
    };

    fetchCartData();
  }, [user]);

  return (
    <SafeAreaView>
      <View>
        <Text>Your Cart</Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <Image style={{ width: 50, height: 50 }} source={{ uri: item.image }} />
              <Text>{item.product_Name}</Text>
              <Text>₱{item.Price}</Text>
              {/* Add more details or actions as needed */}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

export default Carts;
