// Profile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  SafeAreaView,
} from "react-native";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updatePassword,
} from "firebase/auth";
import { getDoc, doc, getFirestore } from "firebase/firestore";
import { AntDesign, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

function Profile() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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
        // Assuming you have a 'users' collection in Firestore
        const userDocRef = doc(db, "Users", currentUser.uid);

        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data();
            setUserData(fetchedUserData);
            console.log(userData);
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
      // Close the modal after password change
      setShowModal(false);
      // Optionally, you can provide feedback to the user that the password has been changed successfully.
    } catch (error) {
      console.error("Error changing password:", error);
      // Optionally, you can provide feedback to the user that an error occurred during password change.
    }
  };

  return (
    <SafeAreaView>
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
    </SafeAreaView>
  );
}

export default Profile;
