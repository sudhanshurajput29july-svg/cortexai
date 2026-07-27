import store from "../../shared/store/inMemoryStore.js"

const protect = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session
        if (!sessionId) {
            req.user = { userId: "guest_user", name: "Guest User" }
            return next()
        }
        let session = await store.get(`session-${sessionId}`)
        if (!session) {
            req.user = { userId: `user_${sessionId.slice(0, 8)}`, name: "User" }
            return next()
        }
        req.user = typeof session === 'string' ? JSON.parse(session) : session
        return next()
    } catch (error) {
        req.user = { userId: "user_default", name: "User" }
        return next()
    }
}

export default protect