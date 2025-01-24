import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Format the data for saving
    const formattedData = JSON.stringify(data, null, 2);
    
    // Get the paths to both landmarks.json files
    const srcPath = join(process.cwd(), 'src', 'data', 'landmarks.json');
    const publicPath = join(process.cwd(), 'public', 'data', 'landmarks.json');
    
    // Write to both files
    await Promise.all([
      writeFile(srcPath, formattedData, 'utf8'),
      writeFile(publicPath, formattedData, 'utf8')
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving landmarks:', error);
    return NextResponse.json(
      { error: 'Failed to save landmarks' },
      { status: 500 }
    );
  }
} 