import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const saveFileLocally = async (filename, buffer) => {
    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return filename;
};

export const getLocalFileUrl = (filename) => {
    return `/api/agent/files/${filename}`;
};
