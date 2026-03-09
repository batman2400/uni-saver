import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { globalStyles, colors } from '../theme';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await api.get('/student/redemptions');
            setRedemptions(res.data || []);
        } catch (error) {
            console.error('Failed to fetch profile data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadID = () => {
        // In a real device environment, we would use expo-image-picker here.
        // For the sake of this prototype, we'll simulate the upload.
        Alert.alert(
            "Upload ID",
            "This would open the native Image Picker to snap a photo of your Student ID.",
            [{ text: "Simulate Upload", onPress: simulateUpload }, { text: "Cancel", style: "cancel" }]
        );
    };

    const simulateUpload = async () => {
        Alert.alert("Success", "Student ID uploaded and is pending review by administrators.");
    };

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", onPress: logout, style: "destructive" }
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return colors.success;
            case 'PENDING': return colors.accent;
            case 'REJECTED': return colors.error;
            default: return colors.textMuted;
        }
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
                {/* Header Profile Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                    <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{user?.name?.charAt(0) || 'U'}</Text>
                    </View>
                    <View>
                        <Text style={[globalStyles.title, { marginBottom: 4, fontSize: 24 }]}>{user?.name}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 8 }}>{user?.email}</Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
                            <Text style={{ color: getStatusColor(user?.verificationStatus || 'UNVERIFIED'), fontSize: 12, fontWeight: 'bold' }}>
                                {user?.verificationStatus || 'UNVERIFIED'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Identity Verification Section */}
                <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Identity Verification</Text>
                <View style={[globalStyles.glassCard, { marginBottom: 32, alignItems: 'center', paddingVertical: 24 }]}>
                    <Text style={{ fontSize: 40, marginBottom: 16 }}>📸</Text>
                    <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>Student ID Card</Text>
                    <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 }}>
                        {user?.verificationStatus === 'APPROVED'
                            ? "Your identity is verified. You have full access to all privileges."
                            : "Upload a clear photo of your university ID card to unlock premium discounts."}
                    </Text>

                    {user?.verificationStatus !== 'APPROVED' && (
                        <TouchableOpacity style={[globalStyles.button, { width: '80%', backgroundColor: colors.surfaceHighlight, borderWidth: 1, borderColor: colors.primary }]} onPress={handleUploadID}>
                            <Text style={{ color: colors.primaryLight, fontWeight: 'bold' }}>Upload Document</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Redemption History */}
                <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>My History ({redemptions.length})</Text>

                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                ) : redemptions.length === 0 ? (
                    <View style={{ alignItems: 'center', padding: 20, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
                        <Text style={{ color: colors.textMuted }}>No offers redeemed yet.</Text>
                    </View>
                ) : (
                    redemptions.map(r => (
                        <View key={r.id} style={[globalStyles.glassCard, { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                            <View>
                                <Text style={{ color: colors.textMain, fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{r.offer?.title}</Text>
                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Redeemed {new Date(r.redeemedAt).toLocaleDateString()}</Text>
                            </View>
                            <Text style={{ color: colors.secondaryLight, fontWeight: '900', letterSpacing: 1 }}>{r.promoCode}</Text>
                        </View>
                    ))
                )}

                {/* Log Out Button */}
                <TouchableOpacity style={{ marginTop: 40, padding: 16, alignItems: 'center' }} onPress={handleLogout}>
                    <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>Sign Out Device</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
