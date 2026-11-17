import { containerClient } from "../config/blobStorage.js";

export const uploadToBlob = async (filename, buffer, contentType) => {
  await containerClient.createIfNotExists();

  const blobName = `generated/${filename}`;
  const blob = containerClient.getBlockBlobClient(blobName);

  await blob.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  });

  return blobName;
};
