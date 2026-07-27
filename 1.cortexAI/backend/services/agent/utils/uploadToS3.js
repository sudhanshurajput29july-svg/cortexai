import { saveFileLocally } from "./fileStorage.js";

export const uploadToS3 = async (filename, buffer, contentType) => {
    await saveFileLocally(filename, buffer);
    return filename;
};