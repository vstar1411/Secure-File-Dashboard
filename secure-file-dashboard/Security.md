# Security Strategy Documentation

This document outlines the key security measures implemented for file uploads and data integrity in the application.

## 1. Cross-Origin Resource Sharing (CORS) Protection

CORS is configured to only allow requests from `http://localhost:5173`, ensuring that only authorized origins can interact with the backend.

```js
app.use(cors({
  origin: 'http://localhost:5173',
}));
```
## 2. Cross-Site Scripting (XSS) Protection

A Content Security Policy (CSP) is set to restrict resource loading from trusted sources only, mitigating XSS risks.

```js
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' http://localhost:5000 http://localhost:5173; img-src 'self' data:; script-src 'self' 'unsafe-inline';");
  next();
});
```
## 3. Secure Token Authentication

The application uses token-based authentication. Although it is a mock token for now we can create a authentication and token geneartion mechanism for it.

```js
const validateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token || token !== mockToken) {
    return res.status(403).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  next();
};
```
## 4. File Upload Security

Files are uploaded in chunks using multer to avoid memory overload and better manage large files.

```js
app.post('/api/upload-chunk', validateToken, upload.single('file'), (req, res) => {
  // Handle chunked upload
});
```
## 5. File Integrity & Metadata Tracking

The application tracks uploaded chunks and verifies file integrity using checksum verification (mocked in this case). Progress is tracked to inform users of upload status.

```js
app.get('/api/file/:id/checksum', (req, res) => {
  res.json({ checksum: 'fake-checksum-1234567890abcdef' });
});
```

## 6. Error Handling

Appropriate error handling ensures invalid requests (missing parameters, invalid tokens) return meaningful error responses.

## Conclusion

This strategy ensures the security of file uploads by enforcing strict CORS policies, token-based authentication, chunked uploads, and file integrity checks, while also safeguarding against XSS vulnerabilities and unauthorized file deletion.