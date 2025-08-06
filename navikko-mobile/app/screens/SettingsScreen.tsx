import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../hooks/useLanguage';
import { geofenceService } from '../services/geofenceService';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [geofenceConfig, setGeofenceConfig] = useState(geofenceService.getConfig());
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [backgroundAlertsEnabled, setBackgroundAlertsEnabled] = useState(true);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
    { code: 'ko', name: '한국어' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'pl', name: 'Polski' },
    { code: 'es', name: 'Español' },
    { code: 'ro', name: 'Română' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
  };

  const handleGeofenceConfigChange = (key: string, value: any) => {
    const newConfig = { ...geofenceConfig, [key]: value };
    setGeofenceConfig(newConfig);
    geofenceService.updateConfig(newConfig);
  };

  const handleToggleAlerts = (enabled: boolean) => {
    setAlertsEnabled(enabled);
    if (!enabled) {
      setBackgroundAlertsEnabled(false);
    }
  };

  const handleToggleBackgroundAlerts = (enabled: boolean) => {
    if (!alertsEnabled) {
      Alert.alert(t('settings.alerts_disabled'), t('settings.enable_alerts_first'));
      return;
    }
    setBackgroundAlertsEnabled(enabled);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>

      {/* Language Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.languageGrid}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                currentLanguage === language.code && styles.activeLanguageButton,
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <Text
                style={[
                  styles.languageText,
                  currentLanguage === language.code && styles.activeLanguageText,
                ]}
              >
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Geofencing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.proximity_alerts')}</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.enable_alerts')}</Text>
            <Text style={styles.settingDescription}>
              {t('settings.enable_alerts_description')}
            </Text>
          </View>
          <Switch
            value={alertsEnabled}
            onValueChange={handleToggleAlerts}
            trackColor={{ false: '#767577', true: '#667eea' }}
            thumbColor={alertsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.background_alerts')}</Text>
            <Text style={styles.settingDescription}>
              {t('settings.background_alerts_description')}
            </Text>
          </View>
          <Switch
            value={backgroundAlertsEnabled}
            onValueChange={handleToggleBackgroundAlerts}
            trackColor={{ false: '#767577', true: '#667eea' }}
            thumbColor={backgroundAlertsEnabled ? '#fff' : '#667eea'}
            disabled={!alertsEnabled}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.alert_distance')}</Text>
            <Text style={styles.settingDescription}>
              {t('settings.alert_distance_description')}
            </Text>
          </View>
          <View style={styles.distanceButtons}>
            {[50, 100, 200].map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceButton,
                  geofenceConfig.alertDistances.includes(distance) && styles.activeDistanceButton,
                ]}
                onPress={() => {
                  const newDistances = geofenceConfig.alertDistances.includes(distance)
                    ? geofenceConfig.alertDistances.filter(d => d !== distance)
                    : [...geofenceConfig.alertDistances, distance].sort((a, b) => a - b);
                  handleGeofenceConfigChange('alertDistances', newDistances);
                }}
              >
                <Text
                  style={[
                    styles.distanceText,
                    geofenceConfig.alertDistances.includes(distance) && styles.activeDistanceText,
                  ]}
                >
                  {distance}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.quiet_hours')}</Text>
            <Text style={styles.settingDescription}>
              {t('settings.quiet_hours_description')}
            </Text>
          </View>
          <View style={styles.timeButtons}>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                // In a real app, this would open a time picker
                Alert.alert(t('settings.quiet_hours'), '10:00 PM - 8:00 AM');
              }}
            >
              <Text style={styles.timeText}>
                {geofenceConfig.quietHoursStart}:00 - {geofenceConfig.quietHoursEnd}:00
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>{t('settings.version')}</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>{t('settings.build')}</Text>
          <Text style={styles.aboutValue}>2024.01.01</Text>
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  activeLanguageButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  languageText: {
    fontSize: 14,
    color: '#666',
  },
  activeLanguageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  activeDistanceButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  activeDistanceText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeButtons: {
    flexDirection: 'row',
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#333',
  },
  aboutValue: {
    fontSize: 16,
    color: '#666',
  },
}); 