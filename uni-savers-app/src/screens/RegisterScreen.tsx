import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { globalStyles, colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function RegisterScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Need a mobile-specific registration endpoint that returns JWT
            const response = await api.post('/auth/mobile-register', { name, email, password, institutionId: null });
            const { token, user } = response.data;
            await login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Email might be in use.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={globalStyles.container}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                <View style={globalStyles.glassCard}>
                    <Text style={[globalStyles.title, { textAlign: 'center' }]}>Create Account</Text>
                    <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>Join the student network</Text>

                    {error ? (
                        <Text style={{ color: colors.error, marginBottom: 15, textAlign: 'center' }}>{error}</Text>
                    ) : null}

                    <TextInput
                        style={globalStyles.input}
                        placeholder="Full Name"
                        placeholderTextColor={colors.textMuted}
                        value={name}
                        onChangeText={setName}
                    />

                    <TextInput
                        style={globalStyles.input}
                        placeholder="University Email"
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
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={globalStyles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        <Text style={globalStyles.text}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={{ color: colors.primaryLight, fontWeight: 'bold' }}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
