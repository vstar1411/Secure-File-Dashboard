import React from 'react';
import DOMPurify from 'dompurify';

interface SanitizedPreviewProps {
  content: string;
}

const SanitizedPreview: React.FC<SanitizedPreviewProps> = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};

export default SanitizedPreview;
