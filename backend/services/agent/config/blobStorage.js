import dotenv from "dotenv";
import { BlobServiceClient } from "@azure/storage-blob";

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is missing");
}

if (!containerName) {
  throw new Error("AZURE_STORAGE_CONTAINER_NAME is missing");
}

export const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);

export const containerClient =
  blobServiceClient.getContainerClient(containerName);
