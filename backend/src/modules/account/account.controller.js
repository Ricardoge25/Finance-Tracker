import {
    getAccounts as getAccountsService,
    getAccountById as getAccountByIdService,
    createAccount as createAccountService,
    updateAccount as updateAccountService,
    deleteAccount as deleteAccountService,
} from "./account.service.js";

/* PETICIÓN PARA OBTENER CUENTAS */
export async function getAccounts(req, res) {
  try {
    const accounts = await getAccountsService(req.user.id);
    res.status(200).json(accounts);
  } catch (error) {
    console.error("❌ Error en GET /accounts:", error);
    res.status(500).json({ error: error.message || "Error al obtener las cuentas" });
  }
}

/* PETICIÓN PARA OBTENER UNA CUENTA EXISTENTE */
export async function getAccountById(req, res) {
  try {
    const { id } = req.params;
    const account = await getAccountByIdService(id, req.user.id);
    if (!account) return res.status(404).json({ error: "Cuenta no encontrada." });
    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo la cuenta." });
  }
}

/* PETICIÓN PARA CREAR CUENTA NUEVA */
export async function createAccount(req, res) {
  try {
    const account = await createAccountService(req.body, req.user.id);
    res.status(201).json(account);
  } catch (error) {
    if (error.type === "VALIDATION_ERROR") {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Error creando cuenta" });
  }
}

/* PETICIÓN PARA EDITAR UNA CUENTA EXISTENTE */
export async function updateAccount(req, res) {
  try {
    const { id } = req.params;
    const account = await updateAccountService(id, req.body, req.user.id);
    if (!account) return res.status(404).json({ error: "Cuenta no encontrada." });
    res.status(200).json(account);
  } catch (error) {
    console.error("Error actualizando cuenta:", error);
    if (error.type === "VALIDATION_ERROR") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error actualizando la cuenta" });
  }
}

/* PETICIÓN PARA ELIMINAR UNA CUENTA EXISTENTE */
export async function deleteAccount(req, res) {
  try {
    const { id } = req.params;
    const account = await deleteAccountService(id, req.user.id);
    if (!account) return res.status(404).json({ error: "Cuenta no encontrada." });
    return res.status(200).json({ message: "Cuenta eliminada correctamente." });
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    return res.status(500).json({ error: "Error eliminando la cuenta." });
  }
}