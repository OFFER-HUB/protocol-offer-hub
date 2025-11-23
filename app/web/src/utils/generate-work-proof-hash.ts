/**
 * Generates a SHA-256 hash from work delivery data
 * Used to create proof_hash for claims
 */

export interface WorkDeliveryData {
  title: string;
  description: string;
  delivery_urls: string[];
  delivery_date: string; // ISO format
  file_hash?: string; // hex string, only if file was uploaded
}

/**
 * Generates SHA-256 hash of a file
 */
async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates SHA-256 hash from work delivery data
 * @param data Work delivery data
 * @param file Optional file to include in hash
 * @returns Uint8Array of 32 bytes (proof_hash)
 */
export async function generateWorkProofHash(
  data: Omit<WorkDeliveryData, 'file_hash'>,
  file?: File
): Promise<Uint8Array> {
  let fileHash: string | undefined;
  
  // If file provided, calculate its hash first
  if (file) {
    fileHash = await hashFile(file);
  }

  // Build JSON structure
  const jsonData: WorkDeliveryData = {
    title: data.title.trim(),
    description: data.description.trim(),
    delivery_urls: data.delivery_urls.filter(url => url.trim() !== ''),
    delivery_date: data.delivery_date,
    ...(fileHash && { file_hash: fileHash }),
  };

  // Stringify JSON (sorted keys for consistency)
  const jsonString = JSON.stringify(jsonData, Object.keys(jsonData).sort());

  // Calculate SHA-256 of JSON string
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
  return new Uint8Array(hashBuffer); // 32 bytes
}

/**
 * Converts Uint8Array to hex string for display
 */
export function hashToHex(hash: Uint8Array): string {
  return '0x' + Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generates a unique claim type based on work details
 * Creates a short, readable identifier from title, description, and delivery date
 * @param data Work delivery data
 * @returns A unique claim type string (e.g., "job_offer_hub_website_2025_01_20")
 */
export function generateClaimType(data: Omit<WorkDeliveryData, 'file_hash'>): string {
  // Extract key words from title (first 3-4 words, lowercase, no special chars)
  const titleWords = data.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 3)
    .join('_');

  // Get date components (YYYY_MM_DD)
  const date = new Date(data.delivery_date);
  const dateStr = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}`;

  // Combine: job_[title_words]_[date]
  const claimType = `job_${titleWords || 'work'}_${dateStr}`;

  // Limit length to reasonable size (contract might have limits)
  return claimType.substring(0, 64);
}

