ALTER TABLE transactions
ADD COLUMN reversed_transaction_id INTEGER
  REFERENCES transactions(id)
  NULL,
ADD COLUMN reversal_reason TEXT
  NULL;