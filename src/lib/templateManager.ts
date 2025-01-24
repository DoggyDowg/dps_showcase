import { compareVersions, isCompatibleVersion } from '@/types/template'
import type { PropertyTemplate } from '@/types/template'
import type { PropertyContent, PropertyFeature } from '@/types/property'

class TemplateManager {
  private templates: Map<string, PropertyTemplate> = new Map()
  private currentVersion: string = '1.0.0'

  constructor() {
    // Initialize with version 1.0.0
    this.registerTemplate({
      version: '1.0.0',
      components: [],
      schema: {
        hero: {
          headline: '',
          subheadline: ''
        },
        features: {
          items: [] as PropertyFeature[],
          header: '',
          headline: '',
          banner_title: ''
        },
        lifestyle: {
          header: '',
          headline: '',
          description: '',
          banner_title: ''
        },
        neighbourhood: {
          text: '',
          part1_headline: '',
          part1_text: '',
          part2_headline: '',
          part2_text: '',
          part3_headline: '',
          part3_text: '',
          banner_title: ''
        },
        seo: {
          title: '',
          description: ''
        },
        og: {
          title: '',
          description: ''
        }
      } as PropertyContent,
      migrations: [],
      created_at: new Date().toISOString(),
      changes: ['Initial version'],
      is_stable: true
    })
  }

  registerTemplate(template: PropertyTemplate) {
    this.templates.set(template.version, template)
  }

  getCurrentVersion(): string {
    return this.currentVersion
  }

  getTemplate(version: string): PropertyTemplate | undefined {
    return this.templates.get(version)
  }

  isUpgradeAvailable(currentVersion: string): boolean {
    return compareVersions(this.currentVersion, currentVersion) > 0
  }

  canUpgrade(fromVersion: string, toVersion: string): boolean {
    return isCompatibleVersion(fromVersion, toVersion)
  }

  async upgradeContent(content: PropertyContent, fromVersion: string, toVersion: string): Promise<PropertyContent> {
    if (!this.canUpgrade(fromVersion, toVersion)) {
      throw new Error(`Cannot upgrade from ${fromVersion} to ${toVersion}`)
    }

    const template = this.getTemplate(toVersion)
    if (!template) {
      throw new Error(`Template version ${toVersion} not found`)
    }

    let upgradedContent = { ...content } as PropertyContent

    // Apply migrations in sequence
    template.migrations?.forEach(migration => {
      if (compareVersions(fromVersion, migration.from) >= 0 && 
          compareVersions(migration.to, toVersion) <= 0) {
        upgradedContent = migration.migrate(upgradedContent) as PropertyContent
      }
    })

    return upgradedContent
  }
}

export const templateManager = new TemplateManager() 