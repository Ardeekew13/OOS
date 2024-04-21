import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector } from "react-redux"; // Assuming you're using Redux
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const Checkout = ({ route }) => {
  const { selectedItems, totalPrice } = route.params;
  const user = useSelector((state) => state.auth.user); // Assuming you store user info in Redux
  const firestore = getFirestore();
  const navigation = useNavigation();

  // State variables for input fields
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasDeliveryInfo, setHasDeliveryInfo] = useState(false);
  const [loading, setLoading] = useState(false); // State variable for activity indicator
  const [editableDeliveryInfo, setEditableDeliveryInfo] = useState(false); // State variable to toggle edit mode

  useEffect(() => {
    // Check if the mobile field is empty or doesn't exist in the user data
    if (!user || !user.mobile) {
      // Mobile field is empty or doesn't exist, ask for phone number
      setHasDeliveryInfo(true);
    }
  }, [user]);

  useEffect(() => {
    // Check if the user has delivery information available
    const fetchDeliveryInfo = async () => {
      try {
        if (user && user.uid) {
          const userRef = doc(firestore, "Users", user.uid); // Document reference for the current user
          const userDoc = await getDoc(userRef); // Get document snapshot for the user document

          if (userDoc.exists()) {
            const userData = userDoc.data(); // Extract user data
            const deliveryInfo = userData.deliveryInfo; // Extract deliveryInfo from user data
            if (deliveryInfo && userData.mobile) {
              setAddress(deliveryInfo.address);
              setPhoneNumber(userData.mobile); // Assuming mobile number is stored in the 'mobile' field
              setHasDeliveryInfo(true); // Set deliveryInfo to true
            } else {
              setHasDeliveryInfo(false); // Set deliveryInfo to false
            }
          }
        }
      } catch (error) {
        console.error("Error fetching delivery info:", error);
      }
    };

    fetchDeliveryInfo();
  }, [user, firestore]);

  // Function to handle checkout
  const handleCheckout = async () => {
    setLoading(true); // Show activity indicator while processing order
    try {
      const firestore = getFirestore(); // Get Firestore instance
      const auth = getAuth(); // Get authentication methods from Firebase

      const currentUser = auth.currentUser; // Get current user from Firebase Auth

      if (!currentUser) {
        console.error("No user logged in.");
        return;
      }

      // Initialize an array to store batched writes
      const batch = [];

      // Remove checked-out items from the user's cart in Firestore if cart exists
      const userRef = doc(firestore, "Users", currentUser.uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData && userData.myCart) {
          const updatedCart = userData.myCart.filter((cartItem) => {
            return !selectedItems.some(
              (selectedItem) => selectedItem.id === cartItem.id
            );
          });

          // Extract first name and last name from userData
          const { Fname, Lname } = userData;

          // Update user document with the filtered cart items
          batch.push(updateDoc(userRef, { myCart: updatedCart }));

          // Calculate total price including delivery fee
          const totalWithDelivery = totalPrice + 50;

          // Create a new order document in the "Orders" collection
          const orderRef = await addDoc(collection(firestore, "Orders"), {
            userID: currentUser.uid, // User ID
            firstName: Fname || "", // First name from userData
            lastName: Lname || "", // Last name from userData
            items: selectedItems, // Selected items
            totalPrice: totalWithDelivery, // Total price including delivery fee
            deliveryFee: 50, // Delivery fee
            deliveryInfo: { address, phoneNumber }, // Delivery information
            createdAt: new Date(), // Timestamp for order creation
            deliveryDate: new Date(), // Current date for delivery
            status: "Pending",
          });

          console.log("Order placed successfully! Order ID:", orderRef.id);

          // Show alert when the order is successful
          Alert.alert(
            "Order Placed",
            "Your order has been placed successfully!",
            [
              {
                text: "OK",
                onPress: () =>
                  navigation.navigate("BottomTabs", { screen: "Orders" }),
              },
            ]
          );
        } else {
          console.log("User has no cart items or user data not available.");
        }
      } else {
        console.log("User document does not exist.");
      }

      // Execute batched writes
      await Promise.all(batch);
    } catch (error) {
      console.error(
        "Error updating product quantities, removing cart items, and creating order:",
        error
      );
    } finally {
      setLoading(false); // Hide activity indicator after order processing
    }
  };

  // Function to toggle edit mode for delivery information
  const toggleEditMode = () => {
    setEditableDeliveryInfo(!editableDeliveryInfo);
  };

  // Function to save edited delivery information
  const saveDeliveryInfo = async () => {
    try {
      // Update delivery information in Firestore
      const userRef = doc(firestore, "Users", user.uid);
      await updateDoc(userRef, { deliveryInfo: { address, phoneNumber } });
      // Notify user that information is saved
      Alert.alert(
        "Delivery Info Updated",
        "Your delivery information has been updated successfully."
      );
      // Exit edit mode
      setEditableDeliveryInfo(false);
    } catch (error) {
      console.error("Error updating delivery information:", error);
      Alert.alert(
        "Error",
        "Failed to update delivery information. Please try again later."
      );
    }
  };

  return (
    <ScrollView>
      <View className="bg-[#24255F] h-28"></View>
      <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
        <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
          Checkout
        </Text>
      </View>
      <View className="mx-2">
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
          Selected Items:
        </Text>
        {/* Display selected items */}
        {selectedItems.map((item) => (
          <View
            key={item.id}
            style={{ marginBottom: 10 }}
            className="flex flex-nowrap"
          >
            <Text>{item.product_Name}</Text>
            <Text>Quantity: {item.qtyOrdered} kg</Text>
            <Text>Price: ₱{(item.Price * item.qtyOrdered).toFixed(2)}</Text>
          </View>
        ))}
        <Text className="font-bold text-xl">Delivery information</Text>
        {hasDeliveryInfo ? (
          <View>
            {editableDeliveryInfo ? ( // Render editable fields if in edit mode
              <View>
                <TextInput
                  style={{
                    marginTop: 20,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                  }}
                  placeholder="Delivery Address"
                  value={address}
                  onChangeText={setAddress}
                />
                <TextInput
                  style={{
                    marginTop: 20,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 5,
                  }}
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <TouchableOpacity onPress={saveDeliveryInfo}>
                  <Text
                    style={{
                      color: "#24255F",
                      fontWeight: "bold",
                      marginTop: 10,
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="font-bold">Delivery Address:</Text>
                <Text>{address}</Text>
                <Text className="font-bold">Phone Number:</Text>
                <Text>{phoneNumber}</Text>
                <TouchableOpacity onPress={toggleEditMode}>
                  <Text
                    style={{
                      color: "#24255F",
                      fontWeight: "bold",
                      marginTop: 10,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View>
            <TextInput
              style={{
                marginTop: 20,
                padding: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
              }}
              placeholder="Delivery Address"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={{
                marginTop: 20,
                padding: 10,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
              }}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        )}
        <Text className="mt-5 font-bold text-lg ">Payment method: CASH ON DELIVERY</Text>
        <Text className="mt-10 font-bold text-lg">
          Price: ₱{totalPrice.toFixed(2)}{" "}
        </Text>

        {/* Display delivery fee */}
        <Text className="mt-2 font-bold text-lg">Delivery Fee: ₱50.00</Text>

        {/* Display total price including delivery fee */}
        <Text className="mt-2 font-bold text-xl">
          Total Price: ₱{(totalPrice + 50).toFixed(2)}
        </Text>

        {/* Checkout button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#24255F",
            padding: 16,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
          onPress={handleCheckout}
          disabled={!hasDeliveryInfo} // Disable the button if delivery info is not available
        >
          {loading ? (
            <ActivityIndicator color="white" /> // Show activity indicator if loading
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Order Now
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Checkout;
