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
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

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
    if (user) {
      try {
        setLoading(true);
  
        const userRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists() && userDoc.data().myCart) {
          const cartItems = userDoc.data().myCart;
          const existingCartItem = cartItems.find(item => item.id === product.id);
          
          if (existingCartItem) {
            const totalOrderedQty = parseFloat(quantity) + parseFloat(existingCartItem.qtyOrdered);
            if (totalOrderedQty > product.qty) {
              alert("Insufficient stock!");
              setLoading(false);
              return;
            }
          }
          
          await updateDoc(userRef, {
            myCart: arrayUnion({ ...product, qtyOrdered: quantity }),
          });
        } else {
          await setDoc(userRef, { myCart: [{ ...product, qtyOrdered: quantity }] }, { merge: true });
        }
  
        console.log("Product added to cart!");
        navigation.navigate("BottomTabs", { screen: "Carts" });
      } catch (error) {
        console.error("Error adding product to cart:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("User not authenticated. Please log in.");
    }
  };
  

  const specialProducts = ["Talaba", "Swaki", "Kuhol", "Sikadsikad", "Toyom"];
  const isSpecialProduct = specialProducts.includes(product.product_Name);

  return (
    <SafeAreaView>
      <View className="mx-auto flex justify-content items-center z-10">
        <Image
          style={{ width: screenWidth, height: 250 }}
          source={{ uri: product.image }}
        />
      </View>

      <View className="ml-4">
        <Text className="text-3xl font-extrabold mt-2">{product.product_Name}</Text>

        <View className="flex flex-row items-center mt-2">
          <Text className="font-light">Price: </Text>
          <Text className="font-bold text-lg">₱{product.Price}</Text>
        </View>

        <View>
          <Text>Stock Available: {product.qty} {isSpecialProduct ? "sacks" : "kg"}</Text>
          <Text className="mt-4 font-bold">Description:</Text>
          <Text className="font-light mt-2">{product.Description}</Text>
        </View>

        {product.qty > 0 && (
          <View className="mt-4">
            <Text>Quantity ({isSpecialProduct ? "sacks" : "kg"}):</Text>
            <Picker
              selectedValue={quantity}
              onValueChange={(itemValue) => setQuantity(itemValue)}
            >
              <Picker.Item label={`1 ${isSpecialProduct ? "sack" : "kg"}`} value="1" />
              <Picker.Item label={`2 ${isSpecialProduct ? "sacks" : "kg"}`} value="2" />
              <Picker.Item label={`3 ${isSpecialProduct ? "sacks" : "kg"}`} value="3" />
              {!isSpecialProduct && (
                <>
                  <Picker.Item label="1/4 kg" value="0.25" />
                  <Picker.Item label="1/2 kg" value="0.5" />
                </>
              )}
            </Picker>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3F559D" style={{ marginTop: 20 }} />
      ) : product.qty > 0 ? (
        <TouchableOpacity
          className="bg-[#3F559D] h-14 w-11/12 top-32 mx-auto rounded-lg justify-center"
          onPress={addToCart}
        >
          <Text className="text-center text-white">Add to Cart</Text>
        </TouchableOpacity>
      ) : (
        <Text className="bg-[#737373] h-14 w-11/12 top-32 mx-auto rounded-lg justify-center text-center text-white pt-5">
          Out of Stock
        </Text>
      )}
    </SafeAreaView>
  );
}

export default ProductDetails;
