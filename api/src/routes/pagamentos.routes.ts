import { Router } from "express";
import { PagamentoController } from "../controllers/PagamentoController";
const router = Router();
const ctrl = new PagamentoController();

// CRUD básico de exemplo
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
