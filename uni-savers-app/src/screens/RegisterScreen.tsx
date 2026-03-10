import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { globalStyles, colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

type Institution = { id: string; name: string; type: string };

export default function RegisterScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    // Institution picker state
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
    const [showPicker, setShowPicker] = useState(false);
    const [searchInstitution, setSearchInstitution] = useState('');

    useEffect(() => {
        api.get('/institutions').then(res => {
            setInstitutions(Array.isArray(res.data) ? res.data : []);
        }).catch(() => { });
    }, []);

    const filteredInstitutions = institutions.filter(i =>
        i.name.toLowerCase().includes(searchInstitution.toLowerCase())
    );

    const groupedInstitutions = {
        UNIVERSITY: filteredInstitutions.filter(i => i.type === 'UNIVERSITY'),
        SCHOOL: filteredInstitutions.filter(i => i.type === 'SCHOOL'),
    };

    const handleRegister = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/mobile-register', {
                name,
                email,
                password,
                institutionId: selectedInstitution?.id || null,
            });
            const { token, user } = response.data;
            await login(token, user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Email might already be in use.');
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
                        placeholder="University / School Email"
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

                    {/* Institution Picker */}
                    <TouchableOpacity
                        style={[globalStyles.input, {
                            justifyContent: 'center',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        } as any]}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={{ color: selectedInstitution ? colors.textMain : colors.textMuted, flex: 1 }}>
                            {selectedInstitution ? selectedInstitution.name : 'Select your institution (optional)'}
                        </Text>
                        <Text style={{ color: colors.textMuted }}>▾</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[globalStyles.button, { opacity: loading ? 0.7 : 1 }]}
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

            {/* Institution Picker Modal */}
            <Modal
                visible={showPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: colors.surface,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        maxHeight: '80%',
                        paddingTop: 20,
                    }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
                            <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold' }}>Select Institution</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                            <TextInput
                                style={globalStyles.input}
                                placeholder="Search..."
                                placeholderTextColor={colors.textMuted}
                                value={searchInstitution}
                                onChangeText={setSearchInstitution}
                            />
                        </View>

                        <FlatList
                            data={[
                                { header: 'Universities', items: groupedInstitutions.UNIVERSITY },
                                { header: 'Schools', items: groupedInstitutions.SCHOOL },
                            ]}
                            keyExtractor={item => item.header}
                            renderItem={({ item: group }) =>
                                group.items.length === 0 ? null : (
                                    <View>
                                        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                            {group.header.toUpperCase()}
                                        </Text>
                                        {group.items.map(inst => (
                                            <TouchableOpacity
                                                key={inst.id}
                                                style={{
                                                    paddingHorizontal: 20,
                                                    paddingVertical: 14,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: colors.border,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: selectedInstitution?.id === inst.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                                                }}
                                                onPress={() => {
                                                    setSelectedInstitution(inst);
                                                    setShowPicker(false);
                                                }}
                                            >
                                                <Text style={{ color: colors.textMain, fontSize: 15 }}>{inst.name}</Text>
                                                {selectedInstitution?.id === inst.id && (
                                                    <Text style={{ color: colors.primary }}>✓</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )
                            }
                            ListFooterComponent={<View style={{ height: 40 }} />}
                        />
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
