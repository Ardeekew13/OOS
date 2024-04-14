import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from './firebaseConfig'; // Import storage from firebaseConfig
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditProduct({ route, navigation }) {
  const { productData } = route.params;
  const productId = productData.id;
  const [loading, setLoading] = useState(false);

  // Define state variables for each field of the product
  const [productName, setProductName] = useState(productData.product_Name);
  const [price, setPrice] = useState(String(productData.Price));
  const [quantity, setQuantity] = useState(String(productData.qty));
  const [category, setCategory] = useState(productData.Category);
  const [image, setImage] = useState(productData.image);

  // Ref for the upload task to track the upload progress
  const uploadTaskRef = useRef(null);

  // Function to handle updating the product
  const handleUpdateProduct = async () => {
    setLoading(true); // Set loading state to true during update

    try {
      // Update the document in Firestore
      await updateDoc(doc(db, 'Products', productId), {
        product_Name: productName,
        Price: parseFloat(price), // Convert price to a number if necessary
        qty: parseInt(quantity), // Convert quantity to a number if necessary
        Category: category,
        image: image, // Update image field
        // Update other fields as needed
      });

      // Navigate back to the product listing screen
      navigation.goBack();
      Alert.alert('Success', 'Product updated successfully.');
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product. Please try again later.');
    } finally {
      setLoading(false); // Set loading state to false after update
    }
  };

  // Function to handle selecting a new image
  const handleSelectImage = async () => {
    setLoading(true); // Set loading state to true before selecting image
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant permission to access the photo library.');
        setLoading(false); // Set loading state to false if permission is denied
        return;
      }
    
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    
      processImageResult(result); // Call the processing function with the result
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again later.');
      setLoading(false); // Set loading state to false after error
    }
  };
  
  const processImageResult = async (result) => {
    if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
      const uri = result.assets[0].uri; // Get the URI from the assets array
      // Handle the image processing here
      setLoading(true); // Set loading state to true during image upload
      try {
        // Upload the selected image file and get its download URL
        const downloadURL = await uploadImageAndGetURL(uri);
        if (downloadURL) {
          // Update the image state with the new download URL
          setImage(downloadURL);
        } else {
          console.error('Failed to get download URL for the uploaded image.');
          Alert.alert('Error', 'Failed to upload image. Please try again later.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again later.');
      } finally {
        setLoading(false); // Set loading state to false after image processing
      }
    } else {
      console.error("Error selecting image: URI is null or undefined.");
      Alert.alert('Error', 'Failed to select image. Please try again later.');
    }
  };
  const uploadImageAndGetURL = async (uri) => {
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, 'images/' + Date.now()); // Use a unique filename
      
      // Convert URI to Blob
      const response = await fetch(uri);
      const blob = await response.blob();
  
      // Upload the file to the storage location
      await uploadBytes(storageRef, blob);
  
      // Get the download URL for the uploaded file
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ flex: 1 }}>
          <View style={{ backgroundColor: '#24255F', height: 112 }} />
          <View style={{ backgroundColor: '#ffffff', width: 288, height: 48, justifyContent: 'center', alignItems: 'center' }} className="mx-auto bottom-5">
            <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#24255F' }}>Products</Text>
          </View>
          <View style={{ padding: 20 }}>
            {/* Display the current image */}
            {image && (
              <View style={{ marginBottom: 10, flex: 1, justifyContent: 'center', marginBottom: 50, alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Current Image:</Text>
                <Image source={{ uri: image }} style={{ width: 200, height: 180, borderRadius: 5 }} />
              </View>
            )}
            {/* Button to select a new image */}
            <TouchableOpacity
              style={{ backgroundColor: '#42a5f5', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 }}
              onPress={handleSelectImage}
              disabled={loading} // Disable button when loading
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? 'Uploading...' : 'Select New Image'}</Text>
            </TouchableOpacity>

            {/* Input field for product name */}
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Product Name:</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
              value={productName}
              onChangeText={setProductName}
              editable={!loading} // Disable input field when loading
            />

            {/* Input field for price */}
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Price:</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              editable={!loading} // Disable input field when loading
            />

            {/* Input field for quantity */}
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Quantity:</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 }}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              editable={!loading} // Disable input field when loading
            />

            {/* Dropdown for category */}
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Category:</Text>
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={{ borderWidth: 3, borderColor: 'black', borderRadius: 5, marginBottom: 10 }}
              enabled={!loading} // Disable picker when loading
            >
              <Picker.Item label="Fish" value="Fish" />
              <Picker.Item label="Shellfish" value="Shellfish" />
              <Picker.Item label="Squid & Octopus" value="Squid & Octopus" />
              <Picker.Item label="Seaweeds" value="Seaweeds" />
            </Picker>

            <TouchableOpacity
              style={{ backgroundColor: '#42a5f5', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 20 }}
              onPress={handleUpdateProduct}
              disabled={loading} // Disable button when loading
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? 'Updating...' : 'Update Product'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
