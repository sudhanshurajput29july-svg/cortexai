
import api from '../../utils/axios'

async function sendMessage(payload) {
 try {
    const { data } = await api.post("/api/agent/chat", payload)
    return data || {
      answer: "Hello! I am CortexAI. How can I help you today?",
      artifacts: [],
      images: []
    }
 } catch (error) {
    console.error("sendMessage error:", error)
    return {
      answer: "Hello! I am CortexAI. I received your request and I am ready to assist you.",
      artifacts: [],
      images: []
    }
 }
}

export default sendMessage
