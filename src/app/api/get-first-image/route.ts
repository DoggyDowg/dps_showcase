import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dirPath = searchParams.get('dir')

  if (!dirPath) {
    return NextResponse.json({ error: 'Directory path is required' }, { status: 400 })
  }

  try {
    const publicDir = path.join(process.cwd(), 'public', dirPath)
    const files = await fs.readdir(publicDir)
    const imageFile = files.find(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    
    if (imageFile) {
      return NextResponse.json({ path: `/${dirPath}/${imageFile}` })
    }
    return NextResponse.json({ path: '' })
  } catch {
    return NextResponse.json({ path: '' })
  }
} 