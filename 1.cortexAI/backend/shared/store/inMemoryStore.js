const inMemoryStore = new Map();

const store = {
    async get(key) {
        const val = inMemoryStore.get(key);
        if (val === undefined || val === null) return null;
        return typeof val === 'object' ? JSON.stringify(val) : val;
    },

    async set(key, value) {
        inMemoryStore.set(key, value);
        return "OK";
    },

    async del(key) {
        inMemoryStore.delete(key);
        return 1;
    },

    async incr(key) {
        const current = parseInt(inMemoryStore.get(key) || "0", 10) + 1;
        inMemoryStore.set(key, String(current));
        return current;
    },

    async expire(key, seconds) {
        return 1;
    },

    async ttl(key) {
        return 60;
    }
};

export default store;
