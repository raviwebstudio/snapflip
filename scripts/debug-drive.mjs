import { google } from 'googleapis';

const credentialsPath = 'C:\\Users\\Ravi Gautam\\Desktop\\Workspace\\Snap-google-cloud-Keys\\snapflip-501520-7ab94090da57.json';
const folderId = '1eZoJUnfucAmVlIjazePLZsu-lnUk6H08';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log('--- Checking Folder Metadata ---');
    const res = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType, parents, driveId, shared, owners, capabilities',
      supportsAllDrives: true,
    });
    console.log('Folder Metadata:', JSON.stringify(res.data, null, 2));

    console.log('--- Checking Service Account Get About Info ---');
    const about = await drive.about.get({
      fields: 'storageQuota, user',
    });
    console.log('About Info:', JSON.stringify(about.data, null, 2));

    console.log('--- Listing Files in Folder ---');
    const files = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    console.log('Files:', files.data.files);

  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();
