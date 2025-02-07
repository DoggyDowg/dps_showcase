import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const SOURCE_DIR = process.cwd();
const TEMPLATE_DIR = path.join(process.cwd(), '..', 'property-showcase-template');

// Files and directories to copy
const COPY_PATHS = [
  // Templates
  'src/templates/dubai',
  'src/templates/cusco',
  
  // Essential components
  'src/components/Hero.tsx',
  'src/components/Header.tsx',
  'src/components/Footer.tsx',
  'src/components/YourHome.tsx',
  'src/components/YourLifestyle.tsx',
  'src/components/YourNeighbourhood.tsx',
  'src/components/TransitionGallery.tsx',
  'src/components/AutoScrollGallery.tsx',
  'src/components/Contact.tsx',
  
  // Types and configurations
  'src/types',
  'src/hooks',
  'tailwind.config.ts',
  'next.config.js',
  'tsconfig.json',
];

// Files to create
const NEW_FILES = {
  'package.json': {
    name: 'property-showcase-template',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
    },
    dependencies: {
      next: 'latest',
      react: 'latest',
      'react-dom': 'latest',
      '@supabase/supabase-js': 'latest',
      tailwindcss: 'latest',
    },
  },
  'README.md': `# Property Showcase Template

This is a template repository for property showcase deployments.

## Setup

1. Clone this repository
2. Install dependencies: \`npm install\`
3. Run locally: \`npm run dev\`

## Environment Variables

Create a \`.env.local\` file with:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Deployment

This template is designed to be deployed with Vercel.
`
};

async function createTemplate() {
  try {
    console.log('Creating template repository...');

    // Create template directory
    await fs.ensureDir(TEMPLATE_DIR);

    // Copy specified paths
    for (const p of COPY_PATHS) {
      const sourcePath = path.join(SOURCE_DIR, p);
      const targetPath = path.join(TEMPLATE_DIR, p);
      
      if (await fs.pathExists(sourcePath)) {
        console.log(`Copying ${p}...`);
        await fs.copy(sourcePath, targetPath);
      } else {
        console.warn(`Warning: ${p} not found`);
      }
    }

    // Create new files
    for (const [filename, content] of Object.entries(NEW_FILES)) {
      const filePath = path.join(TEMPLATE_DIR, filename);
      console.log(`Creating ${filename}...`);
      await fs.writeFile(
        filePath,
        typeof content === 'string' ? content : JSON.stringify(content, null, 2)
      );
    }

    // Copy dependencies from current package.json
    const currentPackageJson = await fs.readJson(path.join(SOURCE_DIR, 'package.json'));
    const templatePackageJson = await fs.readJson(path.join(TEMPLATE_DIR, 'package.json'));
    
    templatePackageJson.dependencies = {
      ...templatePackageJson.dependencies,
      ...currentPackageJson.dependencies,
    };
    
    await fs.writeJson(path.join(TEMPLATE_DIR, 'package.json'), templatePackageJson, { spaces: 2 });

    // Initialize git repository
    console.log('Initializing git repository...');
    execSync('git init', { cwd: TEMPLATE_DIR });
    execSync('git add .', { cwd: TEMPLATE_DIR });
    execSync('git commit -m "Initial commit"', { cwd: TEMPLATE_DIR });

    console.log('Template repository created successfully!');
    console.log(`Location: ${TEMPLATE_DIR}`);
    
  } catch (error) {
    console.error('Error creating template:', error);
    process.exit(1);
  }
}

export async function testTemplate() {
    const TEST_DIR = path.join(process.cwd(), '.showcase-test')
    
    try {
        // 1. Create test directory
        await fs.ensureDir(TEST_DIR)
        await fs.emptyDir(TEST_DIR)
        
        // 2. Generate template files
        await createTemplate() // Modified version of current createTemplate
        
        // 3. Install dependencies
        console.log('Installing dependencies...')
        execSync('npm install', { cwd: TEST_DIR })
        
        // 4. Try building
        console.log('Testing build...')
        execSync('npm run build', { cwd: TEST_DIR })
        
        console.log('✅ Template built successfully!')
        return true
    } catch (error) {
        console.error('❌ Template build failed:', error)
        return false
    } finally {
        // Clean up
        await fs.remove(TEST_DIR)
    }
}

// Only run createTemplate if this file is being run directly
if (require.main === module) {
    createTemplate().then(() => {
        console.log('Testing template...')
        return testTemplate()
    }).catch((error) => {
        console.error('Error:', error)
        process.exit(1)
    })
}
