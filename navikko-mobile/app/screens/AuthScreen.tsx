import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { authService } from '../services/supabase';

interface AuthScreenProps {
  navigation: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwords_dont_match'));
      return;
    }

    if (isSignUp && password.length < 6) {
      Alert.alert(t('common.error'), t('auth.password_too_short'));
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authService.signUp(email, password);
        if (error) {
          Alert.alert(t('common.error'), error.message);
        } else {
          Alert.alert(t('common.success'), t('auth.sign_up_success'));
        }
      } else {
        const { error } = await authService.signIn(email, password);
        if (error) {
          Alert.alert(t('common.error'), error.message);
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Navikko</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? t('auth.create_account') : t('auth.sign_in')}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder={t('auth.confirm_password')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? t('auth.sign_up') : t('auth.sign_in')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchText}>
            {isSignUp ? t('auth.already_have_account') : t('auth.dont_have_account')}
          </Text>
        </TouchableOpacity>

        {!isSignUp && (
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>{t('auth.forgot_password')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  switchText: {
    color: '#667eea',
    fontSize: 16,
  },
  forgotButton: {
    alignItems: 'center',
  },
  forgotText: {
    color: '#666',
    fontSize: 14,
  },
}); 