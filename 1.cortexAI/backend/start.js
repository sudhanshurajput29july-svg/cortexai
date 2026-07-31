import { spawn } from "child_process";

const gatewayPort = process.env.PORT || 10000;
const authPort = process.env.AUTH_PORT || 8001;
const chatPort = process.env.CHAT_PORT || 8002;
const agentPort = process.env.AGENT_PORT || 8003;

const sharedEnv = {
  ...process.env,
  AUTH_SERVICE: process.env.AUTH_SERVICE || `http://localhost:${authPort}`,
  CHAT_SERVICE: process.env.CHAT_SERVICE || `http://localhost:${chatPort}`,
  AGENT_SERVICE: process.env.AGENT_SERVICE || `http://localhost:${agentPort}`,
};

console.log("🚀 Starting all backend microservices together...");
console.log(`[Gateway] -> Port ${gatewayPort}`);
console.log(`[Auth]    -> Port ${authPort}`);
console.log(`[Chat]    -> Port ${chatPort}`);
console.log(`[Agent]   -> Port ${agentPort}`);

const auth = spawn("node", ["services/auth/index.js"], { env: { ...sharedEnv, PORT: authPort }, stdio: "inherit" });
const chat = spawn("node", ["services/chat/index.js"], { env: { ...sharedEnv, PORT: chatPort }, stdio: "inherit" });
const agent = spawn("node", ["services/agent/index.js"], { env: { ...sharedEnv, PORT: agentPort }, stdio: "inherit" });
const gateway = spawn("node", ["gateway/index.js"], { env: { ...sharedEnv, PORT: gatewayPort }, stdio: "inherit" });

const processes = [auth, chat, agent, gateway];

processes.forEach((proc) => {
  proc.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Process exited with error code ${code}`);
    }
  });
});
