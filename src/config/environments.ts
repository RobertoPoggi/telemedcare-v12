/**
 * TeleMedCare V12.0 - Environment Configuration System
 * Gestione completa ambienti: test, staging, produzione
 */

export type Environment = 'development' | 'test' | 'staging' | 'production'

export interface DatabaseConfig {
  binding: string
  database_name: string
  database_id: string
  migration_path: string
  seed_path?: string
}

export interface EnvironmentConfig {
  name: Environment
  description: string
  database: DatabaseConfig
  deployment: {
    project_name: string
    branch: string
    auto_deploy: boolean
    requires_approval: boolean
  }
  features: {
    testing_enabled: boolean
    stress_testing_enabled: boolean
    debug_logging: boolean
    performance_monitoring: boolean
  }
  urls: {
    base_url?: string
    admin_dashboard: string
    api_base: string
    documentation: string
  }
}

/**
 * Configurazioni ambienti TeleMedCare
 */
export const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'development',
    description: 'Ambiente di sviluppo locale',
    database: {
      binding: 'DB',
      database_name: 'telemedcare-leads', // Database attuale per sviluppo
      database_id: 'local-database-for-development',
      migration_path: './migrations',
      seed_path: './seed-development.sql'
    },
    deployment: {
      project_name: 'webapp-dev',
      branch: 'dev',
      auto_deploy: false,
      requires_approval: false
    },
    features: {
      testing_enabled: true,
      stress_testing_enabled: true,
      debug_logging: true,
      performance_monitoring: false
    },
    urls: {
      admin_dashboard: '/admin/data-dashboard',
      api_base: '/api',
      documentation: '/admin/docs'
    }
  },

  test: {
    name: 'test',
    description: 'Ambiente di test automatizzato',
    database: {
      binding: 'DB_TEST',
      database_name: 'telemedcare_test_01', // Versioning per ambienti test
      database_id: 'test-database-01',
      migration_path: './migrations',
      seed_path: './seed-test.sql'
    },
    deployment: {
      project_name: 'telemedcare-test',
      branch: 'test',
      auto_deploy: true,
      requires_approval: false
    },
    features: {
      testing_enabled: true,
      stress_testing_enabled: true,
      debug_logging: true,
      performance_monitoring: true
    },
    urls: {
      base_url: 'https://telemedcare-test.pages.dev',
      admin_dashboard: '/admin/data-dashboard',
      api_base: '/api',
      documentation: '/admin/docs'
    }
  },

  staging: {
    name: 'staging',
    description: 'Ambiente di staging pre-produzione',
    database: {
      binding: 'DB_STAGING',
      database_name: 'telemedcare_staging',
      database_id: 'staging-database',
      migration_path: './migrations',
      seed_path: './seed-staging.sql'
    },
    deployment: {
      project_name: 'telemedcare-staging',
      branch: 'staging',
      auto_deploy: true,
      requires_approval: true
    },
    features: {
      testing_enabled: true,
      stress_testing_enabled: false,
      debug_logging: false,
      performance_monitoring: true
    },
    urls: {
      base_url: 'https://telemedcare-staging.pages.dev',
      admin_dashboard: '/admin/data-dashboard',
      api_base: '/api',
      documentation: '/admin/docs'
    }
  },

  production: {
    name: 'production',
    description: 'Ambiente di produzione - TeleMedCare Live',
    database: {
      binding: 'DB_PROD',
      database_name: 'telemedcare_database', // Database di produzione
      database_id: 'production-database',
      migration_path: './migrations',
    },
    deployment: {
      project_name: 'telemedcare-production',
      branch: 'main',
      auto_deploy: false,
      requires_approval: true
    },
    features: {
      testing_enabled: false,
      stress_testing_enabled: false,
      debug_logging: false,
      performance_monitoring: true
    },
    urls: {
      base_url: 'https://telemedcare.pages.dev',
      admin_dashboard: '/admin/data-dashboard',
      api_base: '/api',
      documentation: '/admin/docs'
    }
  }
}

/**
 * Utility per ottenere configurazione ambiente corrente
 */
export function getCurrentEnvironment(): Environment {
  // Determina ambiente dalla variabile ENVIRONMENT o default a development
  if (typeof process !== 'undefined' && process.env.ENVIRONMENT) {
    return process.env.ENVIRONMENT as Environment
  }
  
  // In Cloudflare Workers, usa le binding per determinare l'ambiente
  if (typeof globalThis !== 'undefined') {
    // Logic per determinare ambiente in base ai binding disponibili
    return 'development'
  }
  
  return 'development'
}

/**
 * Ottieni configurazione per ambiente specifico
 */
export function getEnvironmentConfig(env?: Environment): EnvironmentConfig {
  const targetEnv = env || getCurrentEnvironment()
  return ENVIRONMENTS[targetEnv]
}

/**
 * Genera nome database versioned per test
 */
export function generateTestDatabaseName(version: number = 1): string {
  return `telemedcare_test_${version.toString().padStart(2, '0')}`
}

/**
 * Validazione configurazione ambiente
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): boolean {
  const required = ['name', 'database', 'deployment']
  return required.every(key => key in config && config[key])
}