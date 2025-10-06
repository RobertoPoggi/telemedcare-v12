/**
 * TeleMedCare V11.0 Stress Test Service
 * Sistema di stress test per generazione automatica assistiti
 */

import { FunctionalTestService, FullSystemTest } from './functional-test-service'
import { DataManagementService } from './data-management-service'

export interface StressTestConfig {
  assistiti_count: number
  concurrent_threads: number
  delay_between_batches: number // millisecondi
  enable_full_workflow: boolean
  enable_logging: boolean
  test_duration_limit: number // minuti
  performance_monitoring: boolean
}

export interface StressTestResult {
  test_id: string
  config: StressTestConfig
  start_time: string
  end_time?: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'STOPPED'
  progress: {
    assistiti_completed: number
    assistiti_failed: number
    current_batch: number
    total_batches: number
    percentage: number
  }
  performance: {
    total_duration: number
    avg_time_per_assistito: number
    throughput_per_minute: number
    memory_usage?: number
    errors_rate: number
  }
  individual_results: FullSystemTest[]
  summary: {
    total_leads_created: number
    total_assistiti_converted: number
    total_emails_sent: number
    total_workflows_completed: number
    success_rate: number
  }
  errors: string[]
}

export class StressTestService {
  private runningTests = new Map<string, StressTestResult>()
  private functionalTestService: FunctionalTestService
  private dataManagement: DataManagementService

  constructor(private db: D1Database) {
    this.functionalTestService = new FunctionalTestService(db)
    this.dataManagement = new DataManagementService(db)
  }

  /**
   * Avvia stress test con configurazione specifica
   */
  async startStressTest(config: StressTestConfig): Promise<{ testId: string, message: string }> {
    const testId = `STRESS_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const stressTest: StressTestResult = {
      test_id: testId,
      config,
      start_time: new Date().toISOString(),
      status: 'PENDING',
      progress: {
        assistiti_completed: 0,
        assistiti_failed: 0,
        current_batch: 0,
        total_batches: Math.ceil(config.assistiti_count / config.concurrent_threads),
        percentage: 0
      },
      performance: {
        total_duration: 0,
        avg_time_per_assistito: 0,
        throughput_per_minute: 0,
        errors_rate: 0
      },
      individual_results: [],
      summary: {
        total_leads_created: 0,
        total_assistiti_converted: 0,
        total_emails_sent: 0,
        total_workflows_completed: 0,
        success_rate: 0
      },
      errors: []
    }

    this.runningTests.set(testId, stressTest)

    // Avvia test in background (non bloccante)
    this.executeStressTest(testId).catch(error => {
      console.error(`Stress test ${testId} failed:`, error)
      stressTest.status = 'FAILED'
      stressTest.errors.push(`Critical error: ${error.message}`)
    })

    await this.dataManagement.addSystemLog(
      'STRESS_TEST_STARTED',
      'StressTestService',
      `Stress test avviato - Target: ${config.assistiti_count} assistiti`,
      { testId, config },
      'INFO'
    )

    return {
      testId,
      message: `Stress test avviato con ID ${testId}. Target: ${config.assistiti_count} assistiti in ${stressTest.progress.total_batches} batch.`
    }
  }

  /**
   * Esegue lo stress test
   */
  private async executeStressTest(testId: string): Promise<void> {
    const test = this.runningTests.get(testId)!
    test.status = 'RUNNING'

    const startTime = Date.now()
    const config = test.config
    
    try {
      // Calcola batches
      const batchSize = config.concurrent_threads
      const totalBatches = Math.ceil(config.assistiti_count / batchSize)

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Check timeout
        const elapsedMinutes = (Date.now() - startTime) / (1000 * 60)
        if (elapsedMinutes > config.test_duration_limit) {
          test.status = 'STOPPED'
          test.errors.push('Test interrotto per timeout')
          break
        }

        test.progress.current_batch = batchIndex + 1
        
        // Calcola quanti assistiti in questo batch
        const remainingAssistiti = config.assistiti_count - (batchIndex * batchSize)
        const currentBatchSize = Math.min(batchSize, remainingAssistiti)
        
        // Esegui batch parallelo
        const batchPromises: Promise<void>[] = []
        
        for (let i = 0; i < currentBatchSize; i++) {
          batchPromises.push(this.processSingleAssistito(testId))
        }

        // Attendi completamento batch
        await Promise.allSettled(batchPromises)

        // Update progress
        test.progress.percentage = Math.round((test.progress.current_batch / totalBatches) * 100)

        // Performance monitoring
        if (config.performance_monitoring) {
          await this.updatePerformanceMetrics(testId)
        }

        // Delay tra batch
        if (batchIndex < totalBatches - 1 && config.delay_between_batches > 0) {
          await this.sleep(config.delay_between_batches)
        }

        // Log progress ogni 10 batch
        if (config.enable_logging && batchIndex % 10 === 0) {
          await this.dataManagement.addSystemLog(
            'STRESS_TEST_PROGRESS',
            'StressTestService',
            `Stress test ${testId} - Batch ${batchIndex + 1}/${totalBatches} completato`,
            { 
              testId, 
              progress: test.progress, 
              performance: test.performance 
            },
            'INFO'
          )
        }
      }

      // Finalizza test
      await this.finalizeStressTest(testId)

    } catch (error) {
      test.status = 'FAILED'
      test.errors.push(`Execution error: ${error.message}`)
      
      await this.dataManagement.addSystemLog(
        'STRESS_TEST_ERROR',
        'StressTestService',
        `Errore durante stress test ${testId}`,
        { testId, error: error.message },
        'ERROR'
      )
    }
  }

  /**
   * Processa un singolo assistito nel test
   */
  private async processSingleAssistito(testId: string): Promise<void> {
    const test = this.runningTests.get(testId)!
    
    try {
      const result = await this.functionalTestService.runFullSystemTest()
      
      if (test.config.enable_full_workflow) {
        test.individual_results.push(result)
      }

      // Update counters
      if (result.success) {
        test.progress.assistiti_completed++
        if (result.summary.lead_created) test.summary.total_leads_created++
        if (result.summary.assistito_converted) test.summary.total_assistiti_converted++
        if (result.summary.workflow_completed) test.summary.total_workflows_completed++
        test.summary.total_emails_sent += result.summary.emails_sent
      } else {
        test.progress.assistiti_failed++
        test.errors.push(`Failed individual test: ${result.test_id}`)
      }

    } catch (error) {
      test.progress.assistiti_failed++
      test.errors.push(`Individual test error: ${error.message}`)
    }
  }

  /**
   * Aggiorna metriche performance
   */
  private async updatePerformanceMetrics(testId: string): Promise<void> {
    const test = this.runningTests.get(testId)!
    const now = Date.now()
    const startTime = new Date(test.start_time).getTime()
    
    test.performance.total_duration = now - startTime
    
    const totalProcessed = test.progress.assistiti_completed + test.progress.assistiti_failed
    if (totalProcessed > 0) {
      test.performance.avg_time_per_assistito = test.performance.total_duration / totalProcessed
      test.performance.throughput_per_minute = (totalProcessed / test.performance.total_duration) * 60000
      test.performance.errors_rate = test.progress.assistiti_failed / totalProcessed
    }

    test.summary.success_rate = totalProcessed > 0 ? 
      (test.progress.assistiti_completed / totalProcessed) * 100 : 0
  }

  /**
   * Finalizza stress test
   */
  private async finalizeStressTest(testId: string): Promise<void> {
    const test = this.runningTests.get(testId)!
    
    test.end_time = new Date().toISOString()
    test.status = 'COMPLETED'
    
    await this.updatePerformanceMetrics(testId)

    await this.dataManagement.addSystemLog(
      'STRESS_TEST_COMPLETED',
      'StressTestService',
      `Stress test ${testId} completato - Assistiti: ${test.progress.assistiti_completed}/${test.config.assistiti_count}`,
      {
        testId,
        final_stats: {
          progress: test.progress,
          performance: test.performance,
          summary: test.summary
        }
      },
      test.summary.success_rate > 90 ? 'INFO' : 'WARNING'
    )
  }

  /**
   * Ottieni stato di un test in corso
   */
  getTestStatus(testId: string): StressTestResult | null {
    return this.runningTests.get(testId) || null
  }

  /**
   * Ottieni lista di tutti i test
   */
  getAllTests(): StressTestResult[] {
    return Array.from(this.runningTests.values())
  }

  /**
   * Ferma un test in corso
   */
  async stopTest(testId: string): Promise<{ success: boolean, message: string }> {
    const test = this.runningTests.get(testId)
    
    if (!test) {
      return { success: false, message: 'Test non trovato' }
    }

    if (test.status === 'COMPLETED' || test.status === 'FAILED') {
      return { success: false, message: 'Test già terminato' }
    }

    test.status = 'STOPPED'
    test.end_time = new Date().toISOString()
    await this.updatePerformanceMetrics(testId)

    await this.dataManagement.addSystemLog(
      'STRESS_TEST_STOPPED',
      'StressTestService',
      `Stress test ${testId} fermato manualmente`,
      { testId, final_progress: test.progress },
      'WARNING'
    )

    return { success: true, message: `Test ${testId} fermato con successo` }
  }

  /**
   * Pulisci test completati
   */
  cleanupCompletedTests(): number {
    const toRemove: string[] = []
    
    for (const [testId, test] of this.runningTests) {
      if (test.status === 'COMPLETED' || test.status === 'FAILED') {
        // Rimuovi test completati da più di 1 ora
        const endTime = new Date(test.end_time || test.start_time).getTime()
        const hourAgo = Date.now() - (60 * 60 * 1000)
        
        if (endTime < hourAgo) {
          toRemove.push(testId)
        }
      }
    }

    toRemove.forEach(testId => this.runningTests.delete(testId))
    
    return toRemove.length
  }

  /**
   * Genera configurazione test rapida
   */
  generateQuickTestConfig(assistitiCount: number): StressTestConfig {
    return {
      assistiti_count: assistitiCount,
      concurrent_threads: Math.min(assistitiCount, 5), // Max 5 thread paralleli
      delay_between_batches: 500, // 0.5 secondi tra batch
      enable_full_workflow: true,
      enable_logging: true,
      test_duration_limit: 30, // 30 minuti max
      performance_monitoring: true
    }
  }

  /**
   * Genera configurazione stress intensivo
   */
  generateIntensiveTestConfig(assistitiCount: number): StressTestConfig {
    return {
      assistiti_count: assistitiCount,
      concurrent_threads: Math.min(assistitiCount, 10), // Max 10 thread paralleli
      delay_between_batches: 100, // 0.1 secondi tra batch
      enable_full_workflow: true,
      enable_logging: false, // Meno logging per performance
      test_duration_limit: 60, // 1 ora max
      performance_monitoring: true
    }
  }

  /**
   * Utility sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}