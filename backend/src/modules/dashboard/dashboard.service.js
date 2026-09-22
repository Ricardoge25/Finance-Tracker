import pool from "../../../database.js";

export async function getDashboardMetricsService(userId) {
  // 1. Patrimonio total
  const balanceResult = await pool.query(
    "SELECT COALESCE(SUM(balance), 0) AS total_balance FROM accounts WHERE user_id = $1",
    [userId]
  );
  const totalBalance = parseFloat(balanceResult.rows[0].total_balance);

  // 2. Ingresos y gastos del mes actual
  const monthlyMetricsQuery = `
    SELECT t.type, COALESCE(SUM(t.amount), 0) AS total
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE a.user_id = $1
      AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY t.type
  `;
  const monthlyMetrics = await pool.query(monthlyMetricsQuery, [userId]);

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  monthlyMetrics.rows.forEach((row) => {
    if (row.type === "INGRESO") monthlyIncome = parseFloat(row.total);
    if (row.type === "GASTO") monthlyExpenses = parseFloat(row.total);
  });

  // 3. Distribución de gastos por categoría (mes actual)
  const categoryDistributionQuery = `
    SELECT COALESCE(c.name, 'Sin categoría') AS category_name,
           COALESCE(SUM(t.amount), 0) AS total
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE a.user_id = $1
      AND t.type = 'GASTO'
      AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY c.name
    ORDER BY total DESC
  `;
  const categoriesResult = await pool.query(categoryDistributionQuery, [userId]);

  // 4. Últimas 5 transacciones
  const recentTransactionsQuery = `
    SELECT t.id, t.amount, t.type, t.description, t.transaction_date,
           a.name AS account_name, c.name AS category_name
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE a.user_id = $1
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT 5
  `;
  const recentTransactions = await pool.query(recentTransactionsQuery, [userId]);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    categoryDistribution: categoriesResult.rows,
    recentTransactions: recentTransactions.rows,
  };
}

export async function getBalanceHistoryService(userId, days = 30) {
  const query = `
    WITH daily_net AS (
      SELECT
        t.transaction_date AS day,
        SUM(CASE WHEN t.type = 'INGRESO' THEN t.amount ELSE -t.amount END) AS net_change
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE a.user_id = $1
        AND t.transaction_date >= CURRENT_DATE - $2::integer
      GROUP BY t.transaction_date
    )
    SELECT
      day,
      net_change,
      SUM(net_change) OVER (ORDER BY day ASC) AS cumulative_change
    FROM daily_net
    ORDER BY day ASC
  `;
  const result = await pool.query(query, [userId, days]);
  return result.rows;
}