import store from "../../../shared/store/inMemoryStore.js"
import { getMessages } from "../utils/getMessages.js"
export const getMemory=async (conversationId)=>{
    const key=`messages-${conversationId}`
    const cached=await store.get(key)
    if(cached){
        return JSON.parse(cached)
    }
    
    const messages=await getMessages(conversationId)
    if (Array.isArray(messages)) {
        await store.set(key,JSON.stringify(messages),"EX",24*60*60)
    }
    
    return Array.isArray(messages) ? messages : []
}

export const addMessage=async (conversationId,role,content)=>{
     const key=`messages-${conversationId}`
     const rawMessages=await store.get(key)
     const messages=rawMessages?JSON.parse(rawMessages):[]
     messages.push({
        role,content
     })

     if(messages.length>20){
        messages.shift()
     }

     await store.set(key,JSON.stringify(messages))
}
