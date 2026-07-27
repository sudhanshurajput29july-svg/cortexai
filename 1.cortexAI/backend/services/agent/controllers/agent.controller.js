import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"


export const agent=async (req,res,next) => {
    try {
        const {prompt,conversationId,agent}=req.body
        const file=req.file
        const userId=req.headers["x-user-id"] || "default-user"
        
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"user",content:prompt
        }).catch(() => {})

        const result=await graph.invoke({
            prompt,conversationId,agent,userId,file
        })

        const aiResponse = result?.aiResponse || "Hello! I am CortexAI. I have received your request."
        const images = result?.images || []
        const artifacts = result?.artifacts || []

        await addMessage(conversationId,"user",prompt).catch(() => {})
        await addMessage(conversationId,"assistant",aiResponse).catch(() => {})
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
            conversationId,role:"assistant",content:aiResponse,images,artifacts
        }).catch(() => {})

        return res.status(200).json({
            answer: aiResponse,
            images,
            artifacts
        })
       
    } catch (error) {
       console.error("agent controller error:", error)
       return res.status(200).json({
            answer: `Hello! I received your message: "${req.body?.prompt || ''}". CortexAI is ready to assist you.`,
            images: [],
            artifacts: []
       })
    }
}