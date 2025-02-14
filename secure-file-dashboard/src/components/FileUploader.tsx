import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { z } from 'zod';
import FileDropzone from './ui/FileDropzone';
import SanitizedPreview from './SanitizedPreview';
import { FileSecuritySpec } from '../utils/FileSecurity';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { openDB } from 'idb';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const API_URL = "http://localhost:5000/api";

// IndexedDB setup
const initDB = async () => {
  return openDB("upload-tracker", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("uploads")) {
        db.createObjectStore("uploads", { keyPath: "fileId" });
      }
    },
  });
};

interface FileUploaderProps {
  spec: FileSecuritySpec;
}

// File validation schema using Zod
const fileSchema = (spec: FileSecuritySpec) =>
  z.object({
    file: z
      .instanceof(File)
      .refine((file) => file.size <= spec.maxSize, {
        message: `File size must be less than ${spec.maxSize / 1_000_000}MB`,
      })
      .refine((file) => spec.allowedTypes.includes(file.type as any), {
        message: `Only ${spec.allowedTypes.join(', ')} files are allowed`,
      }),
  });

const FileUploader: React.FC<FileUploaderProps> = ({ spec }) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const fileId = uuidv4();

  const handleFileDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];

    if (selectedFile) {
      try {
        fileSchema(spec).parse({ file: selectedFile });
        setFile(selectedFile);
        setError('');
      } catch (err) {
        setError((err as z.ZodError).errors[0].message);
      }
    }
  };

  const generateMockToken = () => {
    return "mock-secure-token-123456"; // This should be replaced with a real token generation mechanism, I am using it just to showcase the secure token handling
  };

  const uploadChunk = async (chunkIndex: number, chunk: Blob, totalChunks: number) => {
    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("file", chunk, file?.name || "chunk");

    try {
      const response = await axios.post(`${API_URL}/upload-chunk`, formData, {
        headers: {
          Authorization: `Bearer ${generateMockToken()}`, // Attach the mock token
        },
      });
      return response.data;
    } catch (err) {
      throw new Error(`Failed to upload chunk ${chunkIndex}`);
    }
  };

  const uploadChunkWithRetry = async (chunkIndex: number, chunk: Blob, totalChunks: number, retries = 3): Promise<any> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await uploadChunk(chunkIndex, chunk, totalChunks);
        return result;
      } catch (err) {
        if (err instanceof Error) {
            lastError = err;
            console.error(`Attempt ${attempt + 1} failed for chunk ${chunkIndex}:`, err);
          } else {
            lastError = new Error(`Unexpected error for chunk ${chunkIndex}`);
            console.error(`Attempt ${attempt + 1} failed for chunk ${chunkIndex}:`, err);
          }
        console.error(`Attempt ${attempt + 1} failed for chunk ${chunkIndex}:`, err);
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError!;
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const db = await initDB();
    const storedChunks = (await db.get("uploads", fileId))?.uploadedChunks || [];

    const chunkPromises = [];
    for (let i = 0; i < totalChunks; i++) {
      if (storedChunks.includes(i)) continue;

      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      chunkPromises.push(uploadChunkWithRetry(i + 1, chunk, totalChunks)); // Use the retry function here
    }

    try {
      await Promise.all(chunkPromises);
      await db.put("uploads", { fileId, uploadedChunks: Array.from({ length: totalChunks }, (_, i) => i) });

      // Fetch upload progress
      const metadataRes = await axios.get(`${API_URL}/file/${fileId}/metadata`);
      setProgress(Math.floor((metadataRes.data.uploadedChunks.length / totalChunks) * 100));

      // Fetch checksum after upload completion
      const checksumRes = await axios.get(`${API_URL}/file/${fileId}/checksum`);
      setChecksum(checksumRes.data.checksum);
    } catch (err) {
      setError("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card aria-labelledby="file-upload-heading" className="p-6 max-w-sm mx-auto my-4">
      <h2 id="file-upload-heading" className="sr-only">Secure File Upload</h2>

      <FileDropzone onDrop={handleFileDrop} />
      {error && <p className="text-red-500">{error}</p>}

      <Button onClick={handleUpload} className="bg-blue-500 text-white mt-4" disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </Button>

      {file && (
        <div className="mt-4">
          <SanitizedPreview content={`File: ${file.name}`} />
          <Progress value={progress} max={100} className="w-full mt-2" aria-label="Upload progress" />
        </div>
      )}
    </Card>
  );
};

export default FileUploader;
