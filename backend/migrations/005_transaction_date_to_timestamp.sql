ALTER TABLE transactions
ALTER COLUMN transaction_date TYPE TIMESTAMP USING transaction_date::TIMESTAMP;