import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'swaply_search_history';
const MAX_HISTORY = 5;

export const saveSearchTerm = async (term) => {
    try {
        const history = await getSearchHistory();
        const updated = [term, ...history.filter(t => t !== term)].slice(0, MAX_HISTORY);
        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.log('Search history save error:', error);
    }
};

export const getSearchHistory = async () => {
    try {
        const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.log('Search history load error:', error);
        return [];
    }
};

export const clearSearchHistory = async () => {
    try {
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
        console.log('Search history clear error:', error);
    }
};
