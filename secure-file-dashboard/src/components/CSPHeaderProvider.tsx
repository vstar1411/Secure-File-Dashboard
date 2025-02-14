import React, { useEffect } from 'react';

interface CSPHeaderProviderProps {
  policy: string;
  children: React.ReactNode;
}

const CSPHeaderProvider: React.FC<CSPHeaderProviderProps> = ({ policy, children }) => {
  useEffect(() => {
    const newPolicy = `${policy}; connect-src http://localhost:5000`;
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta http-equiv="Content-Security-Policy" content="${newPolicy}">`
    );
  }, [policy]);

  return <>{children}</>;
};

export default CSPHeaderProvider;
