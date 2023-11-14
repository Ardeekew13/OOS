import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert, ActivityIndicator } from 'react-native';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  setDoc,
  doc,
} from 'firebase/firestore';

const UserProfile = ({ route }) => {
  const { user } = route.params;
  const [isAccountDisabled, setIsAccountDisabled] = useState(user.warning === 3);
  const [isLoading,setIsLoading]= useState(false);

  const handleWarning = () => {
    Alert.alert(
      'Confirm Account Disable',
      'Are you sure you want to disable this account?',
      [
        {
          text: 'Cancel',
          onPress: () => {
            // User canceled, do nothing
          },
          style: 'cancel',
        },
        {
          text: 'Disable Account',
          onPress: async () => {
            // Start the loading state
            setIsLoading(true);
  
            try {
              const firestore = getFirestore();
              const userRef = doc(firestore, 'User', user.id);
  
              const newWarningCount = 3; // Set the warning count to 3 directly
              const isAccountNowDisabled = true; // Account is disabled
  
              const dataToUpdate = {
                lastWarningTime: new Date(),
                warning: newWarningCount,
                isAccountDisabled: true,
              };
  
              await setDoc(userRef, dataToUpdate, { merge: true });
  
              // Update the local state to reflect the change
              setIsAccountDisabled(isAccountNowDisabled);
  
              Alert.alert('Account Disabled', 'The user account has been disabled.');
            } catch (error) {
              console.error('Error updating account:', error);
            } finally {
              // Stop the loading state
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image style={{ width: 180, height: 180, margin: 10, borderRadius: 90 }} source={{ uri: user.selfiePicture }} />
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.text}>{user.Fname} {user.Lname}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.text}>{user.email}</Text>

      <Text style={styles.label}>Role:</Text>
      <Text style={styles.text}>{user.role}</Text>

      <Text style={styles.label}>Phone Number:</Text>
      <Text style={styles.text}>{user.phone}</Text>

    <Button
      title={isAccountDisabled ? 'Disabled' : 'Disable Account'}
      color={isAccountDisabled ? 'gray' : 'red'}
      disabled={isAccountDisabled || isLoading} // Disable the button while loading
      onPress={handleWarning}
    >
      {isLoading ? <ActivityIndicator color="white" /> : null}
    </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
});

export default UserProfile;
