-- Query per verificare lo schema della tabella configurations
SELECT sql FROM sqlite_master WHERE type='table' AND name='configurations';
