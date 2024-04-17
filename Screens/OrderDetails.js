import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig";

const OrderDetails = ({ route, navigation }) => {
  const { order } = route.params;
  const [status, setStatus] = useState(order.status);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "Orders", order.id), (snapshot) => {
      if (snapshot.exists()) {
        const updatedOrder = snapshot.data();
        setStatus(updatedOrder.status); // Update status state
      } else {
        console.error("Order not found");
      }
    });

    return () => unsubscribe(); // Unsubscribe when component unmounts
  }, [order]);

  const handleAccept = async () => {
    try {
      // Update order status to "Ongoing"
      await updateDoc(doc(db, "Orders", order.id), {
        status: "Ongoing",
      });
  
      // Update product quantities and sales for each item in the order
      for (const item of order.items) {
        // Update product sales
        const productDocRef = doc(db, "Products", item.productId);
        const productDoc = await getDoc(productDocRef);
        if (productDoc.exists()) {
          const productData = productDoc.data();
          const updatedSales = productData.sales + 1;
          await updateDoc(productDocRef, { sales: updatedSales });
        } else {
          console.error("Product not found:", item.productId);
        }
  
        // Update product quantity
        const updatedQuantity = item.quantity - item.qtyOrdered; // Subtract ordered quantity
        await updateDoc(productDocRef, { quantity: updatedQuantity });
      }
  
      console.log("Order status updated to Ongoing, product sales, and quantities updated");
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await updateDoc(doc(db, "Orders", order.id), {
        status: "Completed",
      });
      console.log("Order status updated to Completed");
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleCancel = async () => {
    try {
      await updateDoc(doc(db, "Orders", order.id), {
        status: "Cancelled",
      });
      console.log("Order status updated to Cancelled");
    } catch (error) {
      console.error("Error updating order status:", error);
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
          <View style={styles.detailsContainerDev}>
            <Text style={styles.heading}>Delivery Info:</Text>
            <Text style={styles.text}>
              Customer: {order.firstName} {order.lastName}
            </Text>
            <Text style={styles.text}>
              Address:{" "}
              <Text style={styles.text}>{order.deliveryInfo.address}</Text>{" "}
            </Text>
            <Text style={styles.text}>
              Phone Number: {order.deliveryInfo.phoneNumber}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Order ID:</Text>
            <Text style={styles.text}>{order.id}</Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.text}>{status}</Text>
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
            <Text style={styles.label}>Total Price:</Text>
            <Text style={styles.Totaltext}>₱{order.totalPrice}.00</Text>
          </View>

          {order.status === "Pending" && status === "Pending" && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAccept}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelbutton}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {order.status === "Ongoing" ||
            (status === "Ongoing" && (
              <TouchableOpacity style={styles.button} onPress={handleComplete}>
                <Text style={styles.completebuttonText}>Complete</Text>
              </TouchableOpacity>
            ))}
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
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailsContainer: {
    marginBottom: 5,
  },
  detailsContainerDev: {
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding:10
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  text: {
    marginBottom: 2,
  },
  Totaltext: {
    marginBottom: 5,
    fontSize: 18,
    fontWeight: "bold",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#24255F",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelbutton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  completebuttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default OrderDetails;
