// Profile.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Adjust based on your Firebase configuration
import { getDoc, doc, getFirestore } from 'firebase/firestore'; // Adjust based on your Firebase configuration

function Profile() {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchUserData = async () => {
      const db= getFirestore();
      if (currentUser) {
        // Assuming you have a 'users' collection in Firestore
        const userDocRef = doc(db, 'Users', currentUser.uid);

        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const fetchedUserData = userDocSnap.data();
            setUserData(fetchedUserData);
            console.log(userData);
          } else {
            console.error('User document not found.');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <View>
      <Text>Profile</Text>
      {userData ? (
        <>
          <Text>Name: {userData.Fname}</Text>
          <Text>Name: {userData.Lname}</Text>
          <Text>Email: {userData.email}</Text>
          {/* Display other user information as needed */}
        </>
      ) : (
        <Text>Loading user data...</Text>
      )}
    </View>
  );
}

export default Profile;
