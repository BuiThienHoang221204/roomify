import { google, sheets_v4 } from 'googleapis';
import { SheetName } from '@/constants/enums';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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

// Table definitions with headers
const tableDefinitions = {
  [SheetName.META]: [
    'table_name',
    'last_id'
  ],
  [SheetName.USERS]: [
    'user_id',
    'phone',
    'full_name',
    'cccd',
    'cccd_image',
    'role',
    'created_at'
  ],
  [SheetName.ROOMS]: [
    'room_id',
    'room_code',
    'price',
    'electric_price',
    'water_price',
    'extra_fee',
    'status',
    'admin_id',
    'created_at'
  ],
  [SheetName.RENTALS]: [
    'rental_id',
    'user_id',
    'room_id',
    'start_date',
    'end_date',
    'status'
  ],
  [SheetName.METERS]: [
    'meter_id',
    'rental_id',
    'type',
    'month',
    'old_value',
    'new_value',
    'ocr_value',
    'image_url',
    'confirmed',
    'created_at'
  ],
  [SheetName.INVOICES]: [
    'invoice_id',
    'rental_id',
    'month',
    'room_price',
    'electric_cost',
    'water_cost',
    'extra_fee',
    'total',
    'payment_method',
    'payment_status',
    'transaction_id',
    'paid_at'
  ],
  [SheetName.ISSUES]: [
    'issue_id',
    'rental_id',
    'title',
    'description',
    'media_url',
    'status',
    'created_at'
  ]
};

// Function to check if sheet exists
const sheetExists = async (sheets: sheets_v4.Sheets, sheetName: string): Promise<boolean> => {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    );

    return Boolean(sheetExists);
  } catch (error) {
    console.error(`Error checking if sheet ${sheetName} exists:`, error);
    return false;
  }
};

// Function to create a new sheet
const createSheet = async (sheets: sheets_v4.Sheets, sheetName: string): Promise<void> => {
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 26
                }
              }
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error(`❌ Error creating sheet ${sheetName}:`, error);
    throw error;
  }
};

// Function to add headers to a sheet
const addHeaders = async (sheets: sheets_v4.Sheets, sheetName: string, headers: string[]): Promise<void> => {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

  } catch (error) {
    console.error(`❌ Error adding headers to ${sheetName}:`, error);
    throw error;
  }
};

// Function to format headers (make them bold)
const formatHeaders = async (sheets: sheets_v4.Sheets, sheetName: string, headerCount: number): Promise<void> => {
  try {
    // Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet?.properties?.sheetId) {
      console.log(`⚠️ Could not find sheet ID for ${sheetName}`);
      return;
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheet.properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headerCount
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true
                  },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                  }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error(`❌ Error formatting headers for ${sheetName}:`, error);
  }
};

// Initialize META table with default records
const initializeMetaTable = async (sheets: sheets_v4.Sheets): Promise<void> => {
  try {
    const metaRecords = [
      ['users', '0'],
      ['rooms', '0'], 
      ['rentals', '0'],
      ['meters', '0'],
      ['invoices', '0'],
      ['issues', '0']
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SheetName.META}!A:B`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: metaRecords,
      },
    });
  } catch (error) {
    console.error(`❌ Error initializing META table:`, error);
    throw error;
  }
};

// Main function to create all tables
export const createTables = async (): Promise<void> => {
  try {
    console.log('🚀 Starting table creation process...');

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !SPREADSHEET_ID) {
      throw new Error('Missing required environment variables for Google Sheets');
    }

    const sheets = getGoogleSheetsClient();

    // Create sheets and add headers
    for (const [sheetName, headers] of Object.entries(tableDefinitions)) {
      console.log(`\n📋 Processing sheet: ${sheetName}`);

      // Check if sheet already exists
      const exists = await sheetExists(sheets, sheetName);

      if (exists) {
        console.log(`⚠️ Sheet "${sheetName}" already exists, skipping creation`);
        continue;
      }

      // Create sheet
      await createSheet(sheets, sheetName);

      // Add headers
      await addHeaders(sheets, sheetName, headers);

      // Format headers
      await formatHeaders(sheets, sheetName, headers.length);

      // Initialize META table with default records
      if (sheetName === SheetName.META) {
        await initializeMetaTable(sheets);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ All tables created successfully!');
    console.log('\n📊 Tables created:');
    Object.keys(tableDefinitions).forEach(sheetName => {
      console.log(`   - ${sheetName}`);
    });

  } catch (error) {
    console.error('\n❌ Error creating tables:', error);
    throw error;
  }
};

// Run the script if called directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('\n🎉 Table creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Table creation failed:', error);
      process.exit(1);
    });
}