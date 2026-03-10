import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { globalStyles, colors } from '../theme';
import api from '../api/client';

export default function OffersScreen({ route, navigation }: any) {
    const [offers, setOffers] = useState<any[]>([]);
    const [filteredOffers, setFilteredOffers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const incomingCategory = route.params?.category || '';

    useEffect(() => {
        fetchOffers();
    }, [incomingCategory]);

    const fetchOffers = async () => {
        try {
            const res = await api.get('/offers');
            const data = res.data || [];

            setOffers(data);

            // Auto-filter if a category was passed from Home
            if (incomingCategory) {
                setSearchQuery(incomingCategory);
                setFilteredOffers(data.filter((o: any) =>
                    o.category?.name?.toLowerCase().includes(incomingCategory.toLowerCase()) ||
                    o.brand?.name?.toLowerCase().includes(incomingCategory.toLowerCase())
                ));
            } else {
                setFilteredOffers(data);
            }
        } catch (error) {
            console.error('Failed to fetch offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredOffers(offers);
        } else {
            const filtered = offers.filter(o =>
                o.title.toLowerCase().includes(text.toLowerCase()) ||
                o.brand?.name?.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredOffers(filtered);
        }
    };

    const renderOfferCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[globalStyles.glassCard, { marginBottom: 16, flexDirection: 'column' }]}
            onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{item.brand?.name?.charAt(0) || 'B'}</Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>{item.brand?.name}</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: 'bold' }}>{item.discount}</Text>
                </View>
            </View>
            <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>{item.title}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 14 }} numberOfLines={2}>{item.description}</Text>

            <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'Never'}</Text>
                <Text style={{ color: '#FCD34D', fontSize: 12, fontWeight: '600' }}>View Details ➔</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={globalStyles.container}>
            <View style={{ padding: 20, paddingTop: 60, paddingBottom: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={globalStyles.title}>Privilege Gallery</Text>
                <TextInput
                    style={[globalStyles.input, { marginTop: 12, marginBottom: 0 }]}
                    placeholder="Search offers or brands..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredOffers}
                    keyExtractor={item => item.id}
                    renderItem={renderOfferCard}
                    contentContainerStyle={{ padding: 20, paddingTop: 20 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
                            <Text style={[globalStyles.text, { fontSize: 18, fontWeight: 'bold' }]}>No matches found</Text>
                            <Text style={{ color: colors.textMuted, marginTop: 8 }}>Try a different search term.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
