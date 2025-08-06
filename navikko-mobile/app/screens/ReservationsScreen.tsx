import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ReservationsScreenProps {
  navigation: any;
  route: any;
}

export const ReservationsScreen: React.FC<ReservationsScreenProps> = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reservations Screen</Text>
      <Text style={styles.subtext}>Book tables and manage reservations</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
}); 