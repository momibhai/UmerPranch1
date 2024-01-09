import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import externalStyle from '../components/externalStyle';

const PaymentInformation = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const databaseName = 'Pranch.db';
  const db = SQLite.openDatabase({ name: databaseName, location: 'default' });

  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  const fetchCustomers = () => {
    const query = `
      SELECT
        Rentals.rental_id,
        Customers.customer_id,
        Customers.customer_name,
        Customers.customer_nic,
        Customers.customer_phone,
        Customers.customer_address,
        Rentals.rental_date,
        Rentals.return_date,
        Rentals.paid_status,
        Rentals.total_rent,
        Products.product_name,
        Products.product_id,
        Products.product_price,
        Rentals.quantity
      FROM Customers
      LEFT JOIN Rentals ON Customers.customer_id = Rentals.customer_id
      LEFT JOIN Products ON Rentals.product_id = Products.product_id
      WHERE Customers.customer_name LIKE ? OR Customers.customer_nic LIKE ? OR Customers.customer_phone LIKE ?
      ORDER BY Rentals.customer_id DESC, Products.product_id
    `;

    const params = [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`];

    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => {
          const { rows } = result;
          if (rows) {
            const dataArray = [];
            let currentCustomer = null;

            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              if (!currentCustomer || currentCustomer.customer_id !== item.customer_id) {
                currentCustomer = {
                  customer_id: item.customer_id,
                  customer_name: item.customer_name,
                  customer_nic: item.customer_nic,
                  customer_phone: item.customer_phone,
                  customer_address: item.customer_address,
                  rental_date: item.rental_date,
                  return_date: item.return_date,
                  paid_status: item.paid_status,
                  products: [],
                  totalPrice: 0,
                };
                dataArray.push(currentCustomer);
              }

              currentCustomer.products.push({
                product_id: item.product_id,
                product_name: item.product_name,
                product_price: item.product_price,
                quantity: item.quantity,
              });

              currentCustomer.totalPrice += item.product_price * item.quantity;
            }

            setSearchResults(dataArray.slice((currentPage - 1) * 20, currentPage * 20));
            setTotalPages(Math.ceil(dataArray.length / 20));
          }
        },
        (error) => {
          console.error('SQL error:', error);
        }
      );
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const formatDateTime = (dateTimeString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'UTC',
    };

    return isValidDate(dateTimeString)
      ? new Date(dateTimeString).toLocaleString('en-US', options)
      : 'Invalid Date';
  };

  const renderCustomerItem = ({ item }) => (
    
    <View style={styles.customerItem}>
      <Text style={externalStyle.textSize}>
      <Text style={externalStyle.textSize}>Customer Name : </Text> {item.customer_name}
      </Text>
      <Text style={externalStyle.textSize}>Customer NIC: {item.customer_nic}</Text>
      <Text style={externalStyle.textSize}>Customer Phone: {item.customer_phone}</Text>
      <Text style={externalStyle.textSize}>Customer Address: {item.customer_address}</Text>
      <Text style={externalStyle.textSize}>Start Date: {formatDateTime(item.rental_date)}</Text>
      {item.return_date ? <Text style={externalStyle.textSize}>Return Date : {item.return_date}</Text> : <Text style={externalStyle.textSize}>No Return</Text>}

      {item.products.reduce((uniqueProducts, product) => {
        const existingProduct = uniqueProducts.find((p) => p.product_name === product.product_name);
        if (existingProduct) {
          existingProduct.quantity += product.quantity;
        } else {
          uniqueProducts.push({ ...product });
        }
        return uniqueProducts;
      }, []).map((uniqueProduct, index) => (
        <View key={index}>
          <Text style={externalStyle.textSize}>Product Name: {uniqueProduct.product_name}</Text>
          <Text style={externalStyle.textSize}>Product Price: {uniqueProduct.product_price}</Text>
          <Text style={externalStyle.textSize}>Quantity: {uniqueProduct.quantity}</Text>
        </View>
      ))}

      {item.totalPrice && <Text style={externalStyle.textSize}>One Day Total Price: {item.totalPrice}</Text>}
      {item.paid_status === 1 ? (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('PayNowScreen', { rentalId: item.rental_id, customer: item });
          }}
          style={{ backgroundColor: '#88da09', padding: 10, borderRadius: 5 }}
        >
          <Text style={{color:'white',fontWeight:'600',textAlign:'center',fontSize:16}}>Paid</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('PayNowScreen', { rentalId: item.rental_id, customer: item });
          }}
          style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}
        >
          <Text style={{color:'white',fontWeight:'600',textAlign:'center',fontSize:16}}>Not Paid</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  {
    // console.log('====================================');
    // console.log(searchResults);
    // console.log('====================================');
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
      style={styles.searchInput}
      placeholder="Search by Name, NIC, or Phone"
      value={searchQuery}
      onChangeText={(text) => {
        setSearchQuery(text);
        setCurrentPage(1); // Reset to the first page whenever search text changes
        fetchCustomers(); // Fetch customers as you type
      }}
    />
      <Button title="Search"  color={'#88da09'} onPress={() => setCurrentPage(1)} />
      <FlatList 
        data={searchResults}
        keyExtractor={(item) => `${item.customer_id}`}
        renderItem={renderCustomerItem}
      />
      <View style={{ marginBottom:100 }}></View>

      <View style={styles.pagination}>
        <Button title="Previous" color={'green'} onPress={handlePrevPage} disabled={currentPage === 1} />
        <Text style={externalStyle.textSize}>{currentPage} / {totalPages}</Text>
        <Button title="Next" color={'green'} onPress={handleNextPage} disabled={currentPage === totalPages} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    padding: 10,
  },
  customerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  pagination: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
});

export default PaymentInformation;
