import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Property } from '@/types/property'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

// Helper function to generate static files
async function generateStaticFiles(property: Property): Promise<{ files: Array<{ file: string; data: string }> }> {
  const BUILD_DIR = path.join(process.cwd(), '.showcase-builds', property.id)
  
  try {
    console.log('Starting static file generation...')
    console.log('Build directory:', BUILD_DIR)
    console.log('Property ID:', property.id)
    
    // 1. Create and clean build directory
    console.log('Creating build directory...')
    await fs.ensureDir(BUILD_DIR)
    await fs.emptyDir(BUILD_DIR)
    
    // 2. Copy template files
    const templateDir = path.join(process.cwd(), '..', 'property-showcase-template')
    console.log('Copying template files from:', templateDir)
    console.log('Template directory exists:', await fs.pathExists(templateDir))
    await fs.copy(templateDir, BUILD_DIR)
    
    // 3. Update package.json with property-specific details
    console.log('Updating package.json...')
    const packageJsonPath = path.join(BUILD_DIR, 'package.json')
    const packageJson = await fs.readJson(packageJsonPath)
    packageJson.name = `property-${property.id}`
    packageJson.version = '1.0.0'
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })
    
    // 4. Create .env.local with property configuration
    console.log('Creating .env.local...')
    const envContent = `
NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
NEXT_PUBLIC_PROPERTY_ID=${property.id}
`
    await fs.writeFile(path.join(BUILD_DIR, '.env.local'), envContent.trim())
    
    // 5. Generate property-specific configuration
    console.log('Creating property config...')
    const configContent = `
export const PROPERTY_CONFIG = {
  id: "${property.id}",
  name: "${property.name}",
  template: "${property.template_name}",
  customDomain: "${property.custom_domain || ''}",
}
`
    // Ensure the config directory exists
    await fs.ensureDir(path.join(BUILD_DIR, 'src/config'))
    await fs.writeFile(path.join(BUILD_DIR, 'src/config/property.ts'), configContent.trim())
    
    // 6. Prepare files array for Vercel deployment
    console.log('Preparing files for deployment...')
    const files: Array<{ file: string; data: string }> = []
    
    // Helper function to recursively read directory
    const readDirRecursive = async (dir: string) => {
      console.log('Reading directory:', dir)
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.relative(BUILD_DIR, fullPath)
        
        if (entry.isDirectory()) {
          await readDirRecursive(fullPath)
        } else {
          // Skip large binary files and node_modules
          if (!relativePath.includes('node_modules') && !relativePath.endsWith('.png') && !relativePath.endsWith('.jpg')) {
            console.log('Adding file:', relativePath)
            const content = await fs.readFile(fullPath, 'utf-8')
            files.push({
              file: relativePath,
              data: content
            })
          }
        }
      }
    }
    
    await readDirRecursive(BUILD_DIR)
    
    console.log(`Generated ${files.length} files for deployment`)
    return { files }
    
  } catch (error) {
    console.error('Detailed error in generateStaticFiles:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    throw new Error(`Failed to generate static files: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    // Clean up build directory
    try {
      await fs.remove(BUILD_DIR)
      console.log('Cleaned up build directory')
    } catch (cleanupError) {
      console.error('Error cleaning up build directory:', cleanupError)
    }
  }
}

// Helper function to configure custom domain with Vercel
async function configureDomain(domain: string, propertyId: string): Promise<void> {
  const vercelToken = process.env.VERCEL_API_TOKEN
  if (!vercelToken) throw new Error('Vercel API token not configured')

  try {
    console.log('Configuring domain:', domain, 'for property:', propertyId)
    
    // 1. Add domain to project
    const addDomainResponse = await fetch(`https://api.vercel.com/v9/projects/property-${propertyId}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain })
    })

    if (!addDomainResponse.ok) {
      const error = await addDomainResponse.json()
      throw new Error(`Failed to add domain: ${error.message || 'Unknown error'}`)
    }

    // 2. Verify domain configuration
    const verifyResponse = await fetch(`https://api.vercel.com/v9/projects/property-${propertyId}/domains/${domain}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      }
    })

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json()
      console.warn('Domain verification pending:', error.message)
      // Don't throw here as verification might take time
    }

  } catch (error) {
    console.error('Error configuring domain:', error)
    throw new Error('Failed to configure domain')
  }
}

// Helper function to set up SSL certificate with Vercel
async function configureSSL(domain: string): Promise<void> {
  const vercelToken = process.env.VERCEL_API_TOKEN
  if (!vercelToken) throw new Error('Vercel API token not configured')

  try {
    console.log('Configuring SSL for domain:', domain)
    
    // Enable SSL for the domain
    const response = await fetch(`https://api.vercel.com/v9/domains/${domain}/certificates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        autoRenew: true,
        type: 'lets-encrypt'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.warn('SSL configuration pending:', error.message)
      // Don't throw as SSL provisioning might take time
    }

  } catch (error) {
    console.error('Error configuring SSL:', error)
    throw new Error('Failed to configure SSL certificate')
  }
}

// Helper function to test build locally
async function testLocalBuild(buildDir: string): Promise<boolean> {
  try {
    console.log('Testing build in directory:', buildDir)
    
    // Install dependencies
    console.log('Installing dependencies...')
    execSync('npm install', { cwd: buildDir })
    
    // Try building
    console.log('Testing build...')
    execSync('npm run build', { cwd: buildDir })
    
    console.log('✅ Build test successful!')
    return true
  } catch (error) {
    console.error('❌ Build test failed:', error)
    return false
  }
}

async function generateAndTestStaticFiles(property: Property) {
    const BUILD_DIR = path.join(process.cwd(), '.showcase-builds', property.id)
    
    try {
        // Generate files as before
        const { files } = await generateStaticFiles(property)
        
        // Test the build locally
        const buildSuccess = await testLocalBuild(BUILD_DIR)
        if (!buildSuccess) {
            throw new Error('Local build test failed')
        }
        
        return { files }
    } catch (error) {
        console.error('Build preparation failed:', error)
        throw error
    }
}

export async function POST(request: Request) {
  try {
    const { propertyId, customDomain } = await request.json()
    console.log('Starting deployment for property:', propertyId)
    
    const supabase = createRouteHandlerClient({ cookies })
    const vercelToken = process.env.VERCEL_API_TOKEN

    if (!vercelToken) {
      throw new Error('Vercel API token not configured')
    }

    // 1. Get property details from Supabase
    console.log('Fetching property details...')
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      throw propertyError
    }
    if (!property) {
      console.error('Property not found:', propertyId)
      throw new Error('Property not found')
    }

    // 2. Generate static files for the property
    console.log('Generating static files...')
    const { files } = await generateAndTestStaticFiles(property)
    console.log(`Generated ${files.length} files`)

    // 3. Get or create project
    console.log('Getting/creating project...')
    const projectName = `property-${propertyId}`
    
    // First try to get the project
    console.log('Looking up project:', projectName)
    const getProjectResponse = await fetch(`https://api.vercel.com/v9/projects?name=${encodeURIComponent(projectName)}`, {
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      }
    })

    let projectId: string
    
    if (getProjectResponse.ok) {
      const { projects } = await getProjectResponse.json()
      const existingProject = projects?.[0]
      
      if (existingProject) {
        projectId = existingProject.id
        console.log('Found existing project:', projectId)
      } else {
        // If no projects found, create one
        console.log('Project not found, creating new project...')
        const createProjectResponse = await fetch('https://api.vercel.com/v9/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: projectName,
            framework: 'nextjs'
          })
        })

        const newProject = await createProjectResponse.json()
        console.log('Project creation response:', JSON.stringify(newProject, null, 2))
        
        if (!createProjectResponse.ok) {
          console.error('Project creation failed:', newProject)
          throw new Error(`Project creation failed: ${newProject.error?.message || JSON.stringify(newProject)}`)
        }
        
        projectId = newProject.id
        console.log('Created new project:', projectId)
      }
    } else {
      const projectError = await getProjectResponse.json()
      console.error('Error looking up project:', projectError)
      throw new Error(`Project lookup failed: ${projectError.error?.message || JSON.stringify(projectError)}`)
    }

    // 4. Create deployment
    console.log('Creating deployment...')
    const deploymentPayload = {
      name: projectName,
      files,
      target: 'production',
      framework: 'nextjs',
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_PROPERTY_ID: propertyId
      }
    }
    
    console.log('Deployment payload:', JSON.stringify(deploymentPayload, null, 2))
    
    const deploymentResponse = await fetch(`https://api.vercel.com/v9/deployments?projectId=${projectId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentPayload)
    })

    const deploymentData = await deploymentResponse.json()
    console.log('Deployment response:', JSON.stringify(deploymentData, null, 2))

    if (!deploymentResponse.ok) {
      console.error('Deployment failed:', deploymentData)
      throw new Error(`Deployment failed: ${deploymentData.error?.message || JSON.stringify(deploymentData)}`)
    }

    // 5. Update property with deployment URL and custom domain if provided
    console.log('Updating property with deployment URL...')
    const updateData: Partial<Property> & { status: string; deployment_url: string } = {
      status: 'published',
      deployment_url: deploymentData.url
    }

    if (customDomain) {
      console.log('Configuring custom domain:', customDomain)
      await configureDomain(customDomain, propertyId)
      await configureSSL(customDomain)
      updateData.custom_domain = customDomain
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)

    if (updateError) {
      console.error('Error updating property:', updateError)
      throw updateError
    }

    console.log('Deployment completed successfully!')
    return NextResponse.json({ 
      success: true,
      deploymentUrl: deploymentData.url,
      customDomain: customDomain || null
    })

  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to deploy property'
      },
      { status: 500 }
    )
  }
}