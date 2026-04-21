#!/usr/bin/env node
// CI-compatible build script
// In CI with Node 18: uses pre-committed dist/ (avoids undici/Node 20 requirement)
// Locally or in CI with Node 20+: runs vite build normally
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const nodeVersion = parseInt(process.versions.node.split('.')[0], 10)
const isCI = process.env.CI === 'true'
const distExists = fs.existsSync(path.join(process.cwd(), 'dist', '_worker.js'))

console.log(`Node: ${process.versions.node}, CI: ${isCI}, dist exists: ${distExists}`)

if (isCI && distExists && nodeVersion < 20) {
  console.log('✅ CI mode with Node < 20: using pre-committed dist/ (skip vite build)')
  process.exit(0)
} else {
  console.log('🔨 Running vite build...')
  try {
    execSync('npx vite build', { stdio: 'inherit' })
  } catch (e) {
    process.exit(1)
  }
}
