import { getModel } from "../config/llmModels.js"
import { agent } from "../controllers/agent.controller.js"

export const router = async (state) => {

  if (state.agent && state.agent !== "auto") {
    return {
      ...state,
      agent: state.agent
    }
  }

  if(state.file){
if(state.file.mimetype==="application/pdf"){
    return {
      ...state,
      agent:"pdfRag"
    }
  }

    if(state.file.mimetype.startsWith("image/")){
    return {
      ...state,
      agent:"imageAnalyzer"
    }
  }
  }

  


  const llm = await getModel("router")
  if (!llm) {
    const p = (state.prompt || "").toLowerCase();
    let selectedAgent = "chat";
    if (p.includes("code") || p.includes("html") || p.includes("css") || p.includes("js") || p.includes("function") || p.includes("app") || p.includes("website") || p.includes("build")) {
      selectedAgent = "coding";
    } else if (p.includes("search") || p.includes("news") || p.includes("latest") || p.includes("price") || p.includes("who is")) {
      selectedAgent = "search";
    } else if (p.includes("pdf") || p.includes("document")) {
      selectedAgent = "pdf";
    } else if (p.includes("ppt") || p.includes("presentation") || p.includes("slides")) {
      selectedAgent = "ppt";
    } else if (p.includes("image") || p.includes("picture") || p.includes("photo") || p.includes("draw")) {
      selectedAgent = "vision";
    }
    return {
      ...state,
      agent: selectedAgent
    };
  }

  try {
    const response = await llm.invoke(prompt)
    return {
      ...state,
      agent: (response.content || "chat").trim().toLowerCase()
    }
  } catch (e) {
    return {
      ...state,
      agent: "chat"
    }
  }



}