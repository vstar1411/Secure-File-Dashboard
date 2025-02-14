import express from 'express';
import cors from 'cors';
import multer from 'multer';
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
}));

app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; connect-src 'self' http://localhost:5000 http://localhost:5173; img-src 'self' data:; script-src 'self' 'unsafe-inline';"
    );
    next();
  });

// File chunking middleware (handling 'multipart/form-data')
const upload = multer();

const mockToken = "mock-secure-token-123456"; // The mock token 

// Middleware to validate token
const validateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token || token !== mockToken) {
    return res.status(403).json({ error: 'Unauthorized: Invalid or missing token' });
  }

  next(); // Token is valid, proceed to the route
};


const PORT = process.env.PORT || 5000;

// In-memory tracking of chunk progress
const fileChunks = new Map(); // { fileId: { totalChunks, receivedChunks } }

// Simulate chunk upload
app.post('/api/upload-chunk',validateToken, upload.single('file'), (req, res) => {
  const { fileId, chunkIndex, totalChunks } = req.body;

  if (!fileId || chunkIndex === undefined || !totalChunks) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!fileChunks.has(fileId)) {
    fileChunks.set(fileId, { totalChunks: Number(totalChunks), receivedChunks: new Set() });
  }

  const fileData = fileChunks.get(fileId);
  fileData.receivedChunks.add(Number(chunkIndex));

  console.log(`Simulated chunk ${chunkIndex}/${totalChunks} received for file ${fileId}`);

  res.json({
    message: 'Chunk uploaded successfully',
    uploadedChunks: fileData.receivedChunks.size,
    totalChunks: fileData.totalChunks,
  });
});

// Get file metadata (for progress tracking)
app.get('/api/file/:id/metadata', (req, res) => {
  const fileId = req.params.id;
  const fileData = fileChunks.get(fileId);

  if (!fileData) return res.status(404).json({ error: 'File not found' });

  res.json({
    fileId,
    uploadedChunks: Array.from(fileData.receivedChunks),
    totalChunks: fileData.totalChunks,
  });
});

// Mock checksum verification (just returns a fake checksum)
app.get('/api/file/:id/checksum', (req, res) => {
  res.json({ checksum: 'fake-checksum-1234567890abcdef' });
});

// Mock delete file
app.delete('/api/file/:id', validateToken, (req, res) => {
  fileChunks.delete(req.params.id);
  res.json({ message: 'File deleted successfully' });
});

// Start server
app.listen(PORT, () => console.log(`Mock server running on port ${PORT}`));
