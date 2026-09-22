import { getDashboardMetricsService, getBalanceHistoryService } from "./dashboard.service.js";

export async function getDashboardMetrics(req, res) {
  try {
    const userId = req.user.id;
    const metrics = await getDashboardMetricsService(userId);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getBalanceHistory(req, res) {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await getBalanceHistoryService(req.user.id, days);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}