import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, RefreshControl, TouchableOpacity,
    ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../theme';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: any) {
    const { user } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [trendingOffers, setTrendingOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setError('');
            const [catRes, offRes] = await Promise.all([
                api.get('/categories'),
                api.get('/offers?limit=6'),
            ]);
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
            const offers = Array.isArray(offRes.data) ? offRes.data : (offRes.data?.offers || []);
            setTrendingOffers(offers.slice(0, 6));
        } catch {
            setError('Could not load data. Pull down to retry.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const isVerified = user?.verificationStatus === 'APPROVED';
    const isPending = user?.verificationStatus === 'PENDING';

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '500' }}>Welcome back 👋</Text>
                    <Text style={{ fontSize: 26, fontWeight: '900', color: colors.textMain, marginTop: 2 }}>
                        {user?.name?.split(' ')[0] || 'Student'}
                    </Text>
                </View>
                {isVerified ? (
                    <View style={{ backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }}>
                        <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>✓ Verified</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}
                        style={{ backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' }}
                    >
                        <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '700' }}>
                            {isPending ? '⏳ Pending' : '+ Verify ID'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Verification Banner (only for unverified) */}
                {!isVerified && !isPending && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}
                        style={{ marginHorizontal: 24, marginBottom: 24, backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', flexDirection: 'row', alignItems: 'center', gap: 12 }}
                    >
                        <Text style={{ fontSize: 28 }}>📋</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.primaryLight, fontSize: 15, fontWeight: '700', marginBottom: 2 }}>Verify your Student ID</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Upload your ID to unlock all discounts</Text>
                        </View>
                        <Text style={{ color: colors.textMuted }}>›</Text>
                    </TouchableOpacity>
                )}

                {loading ? (
                    <View style={{ paddingTop: 40, alignItems: 'center' }}>
                        <ActivityIndicator color={colors.primary} size="large" />
                    </View>
                ) : error ? (
                    <View style={{ paddingTop: 60, alignItems: 'center', paddingHorizontal: 24 }}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>📡</Text>
                        <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{error}</Text>
                    </View>
                ) : (
                    <>
                        {/* Categories */}
                        <View style={{ marginBottom: 32 }}>
                            <Text style={{ paddingHorizontal: 24, fontSize: 18, fontWeight: '800', color: colors.textMain, marginBottom: 16 }}>Explore Categories</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={{ alignItems: 'center', width: 72 }}
                                        onPress={() => navigation.navigate('Offers', { category: cat.name })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
                                            <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
                                        </View>
                                        <Text style={{ color: colors.textMain, fontSize: 10, fontWeight: '600', textAlign: 'center' }} numberOfLines={2}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Trending Offers */}
                        <View style={{ paddingHorizontal: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textMain }}>🔥 Trending Now</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Offers', {})}>
                                    <Text style={{ color: colors.primaryLight, fontSize: 13, fontWeight: '600' }}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            {trendingOffers.map(offer => (
                                <TouchableOpacity
                                    key={offer.id}
                                    activeOpacity={0.75}
                                    style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }}
                                    onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                                >
                                    <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                        <Text style={{ color: colors.primaryLight, fontWeight: '900', fontSize: 18 }}>{offer.brand?.name?.charAt(0) || 'B'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textMain, fontSize: 15, fontWeight: '700', marginBottom: 3 }} numberOfLines={1}>{offer.title}</Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{offer.brand?.name} • <Text style={{ color: colors.success, fontWeight: '700' }}>{offer.discount}</Text></Text>
                                    </View>
                                    <View style={{ backgroundColor: colors.primary + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                                        <Text style={{ color: colors.primaryLight, fontSize: 11, fontWeight: '700' }}>{offer.discount}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
