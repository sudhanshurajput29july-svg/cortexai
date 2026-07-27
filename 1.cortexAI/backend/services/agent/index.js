import express from "express"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT

const app = express()

app.use(express.json())
app.use("/files", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    const filename = path.basename(filePath);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }
}))
app.use("/", router)

app.use((err, req, res, next) => {
  console.log(err)

  if (err.status) {
    return res.status(err.status).json(err.data)
  }

  return res.status(500).json({ message: `agent error ${err}` })
})

app.get("/", (req, res) => {
  res.json({ message: "hello from agent" })
})

app.listen(port, () => {
  console.log(`agent started at ${port}`)
  connectDb()
})
