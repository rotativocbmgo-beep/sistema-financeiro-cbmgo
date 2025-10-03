import { Router } from "express";
import { ProcessoController } from "../controllers/ProcessoController";

const router = Router();
const processoController = new ProcessoController();

// Rotas de exportação
router.get("/lancamentos/export/csv", processoController.exportCSV);
router.get("/lancamentos/export/pdf", processoController.exportPDF); // <-- NOVA ROTA

// Rotas existentes
router.post("/", processoController.create);
router.get("/", processoController.list);
router.get("/:id", processoController.getById);
router.patch("/:id/liquidar", processoController.liquidar);

export default router;
