-- Migration 0024: Simplify contract codes to CTR-001, CTR-002, etc.
-- Updates existing contracts with sequential simple codes

-- Update existing contracts to simple sequential codes
-- We'll update them in order of their ID (oldest first)

UPDATE contracts SET codice_contratto = 'CTR-001' WHERE id = (SELECT id FROM contracts ORDER BY id LIMIT 1 OFFSET 0);
UPDATE contracts SET codice_contratto = 'CTR-002' WHERE id = (SELECT id FROM contracts ORDER BY id LIMIT 1 OFFSET 1);
UPDATE contracts SET codice_contratto = 'CTR-003' WHERE id = (SELECT id FROM contracts ORDER BY id LIMIT 1 OFFSET 2);
UPDATE contracts SET codice_contratto = 'CTR-004' WHERE id = (SELECT id FROM contracts ORDER BY id LIMIT 1 OFFSET 3);
UPDATE contracts SET codice_contratto = 'CTR-005' WHERE id = (SELECT id FROM contracts ORDER BY id LIMIT 1 OFFSET 4);
UPDATE contracts SET codice_contratto = 'CTR-006' WHERE id = (SELECT id FROM contracts ORDER BY id LIMIT 1 OFFSET 5);
