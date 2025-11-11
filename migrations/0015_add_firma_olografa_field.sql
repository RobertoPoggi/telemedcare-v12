-- Migration 0015: Add firma olografa field to contracts table
-- Date: 2025-11-09
-- Purpose: Allow admin to confirm receipt of signed paper contract

ALTER TABLE contracts ADD COLUMN firma_olografa_ricevuta INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN firma_olografa_data_ricezione TEXT;
ALTER TABLE contracts ADD COLUMN firma_olografa_note TEXT;

-- Verify
SELECT COUNT(*) as has_column 
FROM pragma_table_info('contracts') 
WHERE name='firma_olografa_ricevuta';
