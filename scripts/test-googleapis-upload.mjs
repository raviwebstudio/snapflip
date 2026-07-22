import { google } from 'googleapis';
import fs from 'fs';

const credentialsPath = 'C:\\Users\\Ravi Gautam\\Desktop\\Workspace\\Snap-google-cloud-Keys\\snapflip-501520-7ab94090da57.json';
const folderId = '1eZoJUnfucAmVlIjazePLZsu-lnUk6H08';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log('--- Attempting Upload via googleapis ---');
    
    // Create a 1x1 PNG stream or buffer
    const fileMetadata = {
      name: `test-googleapis-${Date.now()}.png`,
      parents: [folderId],
    };
    
    const media = {
      mimeType: 'image/png',
      body: fs.createReadStream('scripts/test-drive-upload.mjs'), // just upload some file as test
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, parents',
      supportsAllDrives: true,
    });
    
    console.log('Upload Succeeded via googleapis:', JSON.stringify(res.data, null, 2));

  } catch (error) {
    console.error('Upload Failed via googleapis:', error);
  }
}

main();
