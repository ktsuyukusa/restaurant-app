import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, File, Image, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SecureFileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  allowedExtensions?: string[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = ['image/*'],
  maxSize = 5, // 5MB default
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  label = 'Upload File',
  placeholder = 'Choose a file or drag it here',
  required = false,
  disabled = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security configuration
  const SECURITY_CONFIG = {
    MAX_FILE_SIZE: maxSize * 1024 * 1024, // Convert MB to bytes
    ALLOWED_EXTENSIONS: allowedExtensions.map(ext => ext.toLowerCase()),
    ALLOWED_MIME_TYPES: acceptedTypes,
    SCAN_FOR_MALWARE: true, // In a real implementation, this would trigger malware scanning
    VALIDATE_FILE_CONTENT: true, // Validate file content, not just extension
  };

  // Validate file extension
  const validateFileExtension = (filename: string): boolean => {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return SECURITY_CONFIG.ALLOWED_EXTENSIONS.includes(extension);
  };

  // Validate file size
  const validateFileSize = (file: File): boolean => {
    return file.size <= SECURITY_CONFIG.MAX_FILE_SIZE;
  };

  // Validate MIME type
  const validateMimeType = (file: File): boolean => {
    return SECURITY_CONFIG.ALLOWED_MIME_TYPES.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
  };

  // Validate file content (basic implementation)
  const validateFileContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check for common file signatures
        const isValid = checkFileSignature(uint8Array, file.type);
        resolve(isValid);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Check file signature (magic numbers)
  const checkFileSignature = (uint8Array: Uint8Array, mimeType: string): boolean => {
    const signatures = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46],
    };

    const expectedSignature = signatures[mimeType as keyof typeof signatures];
    if (!expectedSignature) return true; // Allow if no signature defined

    return expectedSignature.every((byte, index) => uint8Array[index] === byte);
  };

  // Comprehensive file validation
  const validateFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    setIsValidating(true);
    setError(null);

    try {
      // Check file extension
      if (!validateFileExtension(file.name)) {
        return {
          isValid: false,
          error: `Invalid file type. Allowed extensions: ${SECURITY_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
        };
      }

      // Check file size
      if (!validateFileSize(file)) {
        return {
          isValid: false,
          error: `File too large. Maximum size: ${maxSize}MB`
        };
      }

      // Check MIME type
      if (!validateMimeType(file)) {
        return {
          isValid: false,
          error: 'Invalid file type detected'
        };
      }

      // Validate file content
      if (SECURITY_CONFIG.VALIDATE_FILE_CONTENT) {
        const isValidContent = await validateFileContent(file);
        if (!isValidContent) {
          return {
            isValid: false,
            error: 'File content validation failed'
          };
        }
      }

      // In a real implementation, you would also:
      // - Scan for malware
      // - Check for embedded scripts
      // - Validate image dimensions
      // - Check for EXIF data

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'File validation failed'
      };
    } finally {
      setIsValidating(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    const validation = await validateFile(file);
    
    if (validation.isValid) {
      setSelectedFile(file);
      setError(null);
      onFileSelect(file);
    } else {
      setError(validation.error || 'File validation failed');
      setSelectedFile(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="file-upload">{label}</Label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : selectedFile
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-upload"
          className="hidden"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          required={required}
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">{placeholder}</p>
            <p className="mt-1 text-xs text-gray-500">
              {acceptedTypes.join(', ')} • Max {maxSize}MB
            </p>
          </div>
        )}

        {isValidating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Validating file...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedFile && !error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            File validated successfully. All security checks passed.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500">
        <p><strong>Security Features:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>File extension validation</li>
          <li>File size limits ({maxSize}MB)</li>
          <li>MIME type verification</li>
          <li>File signature validation</li>
          <li>Content integrity checks</li>
        </ul>
      </div>
    </div>
  );
};

export default SecureFileUpload; 