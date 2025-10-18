-- Migration 0013: Add configuration_data column to configurations table
-- This allows storing flexible JSON configuration data alongside structured columns

ALTER TABLE configurations ADD COLUMN configuration_data TEXT;
