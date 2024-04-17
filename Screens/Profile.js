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
  ActivityIndicator
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
            <Text className="text-2xl font-bold mt-3 ml-2">
              {userData.Lname},{userData.Fname}
            </Text>
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
      </View>
      </View>
    </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default Profile;
const styles = {
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
};