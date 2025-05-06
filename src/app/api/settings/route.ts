import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// Assuming a single row in 'company_settings' table to store all settings
// You might need to adjust the logic if you have multiple rows or a different structure.
const SETTINGS_ROW_ID = 1; // Or fetch dynamically if ID is not fixed

// GET company settings (logo, banners, etc.)
export async function GET(request: NextRequest) {
  // TODO: Add authorization if needed (e.g., only admins can view certain settings)
  try {
    // Fetch the first row (or specific row by ID) from company_settings
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      // .eq('id', SETTINGS_ROW_ID) // Use if you have a fixed ID
      .limit(1)
      .single(); // Expecting only one row of settings

    if (error) {
      // If no settings row exists yet, maybe return default values or 404
      if (error.code === 'PGRST116') { // Not Found
        console.warn('No company settings found in the database.');
        // Return empty object or default settings structure
        return NextResponse.json({}, { status: 200 }); // Or 404 if settings are mandatory
      }
      console.error('Error fetching company settings:', error);
      return NextResponse.json({ error: 'Error fetching company settings', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data || {}, { status: 200 });

  } catch (err) {
    console.error('Unexpected error fetching company settings:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching company settings', details: errorMessage }, { status: 500 });
  }
}

// PUT (Update) company settings
export async function PUT(request: NextRequest) {
  // TODO: Implement proper admin authorization check here before proceeding.

  try {
    const settingsData = await request.json();

    // Remove fields that shouldn't be updated directly if necessary
    delete settingsData.id; 
    delete settingsData.created_at;

    if (Object.keys(settingsData).length === 0) {
      return NextResponse.json({ error: 'No settings data provided for update' }, { status: 400 });
    }

    // Upsert logic: Update if exists, Insert if not (requires knowing the ID or using a unique constraint)
    // Using update first, assuming the row exists. Adjust if needed.
    const { data, error } = await supabase
      .from('company_settings')
      .update(settingsData)
      // Match the specific settings row. If you always have one row, you might use a known ID.
      // If the table could be empty, you might need an upsert or check-then-insert/update logic.
      .eq('id', SETTINGS_ROW_ID) // Assuming 'id' 1 is the settings row
      .select();

    if (error) {
      console.error('Error updating company settings:', error);
      return NextResponse.json({ error: 'Error updating company settings', details: error.message }, { status: 500 });
    }

    // Check if the settings row was found and updated
    if (!data || data.length === 0) {
        // Attempt to insert if update failed (maybe the row didn't exist)
        // This requires the table to allow insertion or use upsert
        console.warn(`Settings row (ID ${SETTINGS_ROW_ID}) not found for update. Attempting insert...`);
        const { data: insertData, error: insertError } = await supabase
            .from('company_settings')
            .insert([{ ...settingsData, id: SETTINGS_ROW_ID }]) // Explicitly set ID if needed and possible
            .select();

        if (insertError) {
            console.error('Error inserting company settings after failed update:', insertError);
            return NextResponse.json({ error: 'Error creating/updating company settings', details: insertError.message }, { status: 500 });
        }
        if (!insertData || insertData.length === 0) {
             return NextResponse.json({ error: 'Failed to update or insert settings' }, { status: 500 });
        }
        return NextResponse.json(insertData[0], { status: 200 }); // Return inserted data
    }

    return NextResponse.json(data[0], { status: 200 }); // Return updated data

  } catch (err) {
    console.error('Unexpected error updating company settings:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error updating company settings', details: errorMessage }, { status: 500 });
  }
}

