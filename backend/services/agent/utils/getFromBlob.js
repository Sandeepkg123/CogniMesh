import { BlobSASPermissions } from "@azure/storage-blob";
import { containerClient } from "../config/blobStorage.js";

export const getFromBlob = async (filename, expiresIn = 600) => {
  const blobName = `generated/${filename}`;
  const blob = containerClient.getBlobClient(blobName);

  return await blob.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn: new Date(Date.now() + expiresIn * 1000),
  });
};
