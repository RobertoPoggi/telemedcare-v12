-- Migration 0029: Add OCR-extracted fields to devices table
-- For CE label scanning and device inventory management

-- Add IMEI field (required for device tracking)
ALTER TABLE devices ADD COLUMN imei TEXT;

-- Add manufacturer information
ALTER TABLE devices ADD COLUMN manufacturer TEXT;
ALTER TABLE devices ADD COLUMN manufacturer_address TEXT;

-- Add manufacturing/certification dates
ALTER TABLE devices ADD COLUMN manufacturing_date TEXT;
ALTER TABLE devices ADD COLUMN ce_certification_date TEXT;

-- Add UDI (Unique Device Identifier) codes
ALTER TABLE devices ADD COLUMN udi_primary TEXT;
ALTER TABLE devices ADD COLUMN udi_secondary TEXT;

-- Add additional device metadata
ALTER TABLE devices ADD COLUMN device_notes TEXT;

-- Create indexes for OCR-searchable fields
CREATE INDEX IF NOT EXISTS idx_devices_imei ON devices(imei);
CREATE INDEX IF NOT EXISTS idx_devices_manufacturer ON devices(manufacturer);
CREATE INDEX IF NOT EXISTS idx_devices_udi_primary ON devices(udi_primary);

-- Log migration
-- Migration 0029 applied: OCR device fields added successfully
