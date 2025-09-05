import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if column already exists
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'skills')
      .eq('column_name', 'brand_logo');

    if (checkError) {
      console.error('Check column error:', checkError);
    }

    if (columns && columns.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Column brand_logo already exists in skills table.'
      });
    }

    // Since we can't use DDL through Supabase client, we'll provide SQL instruction
    return NextResponse.json({
      success: false,
      message: 'Please run this SQL manually in your database:',
      sql: `
        ALTER TABLE skills 
        ADD COLUMN IF NOT EXISTS brand_logo TEXT;
        
        COMMENT ON COLUMN skills.brand_logo IS 'Path to uploaded brand/skill logo image';
      `,
      instructions: 'Go to your Supabase dashboard > SQL Editor and run the above SQL command.'
    }, { status: 200 });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Failed to check schema',
      instructions: 'Please manually add the brand_logo column to your skills table.'
    }, { status: 500 });
  }
}

// Alternative migration for direct SQL access
export async function GET() {
  return NextResponse.json({
    message: 'To migrate the skills table, run this SQL:',
    sql: `
      ALTER TABLE skills 
      ADD COLUMN IF NOT EXISTS brand_logo TEXT;
      
      COMMENT ON COLUMN skills.brand_logo IS 'Path to uploaded brand/skill logo image';
    `,
    instructions: 'Copy and paste this SQL into your Supabase dashboard SQL Editor and execute it.'
  });
}