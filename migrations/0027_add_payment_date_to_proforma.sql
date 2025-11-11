-- Add payment_date column to proforma table
-- This is needed for tracking when payment was confirmed

ALTER TABLE proforma ADD COLUMN data_pagamento TEXT;

-- Update existing records to set data_pagamento = updated_at for already paid proformas
UPDATE proforma 
SET data_pagamento = updated_at 
WHERE status IN ('PAID_BANK_TRANSFER', 'PAID_STRIPE');
