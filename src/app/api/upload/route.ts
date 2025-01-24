import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const path = formData.get('path') as string

    if (!file) {
      return new NextResponse('No file provided', { status: 400 })
    }

    if (!bucket) {
      return new NextResponse('No bucket specified', { status: 400 })
    }

    if (!path) {
      return new NextResponse('No path specified', { status: 400 })
    }

    console.log('Processing upload request:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      bucket,
      path
    })

    // Get authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return new NextResponse(error.message, { status: 500 })
    }

    if (!data?.path) {
      return new NextResponse('No path returned from storage', { status: 500 })
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    if (!urlData?.publicUrl) {
      return new NextResponse('Failed to generate public URL', { status: 500 })
    }

    console.log('Upload successful:', {
      path: data.path,
      publicUrl: urlData.publicUrl
    })

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to upload file',
      { status: 500 }
    )
  }
} 