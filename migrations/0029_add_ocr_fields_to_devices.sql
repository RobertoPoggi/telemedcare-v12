-- Migration 0029: Add OCR fields to devices table for CE label data extraction
-- This migration adds fields needed to store data extracted from device CE labels via OCR

-- Add IMEI field
ALTER TABLE devices ADD COLUMN imei TEXT;

-- Add manufacturer information
ALTER TABLE devices ADD COLUMN manufacturer TEXT;

-- Add manufacturing date
ALTER TABLE devices ADD COLUMN manufacturing_date TEXT;

-- Add UDI codes (stored as JSON string)
ALTER TABLE devices ADD COLUMN udi_codes TEXT;

-- Add manufacturer details (stored as JSON string)
ALTER TABLE devices ADD COLUMN manufacturer_details TEXT;

-- Add CE label image URL
ALTER TABLE devices ADD COLUMN ce_label_image_url TEXT;

-- Create index on IMEI for quick lookups
CREATE INDEX IF NOT EXISTS idx_devices_imei ON devices(imei);

-- Create index on serial_number if not exists (for device identification)
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number);
