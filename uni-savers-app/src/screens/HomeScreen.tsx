import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { globalStyles, colors } from '../theme';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }: any) {
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [trendingOffers, setTrendingOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            // Reusing the public API routes nextjs already has
            const [catRes, offRes] = await Promise.all([
                api.get('/categories'),
                api.get('/offers') // In a real app we might pass a limit or sorting param for 'trending'
            ]);
            setCategories(catRes.data || []);
            setTrendingOffers((offRes.data?.offers || []).slice(0, 5)); // Just grabbing a few for trending
        } catch (error) {
            console.error('Failed to fetch home data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    return (
        <View style={globalStyles.container}>
            <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <Text style={[globalStyles.text, { fontSize: 14, color: colors.textMuted }]}>Welcome back,</Text>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.textMain }}>{user?.name?.split(' ')[0] || 'Student'}!</Text>
                </View>
                <TouchableOpacity onPress={logout} style={{ padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>
                    <Text style={{ color: colors.error, fontWeight: 'bold' }}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={[globalStyles.glassCard, { marginBottom: 24, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: colors.primary }]}>
                    <Text style={{ color: colors.primaryLight, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Verify your Status</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>Upload your Student ID to unlock premium discounts immediately.</Text>
                </View>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Categories Horizontal Scroll */}
                        <Text style={[globalStyles.title, { fontSize: 20, marginBottom: 12 }]}>Curated Sectors</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32 }}>
                            {categories.map((cat, index) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={{ marginRight: 12, alignItems: 'center' }}
                                    onPress={() => navigation.navigate('Offers', { category: cat.name })}
                                >
                                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
                                        <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                                    </View>
                                    <Text style={{ color: colors.textMain, fontSize: 12, fontWeight: '600' }}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Trending Offers Vertical List */}
                        <Text style={[globalStyles.title, { fontSize: 20, marginBottom: 16 }]}>Trending Now</Text>
                        {trendingOffers.map(offer => (
                            <TouchableOpacity
                                key={offer.id}
                                style={[globalStyles.glassCard, { marginBottom: 16, flexDirection: 'row', alignItems: 'center' }]}
                                onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                            >
                                <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{offer.brand?.name?.charAt(0) || 'B'}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: 'bold' }}>{offer.title}</Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>{offer.brand?.name} • <Text style={{ color: colors.success }}>{offer.discount}</Text></Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
