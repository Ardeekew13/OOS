import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updatePassword,
} from "firebase/auth";
import { getDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import { AntDesign, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";


function Profile() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(userData ? userData.email : "");
  const [newFirstName, setNewFirstName] = useState(userData ? userData.Fname : "");
  const [newLastName, setNewLastName] = useState(userData ? userData.Lname : "");
  const [newMobile, setNewMobile] = useState(userData ? userData.mobile : "");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchUserData = async () => {
      const db = getFirestore();
      if (currentUser) {
        const userDocRef = doc(db, "Users", currentUser.uid);
  
        try {
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data();
            setUserData(fetchedUserData);
  
            // Initialize state variables with current user data if available
            setNewEmail(fetchedUserData.email);
            setNewFirstName(fetchedUserData.Fname);
            setNewLastName(fetchedUserData.Lname);
            setNewMobile(fetchedUserData.mobile);
          } else {
            console.error("User document not found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
  
    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleChangePassword = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      setShowModal(false);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleUpdateUserInfo = async () => {
    
    try {
      setIsLoading(true); 
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newEmail)) {
      setEmailError("Invalid email format");
      return;
    } else {
      setEmailError("");
    }

    // Validate name (should not contain numbers)
    const namePattern = /^[a-zA-Z]+$/;
    if (!namePattern.test(newFirstName) || !namePattern.test(newLastName)) {
      setNameError("Name should not contain numbers");
      return;
    } else {
      setNameError("");
    }

    // Validate mobile number (should start with 09 and have 11 digits including 09)
    const mobilePattern = /^09\d{9}$/;
    if (!mobilePattern.test(newMobile)) {
      setMobileError("Mobile number should start with 09 and have 11 digits");
      return;
    } else {
      setMobileError("");
    }

    // If all validations pass, update user info
   
    console.log("Updating user info...");

    const db = getFirestore();
    const userDocRef = doc(db, "Users", currentUser.uid);
    await updateDoc(userDocRef, {
      email: newEmail,
      Fname: newFirstName,
      Lname: newLastName,
      mobile: newMobile,
    });
    
    console.log("User information updated successfully!");
      // Close the modal after updating user info
      setShowModal1(false);
    } catch (error) {
      console.error("Error updating user info:", error);
    }
    finally {
      setIsLoading(false); // Set isLoading to false to hide the activity indicator
    }
  };

  const toggleRolesModal = () => {
    setShowRolesModal(!showRolesModal);
  };

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <View className="bg-[#24255F] h-28"></View>
          <View className="bg-[#ffffff] w-64 h-12 bottom-4 mx-auto rounded-md flex justify-center ">
            <Text className="text-center text-lg font-bold text-[#24255F] tracking-tight">
              PROFILE
            </Text>
          </View>
          <View className="mx-5 space-y-3">
            <View className="flex-row">
              <Image className="w-32 h-32" source={require("./Images/user.png")} />
              
              {userData ? (
                <View>
                  <Text className="text-3xl ml-2 mt-3 font-bold">{userData.username}</Text>
                  <Text className="text-2xl  mt-3 ml-2">
                    {userData.Lname}, {userData.Fname}
                  </Text>
                </View>
              ) : (
                <Text>Loading...</Text>
              )}
            </View>
            <Text className="text-center font-bold text-2xl">User Information</Text>
            {userData && (
              <View className="space-y-2">
                <View className="flex flex-row border-2 p-2 rounded-2xl space-x-2">
                  <MaterialIcons name="email" size={24} color="black" />
                  <Text>{userData.email}</Text>
                </View>
                <View className="flex flex-row border-2 p-2 rounded-2xl space-x-2 mb-14">
                  <FontAwesome name="phone" size={24} color="black" />
                  <Text>{userData.mobile}</Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                backgroundColor: "#6495ED",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Change Password</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showModal}
              onRequestClose={() => setShowModal(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 20,
                    borderRadius: 10,
                    width: "80%",
                  }}
                >
                  <Text style={{ fontSize: 18, marginBottom: 10 }}>
                    Change Password
                  </Text>
                  <TextInput
                    placeholder="Enter new password"
                    style={{
                      borderWidth: 1,
                      borderColor: "gray",
                      padding: 10,
                      marginBottom: 10,
                    }}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                  <View className="space-y-4">
                    <TouchableOpacity
                      onPress={handleChangePassword}
                      className="bg-[#24255F] h-10 flex justify-center items-center mb-2"
                    >
                      <Text className="text-white">CHANGE PASSWORD</Text>
                    </TouchableOpacity>
                    <Button
                      title="Cancel"
                      onPress={() => setShowModal(false)}
                      color="red"
                    />
                  </View>
                </View>
              </View>
            </Modal>
            <TouchableOpacity
              onPress={() => setShowModal1(true)}
              style={{
                backgroundColor: "#6495ED",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Settings</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showModal1}
              onRequestClose={() => setShowModal1(false)}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 20,
                    borderRadius: 10,
                    width: "80%",
                  }}
                >
                  <Text style={{ fontSize: 18, marginBottom: 10 }}>
                    Update User Information
                  </Text>
                  {/* New Email input */}<Text>Email</Text>
                  <TextInput
                    placeholder="New Email"
                    style={styles.input}
                    value={newEmail}
                    onChangeText={setNewEmail}
                  />
                  {/* New First Name input */}
                  <Text>First Name</Text>
                  <TextInput
                    placeholder="New First Name"
                    style={styles.input}
                    value={newFirstName}
                    onChangeText={setNewFirstName}
                  />
                  {/* New Last Name input */}
                  <Text>Last Name</Text>
                  <TextInput
                    placeholder="New Last Name"
                    style={styles.input}
                    value={newLastName}
                    onChangeText={setNewLastName}
                  />
                  {/* New Mobile input */}
                  <Text>Mobile Number</Text>
                  <TextInput
                    placeholder="New Mobile"
                    style={styles.input}
                    value={newMobile}
                    onChangeText={setNewMobile}
                  />
                  
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {/* Update Info button */}
                    {isLoading && (
                      <View style={styles.activityIndicator}>
                        <ActivityIndicator size="large" color="#24255F" />
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={handleUpdateUserInfo}
                      style={styles.button}
                    >
                      <Text style={{ color: "white" }}>Update Info</Text>
                    </TouchableOpacity>
                    
                    {/* Cancel button */}
                    <Button
                      title="Cancel"
                      onPress={() => setShowModal1(false)}
                      color="red"
                    />
                  </View>
                </View>
              </View>
            </Modal>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: "#24255F",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleRolesModal}
              style={{
                backgroundColor: "#6495ED",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "white", fontSize: 16 }}>View Roles and Permissions</Text>
            </TouchableOpacity>
            {/* Roles and Permissions Modal */}
            <ScrollView>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showRolesModal}
              onRequestClose={toggleRolesModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Roles and Permissions</Text>
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleTitle}>Owner</Text>
                    <Text style={styles.permissionText}>
                      - Full access to all features and functionalities of the application
                    </Text>
                    <Text style={styles.permissionText}>
                      - Ability to manage user accounts, including creating, modifying, and deleting them
                    </Text>
                    <Text style={styles.permissionText}>
                      - Access to financial and sales reports
                    </Text>
                    <Text style={styles.permissionText}>
                      - Permission to manage product listings
                    </Text>
                    <Text style={styles.permissionText}>
                      - Configuration of settings and customization of the application
                    </Text>
                    <Text style={styles.permissionText}>
                      - Ability to set permissions for other users and roles within the application
                    </Text>
                    <Text style={styles.permissionText}>
                      - Access to customer data and order information for management and analysis
                    </Text>
                    <Text style={styles.permissionText}>
                      - Oversight of customer support activities and interactions
                    </Text>
                  </View>
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleTitle}>Customer</Text>
                    <Text style={styles.permissionText}>
                      - Ability to browse products, view product details, and search for specific items
                    </Text>
                    <Text style={styles.permissionText}>
                      - Permission to add items to a shopping cart and proceed to checkout
                    </Text>
                    <Text style={styles.permissionText}>
                      - Access to manage their personal account information, including addresses and payment methods
                    </Text>
                    <Text style={styles.permissionText}>
                      - Ability to view order history, track shipments, and initiate returns or exchange
                    </Text>
                    <Text style={styles.roleTitle}>Role</Text>
                    <Text style={styles.permissionText}>
                    Create and Secure Your Account: Provide accurate personal information, including a valid email address and phone number. Use a strong password . 

                    Keep Information Updated: Ensure your delivery address and contact details are current to avoid issues with order processing 
                    
                    Review Order Details: Double-check the items, quantities, and customizations before confirming your order to avoid mistakes 
                    
                    Inspect Upon Arrival: Check your order immediately upon arrival to ensure all items are correct and in good condition. 
                    </Text>
                  </View>
                  <TouchableOpacity onPress={toggleRolesModal} style={styles.closeButton}>
                    <Text style={{ color: "white" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default Profile;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#24255F",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: '30%',
  
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  permissionText: {
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: "#24255F",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
});