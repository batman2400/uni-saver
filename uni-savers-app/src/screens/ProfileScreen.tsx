import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { globalStyles, colors } from '../theme';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout, updateUser } = useAuth();
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const res = await api.get('/student/redemptions');
            setRedemptions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch profile data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadID = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library to upload your student ID.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled) return;

        const asset = result.assets[0];

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('studentId', {
                uri: asset.uri,
                name: asset.fileName || 'student_id.jpg',
                type: asset.mimeType || 'image/jpeg',
            } as any);

            await api.post('/student/verify', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Update the user status optimistically
            await updateUser({ verificationStatus: 'PENDING' });
            Alert.alert('✅ Uploaded!', 'Your student ID is pending admin review. You will be notified once approved.');
        } catch (err: any) {
            Alert.alert('Upload Failed', err.response?.data?.error || 'Could not upload your student ID. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', onPress: logout, style: 'destructive' },
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'APPROVED': return '✅ Verified';
            case 'PENDING': return '⏳ Pending Review';
            case 'REJECTED': return '❌ Rejected';
            default: return '⚠️ Unverified';
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
                                {getStatusLabel(user?.verificationStatus || 'UNVERIFIED')}
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
                            ? 'Your identity is verified. You have full access to all privileges.'
                            : user?.verificationStatus === 'PENDING'
                                ? 'Your ID is under review. We will approve it shortly.'
                                : 'Upload a clear photo of your university ID card to unlock premium discounts.'}
                    </Text>

                    {user?.verificationStatus !== 'APPROVED' && user?.verificationStatus !== 'PENDING' && (
                        <TouchableOpacity
                            style={[globalStyles.button, { width: '80%', backgroundColor: uploading ? colors.surfaceHighlight : colors.primary, opacity: uploading ? 0.7 : 1 }]}
                            onPress={handleUploadID}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={globalStyles.buttonText}>📎 Upload Document</Text>
                            )}
                        </TouchableOpacity>
                    )}

                    {user?.verificationStatus === 'PENDING' && (
                        <View style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.accent }}>
                            <Text style={{ color: colors.accent, fontSize: 13, textAlign: 'center' }}>⏳ Your ID is being reviewed by our team</Text>
                        </View>
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
                            <Text style={{ color: colors.primaryLight, fontWeight: '900', letterSpacing: 1, fontSize: 12 }}>{r.promoCode}</Text>
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
