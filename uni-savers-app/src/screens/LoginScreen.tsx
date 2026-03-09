import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { globalStyles, colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Note: We need a mobile-specific endpoint on Next.js to return JWT instead of setting a direct cookie
            const response = await api.post('/auth/mobile-login', { email, password });
            const { token, user } = response.data;
            await login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials or network error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[globalStyles.container, { justifyContent: 'center', padding: 20 }]}
        >
            <View style={globalStyles.glassCard}>
                <Text style={[globalStyles.title, { textAlign: 'center' }]}>Welcome Back</Text>
                <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>Sign in to access student deals</Text>

                {error ? (
                    <Text style={{ color: colors.error, marginBottom: 15, textAlign: 'center' }}>{error}</Text>
                ) : null}

                <TextInput
                    style={globalStyles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={globalStyles.input}
                    placeholder="Password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={globalStyles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={globalStyles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                    <Text style={globalStyles.text}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={{ color: colors.primaryLight, fontWeight: 'bold' }}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
