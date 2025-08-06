import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../hooks/useLanguage';
import { geofenceService } from '../services/geofenceService';

interface ActivityScreenProps {
  navigation: any;
}

interface ProximityAlert {
  restaurantId: string;
  restaurantName: string;
  distance: number;
  timestamp: number;
  alertType: 'gentle' | 'reminder' | 'alarm';
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<ProximityAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'orders' | 'reservations'>('alerts');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    // In a real app, this would load from persistent storage
    // For now, we'll show a sample alert
    const sampleAlerts: ProximityAlert[] = [
      {
        restaurantId: '1',
        restaurantName: 'Sakura Sushi',
        distance: 150,
        timestamp: Date.now() - 300000, // 5 minutes ago
        alertType: 'reminder',
      },
      {
        restaurantId: '2',
        restaurantName: 'Pizza Palace',
        distance: 75,
        timestamp: Date.now() - 600000, // 10 minutes ago
        alertType: 'alarm',
      },
    ];
    setAlerts(sampleAlerts);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'alarm':
        return 'alert-circle';
      case 'reminder':
        return 'notifications';
      case 'gentle':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'alarm':
        return '#ff4757';
      case 'reminder':
        return '#ffa502';
      case 'gentle':
        return '#2ed573';
      default:
        return '#747d8c';
    }
  };

  const renderAlertItem = ({ item }: { item: ProximityAlert }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertIcon}>
        <Ionicons
          name={getAlertIcon(item.alertType) as any}
          size={24}
          color={getAlertColor(item.alertType)}
        />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{item.restaurantName}</Text>
        <Text style={styles.alertSubtitle}>
          {item.distance}m away • {formatTimeAgo(item.timestamp)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.alertAction}
        onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: item.restaurantId })}
      >
        <Ionicons name="chevron-forward" size={20} color="#667eea" />
      </TouchableOpacity>
    </View>
  );

  const renderTabButton = (tab: 'alerts' | 'orders' | 'reservations', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#fff' : '#667eea'}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('activity.title')}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('alerts', t('activity.alerts'), 'notifications')}
        {renderTabButton('orders', t('activity.orders'), 'receipt')}
        {renderTabButton('reservations', t('activity.reservations'), 'calendar')}
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'alerts' && (
          <View>
            {alerts.length > 0 ? (
              <FlatList
                data={alerts}
                renderItem={renderAlertItem}
                keyExtractor={(item) => `${item.restaurantId}-${item.timestamp}`}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>{t('activity.no_alerts')}</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>{t('activity.no_orders')}</Text>
          </View>
        )}

        {activeTab === 'reservations' && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>{t('activity.no_reservations')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  alertAction: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
}); 