import { StyleSheet } from 'react-native';

export const colors = {
    background: '#0A071A',
    surface: '#120F24',
    surfaceHighlight: '#1A162F',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    secondary: '#EC4899',
    secondaryLight: '#F472B6',
    accent: '#22D3EE',
    textMain: '#F8FAFC',
    textMuted: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    error: '#EF4444',
};

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    text: {
        color: colors.textMain,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textMain,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textMuted,
        marginBottom: 24,
    },
    glassCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 14,
        color: colors.textMain,
        fontSize: 16,
        marginBottom: 16,
    }
});
