import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles, colors } from '../theme';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OfferDetailScreen({ route, navigation }: any) {
    const { offerId } = route.params;
    const { user } = useAuth();
    const [offer, setOffer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [redemptionData, setRedemptionData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOfferDetails();
    }, [offerId]);

    const fetchOfferDetails = async () => {
        try {
            const res = await api.get(`/offers/${offerId}`);
            setOffer(res.data);
        } catch (err) {
            console.error('Failed to fetch offer details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!user || user.verificationStatus !== 'APPROVED') {
            setError('Your student identity must be verified to redeem this privilege.');
            return;
        }

        setRedeeming(true);
        setError('');

        try {
            const res = await api.post(`/offers/${offerId}/redeem`);
            setRedemptionData(res.data);
            setShowModal(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to redeem offer.');
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) {
        return (
            <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!offer) {
        return (
            <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={globalStyles.text}>Offer not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primaryLight }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 100 }}>
                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 16 }}>← Back to Selection</Text>
                </TouchableOpacity>

                {/* Offer Header Card */}
                <View style={[globalStyles.glassCard, { marginBottom: 20 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 1, borderColor: colors.border }}>
                            <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold' }}>{offer.brand?.name?.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.textMain, fontSize: 22, fontWeight: '900' }}>{offer.brand?.name}</Text>
                            <View style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 4 }}>
                                <Text style={{ color: colors.accent, fontWeight: 'bold' }}>{offer.discount}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>{offer.title}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 24, marginBottom: 20 }}>
                        {offer.description}
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <View>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Status</Text>
                            <Text style={{ color: offer.isActive ? colors.success : colors.error, fontWeight: 'bold' }}>{offer.isActive ? 'Active' : 'Expired'}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Claims</Text>
                            <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{offer.currentRedemptions} {offer.maxRedemptions ? `/ ${offer.maxRedemptions}` : ''}</Text>
                        </View>
                    </View>
                </View>

                {error ? (
                    <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                        <Text style={{ color: colors.error, fontWeight: '600' }}>{error}</Text>
                    </View>
                ) : null}

                {/* Info & Legal Card */}
                <View style={[globalStyles.glassCard, { marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
                    <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Terms & Context</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 22 }}>
                        {offer.terms || "Standard institutional terms apply. Verify identity before claiming at physical locations."}
                    </Text>
                </View>
            </ScrollView>

            {/* Sticky Bottom Action Bar */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(10, 7, 26, 0.95)', borderTopWidth: 1, borderTopColor: colors.border }}>
                <TouchableOpacity
                    style={[globalStyles.button, { backgroundColor: offer.isActive ? colors.primary : colors.surfaceHighlight }]}
                    onPress={handleRedeem}
                    disabled={!offer.isActive || redeeming}
                >
                    {redeeming ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={[globalStyles.buttonText, { color: offer.isActive ? '#fff' : colors.textMuted }]}>
                            {offer.isActive ? 'Unlock Privilege' : 'Currently Unavailable'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Redemption Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <View style={{ backgroundColor: colors.surfaceHighlight, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: 'center' }}>
                        <Text style={{ color: colors.success, fontSize: 40, marginBottom: 12 }}>🛡️</Text>
                        <Text style={[globalStyles.title, { textAlign: 'center' }]}>Privilege Secured!</Text>
                        <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>Present this code to the cashier or use it during digital checkout.</Text>

                        <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 24, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 20 }}>
                            {redemptionData?.qrData ? (
                                <QRCode value={redemptionData.qrData} size={200} />
                            ) : null}
                        </View>

                        <View style={{ width: '100%', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 24 }}>
                            <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>PROMO CODE</Text>
                            <Text style={{ color: colors.textMain, fontSize: 24, fontWeight: '900', letterSpacing: 2 }}>{redemptionData?.promoCode}</Text>
                        </View>

                        <TouchableOpacity
                            style={[globalStyles.button, { width: '100%' }]}
                            onPress={() => setShowModal(false)}
                        >
                            <Text style={globalStyles.buttonText}>Got It, Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
