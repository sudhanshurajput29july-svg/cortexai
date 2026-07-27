import { getLocalFileUrl } from "./fileStorage.js";

export const getFromS3 = async (filename, expiresIn = 600) => {
    return getLocalFileUrl(filename);
};