import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// On Android emulator, 10.0.2.2 maps to the host machine's localhost.
// On iOS simulator, localhost works directly.
// On a physical device, use your machine's actual local network IP.
const getBaseUrl = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            // Android emulator — use 10.0.2.2 for localhost
            // OR use your machine's actual network IP for physical devices
            return 'http://192.168.37.44:3000/api';
        }
        return 'http://192.168.37.44:3000/api'; // iOS / physical device
    }
    return 'https://your-production-server.com/api'; // production
};

const api = axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Global response interceptor: handle 401s (token expired / invalid)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear stored credentials — AuthContext will redirect to Login
            await AsyncStorage.multiRemove(['userToken', 'userData']);
        }
        return Promise.reject(error);
    }
);

export default api;
