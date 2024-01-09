import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import RNFetchBlob from 'rn-fetch-blob';

const UploadDatabase = () => {

    const uploadDatabase = async () => {
        try {
            // Specify the correct path to your database file
            const databasePath = '/data/data/com.grid/databases/Pranch.db';
    
            // const response = await RNFetchBlob.fetch('POST', 'http://10.0.2.2:8000/api/upload-database', {
            const response = await RNFetchBlob.fetch('POST', 'https://alilaravel.mangomotar.com/public/api/upload-database', {
                'Content-Type': 'multipart/form-data',
            }, [
                {
                    name: 'database',
                    filename: 'Pranch.db',
                    data: RNFetchBlob.wrap(databasePath)
                }
            ]);
            
            const responseData = response.json();
            console.log('Server Response:', responseData);
            Alert.alert('Success', responseData.message);
    
        } catch (error) {
            console.error('Error uploading database:', error);
            Alert.alert('Error', 'Failed to upload database. Please try again.');
        }
    };


  return (
    <View style={{ flex:1, justifyContent:'center' }}>
        <Text style={{ fontSize:25,fontWeight:'800',textAlign:'center', }}>Upload Your Database </Text>
        <Text style={{ fontSize:25,fontWeight:'800',textAlign:'center', marginBottom:20, }}>To Server</Text>
        <View style={{ width:'70%',alignSelf:'center' }}>
      <Button
      color={'#88da09'}
        title='Upload Database'
        onPress={uploadDatabase}
      />
      </View>
    </View>
  )
}

export default UploadDatabase;

