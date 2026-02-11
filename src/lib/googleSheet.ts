import { google, sheets_v4 } from 'googleapis';
import { SheetName } from '@/constants/enums';

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Initialize Google Sheets API client
const getGoogleSheetsClient = (): sheets_v4.Sheets => {
  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

// Generic type for sheet row data
type SheetRowData = Record<string, unknown>;

const sheets = getGoogleSheetsClient();
const spreadsheetId = SPREADSHEET_ID || '';

// Parse value from sheet (convert strings to appropriate types)
const parseValue = (value: string | undefined): unknown => {
  if (value === undefined || value === '') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Don't convert strings that look like phone numbers (start with 0 and length > 1)
  if (value.startsWith('0') && value.length > 1) return value;
  
  if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
  return value;
};

// Get all rows from a sheet
const getAll = async <T extends SheetRowData>(sheetName: SheetName): Promise<T[]> => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return [];

    const headers = rows[0] as string[];
    const data = rows.slice(1);

    return data.map((row) => {
      const obj: SheetRowData = {};
      headers.forEach((header, index) => {
        obj[header] = parseValue(row[index]);
      });
      return obj as T;
    });
  } catch (error) {
    console.error(`Error getting data from ${sheetName}:`, error);
    throw error;
  }
};

const getById = async <T extends SheetRowData>(
  sheetName: SheetName,
  idField: string,
  id: string
): Promise<T | null> => {
  const allRows = await getAll<T>(sheetName);
  return allRows.find((row) => {
    const rowIdValue = row[idField];
    // Compare as strings
    return String(rowIdValue) === String(id);
  }) || null;
};

// Get rows by field value
const getByField = async <T extends SheetRowData>(
  sheetName: SheetName,
  field: string,
  value: unknown
): Promise<T[]> => {
  const allRows = await getAll<T>(sheetName);
  return allRows.filter((row) => row[field] === value);
};

// Append a new row to a sheet
const append = async <T extends SheetRowData>(sheetName: SheetName, data: T): Promise<T> => {
  try {
    // Get headers first
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });

    const headers = headersResponse.data.values?.[0] as string[];
    if (!headers) throw new Error('Sheet headers not found');

    // Create row values in correct order
    const rowValues = headers.map((header) => {
      const value = data[header];
      return value !== undefined ? String(value) : '';
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });

    return data;
  } catch (error) {
    console.error(`Error appending to ${sheetName}:`, error);
    throw error;
  }
};

// Update a row by ID
const update = async <T extends SheetRowData>(
  sheetName: SheetName,
  idField: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return null;

    const headers = rows[0] as string[];
    const idIndex = headers.indexOf(idField);
    if (idIndex === -1) return null;

    // Find row index
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(parseValue(rows[i][idIndex])) === String(id)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) return null;

    // Update values
    const currentRow = rows[rowIndex];
    const updatedRow = headers.map((header, index) => {
      if (header in updates) {
        return String(updates[header as keyof typeof updates] ?? '');
      }
      return currentRow[index] || '';
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    // Return updated record
    const updatedRecord: SheetRowData = {};
    headers.forEach((header, index) => {
      updatedRecord[header] = parseValue(updatedRow[index]);
    });

    return updatedRecord as T;
  } catch (error) {
    console.error(`Error updating ${sheetName}:`, error);
    throw error;
  }
};

// Delete a row by ID
const deleteRow = async (sheetName: SheetName, idField: string, id: string): Promise<boolean> => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) return false;

    const headers = rows[0] as string[];
    const idIndex = headers.indexOf(idField);
    if (idIndex === -1) return false;

    // Find row index
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(parseValue(rows[i][idIndex])) === String(id)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) return false;

    // Get sheet ID for delete request
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet?.properties?.sheetId) return false;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error(`Error deleting from ${sheetName}:`, error);
    throw error;
  }
};

export const googleSheet = {
  getAll,
  getById,
  getByField,
  append,
  update,
  delete: deleteRow,
};
