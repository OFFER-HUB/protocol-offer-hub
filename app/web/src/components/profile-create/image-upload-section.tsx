/**
 * Component for image upload with IPFS integration
 */

import { useState } from 'react';

interface ImageUploadSectionProps {
  metadataUri: string;
  onUriChange: (uri: string) => void;
}

export function ImageUploadSection({ metadataUri, onUriChange }: ImageUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

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
      alert(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Profile Image
      </label>
      
      <div className="space-y-3">
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
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
          {isUploading && (
            <span className="text-sm text-gray-500 animate-pulse">Uploading...</span>
          )}
        </div>

        {/* Preview */}
        {metadataUri && !metadataUri.startsWith('ipfs://placeholder') && (
          <div className="mt-3 border-2 border-gray-200 rounded-lg p-2 w-32 h-32 bg-gray-50 overflow-hidden">
            <img 
              src={metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')} 
              alt="Preview" 
              className="w-full h-full object-cover rounded"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
              }}
            />
          </div>
        )}

        {/* Manual URI Input (optional) */}
        <div>
          <input
            type="text"
            value={metadataUri}
            onChange={(e) => onUriChange(e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs text-gray-600 bg-gray-50"
            placeholder="ipfs://..."
          />
          <p className="mt-1 text-xs text-gray-500">
            IPFS URI will be set automatically after image upload
          </p>
        </div>
      </div>
    </div>
  );
}

