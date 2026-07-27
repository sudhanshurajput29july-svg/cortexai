// Mock S3 client for backward compatibility without AWS SDK
export const s3 = {
    send: async () => true
};