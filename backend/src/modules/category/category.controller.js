import {
  getCategories as getCategoriesService,
  getCategoryById as getCategoryByIdService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
} from "./category.service.js";

export async function getCategories(req, res) {
  try {
    const categories = await getCategoriesService(req.user.id);

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error obteniendo categorías:", error);

    res.status(500).json({
      error: "Error obteniendo las categorías"
    });
  }
}

export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;

    const category = await getCategoryByIdService(id, req.user.id);

    if (!category) {
      return res.status(404).json({
        error: "Categoría no encontrada."
      });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error obteniendo categoría:", error);

    res.status(500).json({
      error: "Error obteniendo la categoría"
    });
  }
}

export async function createCategory(req, res) {
  try {
    const categoryData = req.body;

    const category = await createCategoryService(categoryData, req.user.id);

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creando categoría:", error);

    if (error.type === "VALIDATION_ERROR") {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: "Error creando la categoría"
    });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const categoryData = req.body;

    const category = await updateCategoryService(
      id, 
      categoryData, 
      req.user.id
    );

    if (!category) {
      return res.status(404).json({
        error: "Categoría no encontrada."
      });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error actualizando categoría:", error);

    if (error.type === "VALIDATION_ERROR") {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: "Error actualizando la categoría"
    });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await deleteCategoryService(id, req.user.id);

    if (!category) {
      return res.status(404).json({
        error: "Categoría no encontrada."
      });
    }

    res.status(200).json({
      message: "Categoría eliminada correctamente."
    });
  } catch (error) {
    console.error("Error eliminando categoría:", error);

    res.status(500).json({
      error: "Error eliminando la categoría"
    });
  }
}