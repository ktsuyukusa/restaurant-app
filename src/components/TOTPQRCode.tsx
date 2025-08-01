import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
  // Generate the otpauth URL using speakeasy format
  const otpauthURL = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <QRCodeSVG
          value={otpauthURL}
          size={size}
          level="M"
          includeMargin={true}
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Scan with Google Authenticator
        </p>
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Account:</strong> {accountName}</p>
          <p><strong>Issuer:</strong> {issuer}</p>
          <p><strong>Library:</strong> speakeasy (battle-tested)</p>
        </div>
      </div>
    </div>
  );
};

export default TOTPQRCode;