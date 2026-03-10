import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles, colors } from '../theme';
import api from '../api/client';

export default function OffersScreen({ route, navigation }: any) {
    const [allOffers, setAllOffers] = useState<any[]>([]);
    const [filteredOffers, setFilteredOffers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const incomingCategory = route.params?.category || '';

    const fetchOffers = useCallback(async () => {
        try {
            setError('');
            const res = await api.get('/offers?limit=100');
            const data = Array.isArray(res.data) ? res.data : (res.data?.offers || []);
            setAllOffers(data);
            if (incomingCategory) {
                setSearchQuery(incomingCategory);
                applyFilter(data, incomingCategory);
            } else {
                setFilteredOffers(data);
            }
        } catch {
            setError('Failed to load offers. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [incomingCategory]);

    const applyFilter = (data: any[], query: string) => {
        if (!query.trim()) {
            setFilteredOffers(data);
            return;
        }
        const q = query.toLowerCase();
        setFilteredOffers(data.filter(o =>
            o.title?.toLowerCase().includes(q) ||
            o.brand?.name?.toLowerCase().includes(q) ||
            o.category?.name?.toLowerCase().includes(q) ||
            o.discount?.toLowerCase().includes(q)
        ));
    };

    useEffect(() => { fetchOffers(); }, [fetchOffers]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        applyFilter(allOffers, text);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredOffers(allOffers);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            activeOpacity={0.75}
            style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
            onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ color: colors.primaryLight, fontWeight: '900', fontSize: 16 }}>{item.brand?.name?.charAt(0) || 'B'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>{item.brand?.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{item.category?.name}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                    <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '800' }}>{item.discount}</Text>
                </View>
            </View>
            <Text style={{ color: colors.textMain, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>{item.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }} numberOfLines={2}>{item.description}</Text>
            <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    {item.expiresAt ? `Expires ${new Date(item.expiresAt).toLocaleDateString()}` : 'No expiry'}
                </Text>
                <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '700' }}>View Details →</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />

            {/* Header + Search */}
            <View style={{ padding: 24, paddingBottom: 12 }}>
                <Text style={{ fontSize: 26, fontWeight: '900', color: colors.textMain, marginBottom: 14 }}>Privilege Gallery</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceHighlight, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14 }}>
                    <Text style={{ color: colors.textMuted, marginRight: 8 }}>🔍</Text>
                    <TextInput
                        style={{ flex: 1, color: colors.textMain, fontSize: 15, paddingVertical: 13 }}
                        placeholder="Search offers, brands, categories..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Text style={{ color: colors.textMuted, fontSize: 18, paddingLeft: 8 }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {searchQuery.length > 0 && (
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                        {filteredOffers.length} result{filteredOffers.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </Text>
                )}
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14 }}>Loading offers...</Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>📡</Text>
                    <Text style={{ color: colors.textMuted, textAlign: 'center', lineHeight: 22 }}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOffers}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
                            <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>No results found</Text>
                            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Try searching for a brand or category</Text>
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={clearSearch} style={{ marginTop: 16 }}>
                                    <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>Clear search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
