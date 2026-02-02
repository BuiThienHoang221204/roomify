import { google, sheets_v4 } from 'googleapis';
import { SheetName } from '@/constants/enums';

// Environment variables
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Initialize Google Sheets API
function getGoogleSheetsClient(): sheets_v4.Sheets {
  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Generic type for sheet row data
type SheetRowData = Record<string, unknown>;

class GoogleSheetAdapter {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    this.sheets = getGoogleSheetsClient();
    this.spreadsheetId = SPREADSHEET_ID || '';
  }

  /**
   * Get all rows from a sheet
   */
  async getAll<T extends SheetRowData>(sheetName: SheetName): Promise<T[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) return [];

      const headers = rows[0] as string[];
      const data = rows.slice(1);

      return data.map((row) => {
        const obj: SheetRowData = {};
        headers.forEach((header, index) => {
          obj[header] = this.parseValue(row[index]);
        });
        return obj as T;
      });
    } catch (error) {
      console.error(`Error getting data from ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single row by ID
   */
  async getById<T extends SheetRowData>(
    sheetName: SheetName,
    idField: string,
    id: number
  ): Promise<T | null> {
    const allRows = await this.getAll<T>(sheetName);
    return allRows.find((row) => row[idField] === id) || null;
  }

  /**
   * Get rows by field value
   */
  async getByField<T extends SheetRowData>(
    sheetName: SheetName,
    field: string,
    value: unknown
  ): Promise<T[]> {
    const allRows = await this.getAll<T>(sheetName);
    return allRows.filter((row) => row[field] === value);
  }

  /**
   * Append a new row to a sheet
   */
  async append<T extends SheetRowData>(sheetName: SheetName, data: T): Promise<T> {
    try {
      // Get headers first
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = headersResponse.data.values?.[0] as string[];
      if (!headers) throw new Error('Sheet headers not found');

      // Create row values in correct order
      const rowValues = headers.map((header) => {
        const value = data[header];
        return value !== undefined ? String(value) : '';
      });

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowValues],
        },
      });

      return data;
    } catch (error) {
      console.error(`Error appending to ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Update a row by ID
   */
  async update<T extends SheetRowData>(
    sheetName: SheetName,
    idField: string,
    id: number,
    updates: Partial<T>
  ): Promise<T | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
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
        if (this.parseValue(rows[i][idIndex]) === id) {
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

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });

      // Return updated record
      const updatedRecord: SheetRowData = {};
      headers.forEach((header, index) => {
        updatedRecord[header] = this.parseValue(updatedRow[index]);
      });

      return updatedRecord as T;
    } catch (error) {
      console.error(`Error updating ${sheetName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a row by ID
   */
  async delete(sheetName: SheetName, idField: string, id: number): Promise<boolean> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
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
        if (this.parseValue(rows[i][idIndex]) === id) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex === -1) return false;

      // Get sheet ID for delete request
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = spreadsheet.data.sheets?.find(
        (s) => s.properties?.title === sheetName
      );

      if (!sheet?.properties?.sheetId) return false;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
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
  }

  /**
   * Parse value from sheet (convert strings to appropriate types)
   */
  private parseValue(value: string | undefined): unknown {
    if (value === undefined || value === '') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
    return value;
  }
}

// Export singleton instance
export const googleSheet = new GoogleSheetAdapter();
