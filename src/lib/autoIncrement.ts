import { google, sheets_v4 } from 'googleapis';
import { SheetName } from '@/constants/enums';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

function getGoogleSheetsClient(): sheets_v4.Sheets {
  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Get next auto-increment ID for a table,  Uses META sheet to track last used IDs
export async function getNextId(tableName: SheetName): Promise<number> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = SPREADSHEET_ID || '';

  try {
    // Get all META records
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SheetName.META}!A:B`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 1) {
      throw new Error('META sheet not found or empty');
    }

    // Find the row for this table
    let rowIndex = -1;
    let lastId = 0;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === tableName) {
        rowIndex = i;
        lastId = parseInt(rows[i][1], 10) || 0;
        break;
      }
    }

    const nextId = lastId + 1;

    if (rowIndex === -1) {
      // Table not in META yet, add it
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SheetName.META}!A:B`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[tableName, nextId]],
        },
      });
    } else {
      // Update existing row
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SheetName.META}!B${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[nextId]],
        },
      });
    }

    return nextId;
  } catch (error) {
    console.error(`Error getting next ID for ${tableName}:`, error);
    throw error;
  }
}

// Initialize META sheet with all table names
export async function initializeMetaSheet(): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = SPREADSHEET_ID || '';

  const tables = [
    SheetName.USERS,
    SheetName.ROOMS,
    SheetName.RENTALS,
    SheetName.METERS,
    SheetName.INVOICES,
    SheetName.ISSUES,
  ];

  try {
    // Check if META sheet has headers
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SheetName.META}!A1:B1`,
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SheetName.META}!A1:B1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['table_name', 'last_id']],
        },
      });

      // Add initial records for all tables
      const initialData = tables.map((table) => [table, '0']);
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SheetName.META}!A:B`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: initialData,
        },
      });
    }
  } catch (error) {
    console.error('Error initializing META sheet:', error);
    throw error;
  }
}
