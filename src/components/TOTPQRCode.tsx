import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCodeURL } from '@/utils/totpService';

interface TOTPQRCodeProps {
  secret: string;
  accountName: string;
  issuer?: string;
  size?: number;
}

export const TOTPQRCode: React.FC<TOTPQRCodeProps> = ({ 
  secret, 
  accountName, 
  issuer = 'Navikko', 
  size = 200 
}) => {
  const qrCodeURL = generateQRCodeURL(secret, accountName, issuer);
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCodeSVG 
        value={qrCodeURL} 
        size={size}
        level="M"
        includeMargin={true}
      />
      <div className="text-sm text-gray-600">
        <p>Secret: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code></p>
        <p className="text-xs mt-1">Scan with Google Authenticator or similar app</p>
      </div>
    </div>
  );
}; 