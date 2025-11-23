/**
 * Component for image upload with IPFS integration (for profile editing)
 */

import { useState } from 'react';

interface ImageUploadSectionProps {
  metadataUri: string;
  onUriChange: (uri: string) => void;
  error?: string | null;
}

export function ImageUploadSection({ metadataUri, onUriChange, error }: ImageUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result?.toString().split(',')[1];
        
        if (!base64String) throw new Error('Failed to convert image');

        // Send to our internal API
        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            contentBase64: base64String
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        onUriChange(data.uri);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const getImageUrl = (uri: string) => {
    if (uri.startsWith('ipfs://')) {
      return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    return uri;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Profile Image
      </label>
      
      <div className="space-y-3">
        {/* Current Image Preview */}
        {metadataUri && !metadataUri.startsWith('ipfs://placeholder') && (
          <div className="flex items-start gap-4">
            <div className="relative border-2 border-gray-200 rounded-xl p-2 w-32 h-32 bg-gray-50 overflow-hidden shadow-sm">
              <img 
                src={getImageUrl(metadataUri)} 
                alt="Profile preview" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => { 
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Current image</p>
              <p className="text-xs font-mono text-gray-400 break-all">{metadataUri}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          />
          {isUploading && (
            <span className="text-sm text-primary-600 animate-pulse font-medium">Uploading...</span>
          )}
        </div>

        {/* Error Display */}
        {(uploadError || error) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {uploadError || error}
          </div>
        )}

        {/* Manual URI Input (read-only display) */}
        <div>
          <input
            type="text"
            value={metadataUri}
            onChange={(e) => onUriChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-xs text-gray-600 bg-gray-50"
            placeholder="ipfs://..."
            readOnly
          />
          <p className="mt-1 text-xs text-gray-500">
            IPFS URI will be set automatically after image upload
          </p>
        </div>
      </div>
    </div>
  );
}

