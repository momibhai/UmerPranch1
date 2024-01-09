import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, Alert, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const databaseName = 'Pranch.db';
const database = SQLite.openDatabase({ name: databaseName, location: 'default' });

database.transaction((tx) => {
  // Create Products Table
  tx.executeSql(
    `
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY,
      product_name TEXT,
      product_price REAL
    );      
    `,
    [],
    () => console.log('Products table created successfully'),
    (_, error) => console.error('Error creating Products table', error)
  );

  // Create Customers Table
  tx.executeSql(
    `
    CREATE TABLE IF NOT EXISTS Customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_nic TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT,
      pickup_date TEXT NOT NULL,
      paid INTEGER DEFAULT 0 
    );      
    `,
    [],
    () => console.log('Customers table created successfully'),
    (_, error) => console.error('Error creating Customers table', error)
  );

  // Create Rentals Table
  tx.executeSql(
    `
    CREATE TABLE IF NOT EXISTS rentals (
      rental_id INTEGER PRIMARY KEY,
      customer_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      rental_date DATE,
      return_date DATE,
      rental_days INTEGER,
      total_rent REAL,
      paid_status BOOLEAN,
      total_amount REAL, -- Add this line for the total_amount column
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
  );
        
    `,
    [],
    () => console.log('Rentals table created successfully'),
    (_, error) => console.error('Error creating Rentals table', error)
  );
});

const AddProducts = () => {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [fetchingProducts, setFetchingProducts] = useState([]);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateProductName, setUpdateProductName] = useState('');
  const [updateProductPrice, setUpdateProductPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    database.transaction((tx) => {
      tx.executeSql(`SELECT * FROM products ORDER BY product_id DESC`, [], (_, results) => {
        const len = results.rows.length;
        const items = [];
        for (let i = 0; i < len; i++) {
          const row = results.rows.item(i);
          items.push(row);
        }
        setFetchingProducts(items);
      });
    });
  };

  const handleDelete = (productId) => {
    setSelectedProductId(productId);
    Alert.alert('Confirmation', 'Do you want to Delete Product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: () => setPasswordModalVisible(true),
      },
    ]);
  };

  const deleteProduct = (productId) => {
    database.transaction((tx) => {
      tx.executeSql(`DELETE FROM products WHERE product_id = ?`, [productId], (_, results) => {
        if (results.rowsAffected > 0) fetchProducts();
        else alert('Error deleting product');
      });
    });
  };

  const handleUpdate = () => {
    if (!updateProductName.trim() || !updateProductPrice.trim()) {
      alert('Please fill in all fields');
      return;
    }
    database.transaction((tx) => {
      tx.executeSql(`UPDATE products SET product_name = ?, product_price = ? WHERE product_id = ?`, [updateProductName, updateProductPrice, selectedProductId], (_, results) => {
        if (results.rowsAffected > 0){
          fetchProducts();
          Alert.alert('Success','Product Updated Successfully!');
          setUpdateModalVisible(false) ;
        } 
        else alert('Error updating product');
      });
    });
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '12345') {
      deleteProduct(selectedProductId);
      Alert.alert('Success', 'Product Deleted');
      setPasswordModalVisible(false);
    } else {
      Alert.alert('Error', 'Incorrect Password. Please try again.');
    }
  };

  const addProduct = () => {
    if (!productName.trim() || !productPrice.trim()) {
      alert('Please fill in all fields');
      return;
    }
    database.transaction((tx) => {
      tx.executeSql(`INSERT INTO products (product_name, product_price) VALUES (?, ?)`, [productName, productPrice], (_, results) => {
        if (results.rowsAffected > 0) {
          fetchProducts();
          Alert.alert('Success', 'Product Added Successfully!');
          setProductName('');
          setProductPrice('');
        } else alert('Error adding product');
      });
    });
  };

  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <View style={{ alignSelf: 'center' }}>
        <TextInput 
          style={styles.textInput}
          placeholder="Product Name"
          value={productName}
          onChangeText={setProductName}
        />
        <TextInput 
          style={styles.textInput}
          placeholder="Product Price"
          keyboardType="numeric"
          value={productPrice}
          onChangeText={setProductPrice}
        />
        <View style={{ marginTop:10 }}>
          <Button title="Add Product" color={'#88da09'} onPress={addProduct} />
        </View>
      </View>
      <ScrollView>
        <View style={styles.fetchedProductsContainer}>
          <Text style={{ fontSize: 20, margin: 35, textAlign: 'center' }}>List Of Current Products</Text>
          {fetchingProducts.length > 0 ? fetchingProducts.map(item => (
            <View key={item.product_id} style={styles.CardView}>
              <Text style={styles.productsText}>Product Name: {item.product_name}</Text>
              <Text style={styles.productsText}>Price: {item.product_price}</Text>
              <View style={styles.imageContainer}>
                <TouchableOpacity onPress={() => handleDelete(item.product_id)}>
                  <Image source={require('../components/image/delete.png')} style={{ width: 30, height: 30, tintColor: 'red' }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setUpdateProductName(item.product_name);
                  setUpdateProductPrice(item.product_price.toString());
                  setSelectedProductId(item.product_id);
                  setUpdateModalVisible(true);
                }}>
                  <Image source={require('../components/image/edit.png')} style={{ width: 30, height: 30, marginLeft: 10, marginTop: 2 }} />
                </TouchableOpacity>
              </View>
            </View>
          )) : <Text style={{ fontSize: 18, textAlign: 'center', marginTop: 20 }}>No Products Available</Text>}
        </View>
        <View style={{ marginBottom:50 }}></View>
      </ScrollView>

      <Modal
        visible={updateModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Update Product</Text>
            <TextInput 
              style={styles.input}
              placeholder="Product Name"
              value={updateProductName}
              onChangeText={setUpdateProductName}
            />
            <TextInput 
              style={styles.input}
              placeholder="Product Price"
              keyboardType="numeric"
              value={updateProductPrice}
              onChangeText={setUpdateProductPrice}
            />
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <Button title="Update Now" color={'#88da09'} onPress={handleUpdate} />
              <View style={{ marginLeft:10 }}></View>
              <Button title="Cancel" color={'red'} onPress={() => setUpdateModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={passwordModalVisible} transparent={true} animationType="fade">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Please enter the password to continue:</Text>
            <TextInput
              style={styles.input}
              secureTextEntry={true}
              placeholder="Enter Password"
              onChangeText={(text) => setPasswordInput(text)}
            />
            <View style={{ flexDirection:'row' }}>
              <Button title="Submit"  color={'#88da09'} onPress={handlePasswordSubmit} />
              <View style={{ marginLeft:10 }}>
                <Button title="Cancel"  color={'red'} onPress={()=>setPasswordModalVisible(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default AddProducts;

const styles = StyleSheet.create({
  textInput: {
    marginTop: 5,
    borderColor: 'gray',
    borderWidth: 2,
    height: 36,
    width: 200
  },
  fetchedProductsContainer: {
    marginLeft: 10
  },
  productsText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  CardView: {
    height: 80,
    width: '85%',
    backgroundColor: '#88da09',
    alignSelf: 'center',
    borderRadius: 10,
    marginVertical: 10,
    padding: 10
  },
  imageContainer: {
    height: 40,
    width: 100,
    alignSelf: 'flex-end',
    marginTop: -35,
    flexDirection: 'row',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  input: {
    height: 40,
    width: 200,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 10,
  },
});
