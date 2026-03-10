import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Please enter your email and password.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/mobile-login', {
                email: email.trim().toLowerCase(),
                password,
            });
            const { token, user } = response.data;
            await login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'center', padding: 24 }}
            >
                {/* Branding */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ fontSize: 56, marginBottom: 12 }}>🛡️</Text>
                    <Text style={{ fontSize: 32, fontWeight: '900', color: colors.textMain }}>UniSavers</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 15, marginTop: 6 }}>Student Privilege Platform</Text>
                </View>

                {/* Card */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ color: colors.textMain, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Sign In</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 24 }}>Access your student discounts</Text>

                    {error ? (
                        <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}>
                            <Text style={{ color: colors.error, fontSize: 13 }}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</Text>
                    <TextInput
                        style={[globalStyles.input, { marginBottom: 16 }]}
                        placeholder="your@email.com"
                        placeholderTextColor={colors.textMuted}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                    />

                    <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</Text>
                    <View style={{ position: 'relative', marginBottom: 24 }}>
                        <TextInput
                            style={globalStyles.input}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity
                            style={{ position: 'absolute', right: 14, top: 15 }}
                            onPress={() => setShowPassword(p => !p)}
                        >
                            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{showPassword ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[globalStyles.button, { opacity: loading ? 0.7 : 1 }]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={globalStyles.buttonText}>Sign In →</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>New to UniSavers? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={{ color: colors.primaryLight, fontWeight: '700', fontSize: 14 }}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
