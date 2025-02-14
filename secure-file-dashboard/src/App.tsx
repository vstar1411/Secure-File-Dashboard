import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploader from './components/FileUploader';
import { FileSecuritySpec } from './utils/FileSecurity';
import CSPHeaderProvider from './components/CSPHeaderProvider';

const fileSecuritySpec: FileSecuritySpec = {
  allowedTypes: ['application/pdf', 'image/png'],
  maxSize: 100_000_000, // 100MB
  scanMethod: 'client-side validation using browser APIs',
};

const App: React.FC = () => {
  return (
    <CSPHeaderProvider policy="default-src 'self'">
      <Router>
        <Routes>
          <Route path="/" element={<FileUploader spec={fileSecuritySpec} />} />
        </Routes>
      </Router>
    </CSPHeaderProvider>
  );
};

export default App;
