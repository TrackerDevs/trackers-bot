const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const GSHEET_ID = "1EjpqxkoFnpscT-vmEjsvFSdqqg7O4Fei7wGqGU6Z5HM"

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'lib/credentials/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'lib/credentials/credentials.json');
// const TOKEN_PATH = path.join(process.cwd(), './credentials/token.json');
// const CREDENTIALS_PATH = path.join(process.cwd(), './credentials/credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.log(err)
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function fetchEmails(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GSHEET_ID,
    range: 'Form Responses 1!B2:B',
  });

  await fs.writeFile('json/emails.json', JSON.stringify(res.data.values.flat()))

  return auth;
}

async function fetchVerified(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GSHEET_ID,
    range: 'verified!A2:A',
  });

  await fs.writeFile('json/verified.json', JSON.stringify(res.data.values?.flat() || []))
  
  return auth;
}
 
const addVerified = (email) => async (auth) => {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: GSHEET_ID,
    range: 'verified!A2:A',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      majorDimension: 'ROWS', 
      values: [[email]]
    }
  });

  return auth;
}

// authorize().then(addVerified('email'))
// authorize().then(fetchEmails).then(fetchVerified)
// .then(fetchVerified)
module.exports = {authorize, fetchEmails, fetchVerified, addVerified};