import { PropertyContent } from './property';

export interface TemplateVersion {
  major: number
  minor: number
  patch: number
  created_at: string
  changes: string[]
  is_stable: boolean
}

export interface TemplateComponent {
  name: string
  version: string
  path: string
}

export interface PropertyTemplate {
  version: string
  components: TemplateComponent[]
  schema: Partial<PropertyContent>
  migrations?: {
    from: string
    to: string
    migrate: (content: PropertyContent) => PropertyContent
  }[]
  created_at: string
  changes: string[]
  is_stable: boolean
}

export const parseVersion = (version: string): TemplateVersion => {
  const [major, minor, patch] = version.split('.').map(Number)
  return {
    major,
    minor,
    patch,
    created_at: new Date().toISOString(),
    changes: [],
    is_stable: false
  }
}

export const compareVersions = (v1: string, v2: string): number => {
  const [major1, minor1, patch1] = v1.split('.').map(Number)
  const [major2, minor2, patch2] = v2.split('.').map(Number)

  if (major1 !== major2) return major1 - major2
  if (minor1 !== minor2) return minor1 - minor2
  return patch1 - patch2
}

export const isCompatibleVersion = (showcase: string, template: string): boolean => {
  const [major1] = showcase.split('.').map(Number)
  const [major2] = template.split('.').map(Number)
  return major1 === major2
} 