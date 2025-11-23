/**
 * Redesigned Claim Form - Work delivery confirmation
 * Automatically generates proof hash from work data
 */

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { ReceiverPreview } from './receiver-preview';
import { generateWorkProofHash, generateClaimType, hashToHex } from '@/utils/generate-work-proof-hash';

interface ClaimFormProps {
  receiver: string; // Required, comes from query
  onSubmit?: (claimId: number) => void; // Optional callback on success
}

export function ClaimForm({ receiver, onSubmit }: ClaimFormProps) {
  const { addClaim, isReady, error: contractError } = useOfferHubContract();
  
  // Mock data pre-filled for MVP demo - Offer Hub website creation
  const [title, setTitle] = useState('Offer Hub Website Development');
  const [description, setDescription] = useState('Complete website development for Offer Hub platform including homepage with hero section, freelancer discovery features, category browsing, top-rated freelancers showcase, how it works section, testimonials, and waitlist functionality. Fully responsive design with modern UI/UX, smooth navigation, and optimized performance. All pages delivered with clean code and mobile-first approach.');
  const [deliveryUrls, setDeliveryUrls] = useState<string[]>(['https://www.offer-hub.org/']);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedHash, setGeneratedHash] = useState<string | null>(null);
  const [generatedClaimType, setGeneratedClaimType] = useState<string | null>(null);
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Show preview by default with mock data

  // Validate form - always valid with mock data
  const isValidTitle = title.trim().length >= 3;
  const isValidDescription = description.trim().length >= 10;
  const canSubmit = isValidTitle && isValidDescription && isReady && !isSubmitting && receiver && generatedHash;

  // Generate hash and claim type automatically when data changes
  useEffect(() => {
    const generateHash = async () => {
      if (!isValidTitle || !isValidDescription) {
        setGeneratedHash(null);
        setGeneratedClaimType(null);
        return;
      }

      setIsGeneratingHash(true);
      try {
        const workData = {
          title,
          description,
          delivery_urls: deliveryUrls.filter(url => url.trim() !== ''),
          delivery_date: new Date(deliveryDate).toISOString(),
        };

        // Generate unique claim type based on work data
        const claimType = generateClaimType(workData);
        setGeneratedClaimType(claimType);

        // Generate proof hash
        const hash = await generateWorkProofHash(workData, file || undefined);
        setGeneratedHash(hashToHex(hash));
      } catch (err: any) {
        console.error('Error generating hash:', err);
        setGeneratedHash(null);
        setGeneratedClaimType(null);
      } finally {
        setIsGeneratingHash(false);
      }
    };

    generateHash();
  }, [title, description, deliveryUrls, deliveryDate, file, isValidTitle, isValidDescription]);

  const handleAddUrl = () => {
    setDeliveryUrls([...deliveryUrls, '']);
  };

  const handleRemoveUrl = (index: number) => {
    setDeliveryUrls(deliveryUrls.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...deliveryUrls];
    newUrls[index] = value;
    setDeliveryUrls(newUrls);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (optional)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handlePreview = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !generatedHash) return;

    // Validate URLs
    const invalidUrls = deliveryUrls.filter(url => url.trim() && !validateUrl(url));
    if (invalidUrls.length > 0) {
      setError('Please enter valid URLs');
      return;
    }

    setShowPreview(true);
    setError(null);
  };

  const handleConfirmAndSubmit = async () => {
    if (!generatedHash) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate hash again to ensure we have the latest (same as test-contract)
      const hash = await generateWorkProofHash(
        {
          title: title.trim(),
          description: description.trim(),
          delivery_urls: deliveryUrls.filter(url => url.trim() !== ''),
          delivery_date: new Date(deliveryDate).toISOString(),
        },
        file || undefined
      );

      // Verify hash is 32 bytes (same validation as test-contract)
      if (hash.length !== 32) {
        throw new Error('Proof hash must be 32 bytes');
      }

      // Generate unique claim type
      const claimType = generateClaimType({
        title: title.trim(),
        description: description.trim(),
        delivery_urls: deliveryUrls.filter(url => url.trim() !== ''),
        delivery_date: new Date(deliveryDate).toISOString(),
      });

      // Call contract exactly like test-contract does
      const claimId = await addClaim({
        receiver,
        claim_type: claimType,
        proof_hash: hash, // Uint8Array of 32 bytes
      });

      console.log('Claim created successfully! Claim ID:', claimId);

      if (onSubmit) {
        onSubmit(claimId);
      }
    } catch (err: any) {
      console.error('Error creating claim:', err);
      setError(err?.message || 'Failed to create claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
  };

  // Preview view
  if (showPreview) {
    const validUrls = deliveryUrls.filter(url => url.trim() !== '');
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h2 className="text-3xl font-bold text-white mb-2">Claim Preview</h2>
            <p className="text-primary-100 text-sm">Review the details before generating the claim</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Recipient Wallet Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recipient</h3>
                  <p className="text-sm text-gray-600">Freelancer wallet address</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-primary-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">OH</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Stellar Address</div>
                    <div className="text-sm font-mono text-gray-900">
                      {receiver.substring(0, 8)}...{receiver.substring(receiver.length - 8)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(receiver)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Work Details Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Work Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Title</div>
                  <div className="text-lg font-semibold text-gray-900">{title}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</div>
                  <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-4 border border-gray-100">
                    {description}
                  </div>
                </div>

                {validUrls.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery URLs</div>
                    <div className="space-y-2">
                      {validUrls.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm bg-primary-50 rounded-lg p-3 border border-primary-100 hover:border-primary-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="truncate">{url}</span>
                          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {file && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Attached File</div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Date</div>
                  <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(deliveryDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>

                {generatedClaimType && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Claim Type</div>
                    <div className="text-sm font-mono text-primary-600 bg-primary-50 rounded-lg p-3 border border-primary-100">
                      {generatedClaimType}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Automatically generated from work details</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={handleBackToEdit}
                className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Generate Claim
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handlePreview} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              title && !isValidTitle ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="Work title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              description && !isValidDescription ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="Work description"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URLs <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="space-y-2">
            {deliveryUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    url && !validateUrl(url) ? 'border-red-400' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {deliveryUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddUrl}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              + Add URL
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            File <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf,.zip"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Error Display */}
        {(error || contractError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error || contractError}
          </div>
        )}

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={!canSubmit || !generatedHash || isGeneratingHash}
            className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Preview
          </button>
        </div>
      </form>
    </div>
  );
}
