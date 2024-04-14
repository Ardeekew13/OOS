import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
const auth = getAuth();

function ProductDetails({ route }) {
  const { product } = route.params;
  const user = auth.currentUser;
  const screenWidth = Dimensions.get("window").width;
  const navigation = useNavigation();

  const [quantity, setQuantity] = useState("1"); // Default quantity is 1
  const [loading, setLoading] = useState(false); // Loading state for adding to cart

  const addToCart = async () => {
    const db = getFirestore();
    const auth = getAuth();
    if (user) {
      try {
        // Set loading state to true when adding to cart
        setLoading(true);

        // Get the user's document reference
        const userRef = doc(db, "Users", user.uid);

        // Get the user's document data
        const userDoc = await getDoc(userRef);

        // Check if the user has the myCart field
        if (userDoc.exists() && userDoc.data().myCart) {
          // User has the myCart field, update with arrayUnion
          await updateDoc(userRef, {
            myCart: arrayUnion({ ...product, qtyOrdered: quantity  }),
          });
        } else {
          // User doesn't have the myCart field, create it with the product
          await setDoc(userRef, { myCart: [{ ...product, qtyOrdered: quantity }] }, { merge: true });
        }

        console.log("Product added to cart!");

        // Navigate to the Cart screen
        navigation.navigate('BottomTabs', { screen: 'Carts' });
      } catch (error) {
        console.error("Error adding product to cart:", error);
      } finally {
        // Set loading state to false after adding to cart
        setLoading(false);
      }
    } else {
      console.log("User not authenticated. Please log in.");
    }
  };

  return (
    <SafeAreaView>
      <View className="mx-auto flex justify-content items-center z-10">
        <Image
          style={{ width: screenWidth, height: 250 }}
          source={{ uri: product.image }}
        />
      </View>

      <View className="ml-4">
        <Text className="text-3xl font-extrabold mt-2">
          {product.product_Name}
        </Text>

        <View className="flex flex-row items-center mt-2">
          <Text className="font-light">Price: </Text>
          <Text className="font-bold text-lg">₱{product.Price}</Text>
        </View>

        <View className="">
          <Text>Stock Available: {product.qty}</Text>
          <Text className="mt-4 font-bold">Description:</Text>
          <Text className="font-light mt-2">{product.Description}</Text>
        </View>

        <View className="mt-4">
          <Text>Quantity (kg):</Text>
          <Picker
            selectedValue={quantity}
            onValueChange={(itemValue) => setQuantity(itemValue)}
          >
            <Picker.Item label="1/4 kg" value="0.25" />
            <Picker.Item label="1/2 kg" value="0.5" />
            <Picker.Item label="1 kg" value="1" />
            <Picker.Item label="2 kg" value="2" />
            <Picker.Item label="3 kg" value="3" />
          </Picker>
        </View>
      </View>

      {/* Conditional rendering of activity indicator */}
      {loading ? (
        <ActivityIndicator size="large" color="#3F559D" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          className="bg-[#3F559D] h-14 w-11/12 top-32 mx-auto rounded-lg justify-center"
          onPress={addToCart}
        >
          <Text className="text-center text-white">Add to Cart</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

export default ProductDetails;
