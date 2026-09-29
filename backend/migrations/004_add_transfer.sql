-- Las transferencias no tienen categoría (no son ni ingreso ni gasto real)
ALTER TABLE transactions
ALTER COLUMN category_id DROP NOT NULL;

-- Cuenta destino, solo aplica para transferencias
ALTER TABLE transactions
ADD COLUMN to_account_id INTEGER NULL
  REFERENCES accounts(id) ON DELETE RESTRICT;

-- Se amplía el tipo permitido
ALTER TABLE transactions
DROP CONSTRAINT chk_transaction_type;

ALTER TABLE transactions
ADD CONSTRAINT chk_transaction_type
  CHECK (type IN ('INGRESO', 'GASTO', 'TRANSFERENCIA'));

-- Consistencia: una transferencia siempre tiene una cuenta destino distinta de la origen;
-- cualquier otro tipo nunca tiene una cuenta destino.
ALTER TABLE transactions
ADD CONSTRAINT chk_transfer_consistency
  CHECK (
    (type = 'TRANSFERENCIA' AND to_account_id IS NOT NULL AND to_account_id <> account_id)
    OR
    (type <> 'TRANSFERENCIA' AND to_account_id IS NULL)
  );