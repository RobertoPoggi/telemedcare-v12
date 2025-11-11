-- Add inviata_il column to proforma table for email tracking
-- Migration: 0025_add_inviata_il_to_proforma.sql
-- Date: 2025-11-10

ALTER TABLE proforma ADD COLUMN inviata_il TEXT;

-- Update existing records to have NULL or current timestamp
-- (leave as NULL for now, will be populated on next email send)
