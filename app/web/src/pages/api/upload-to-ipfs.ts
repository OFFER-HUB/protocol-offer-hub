import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow images up to 10MB
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentBase64, contentType } = req.body;

    if (!contentBase64 || !filename) {
      return res.status(400).json({ error: 'Missing file content' });
    }

    // 1. Convert Base64 to Blob/File for Pinata
    const buffer = Buffer.from(contentBase64, 'base64');
    const blob = new Blob([buffer], { type: contentType });
    
    // 2. Create FormData for Pinata
    const formData = new FormData();
    formData.append('file', blob, filename);
    
    const pinataMetadata = JSON.stringify({
      name: filename,
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    // 3. Send to Pinata
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      throw new Error('PINATA_JWT is not configured on the server');
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata Error: ${errorText}`);
    }

    const data = await response.json();
    
    // 4. Return IPFS Hash
    return res.status(200).json({ 
      ipfsHash: data.IpfsHash, 
      uri: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}` 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

