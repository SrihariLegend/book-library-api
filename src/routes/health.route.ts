import { Router } from "express";
import { buildSuccess } from "../lib/response";

const router = Router();
router.get("/", (_req, res) => {
  res.json(buildSuccess({ status: "ok" }));
});
export default router;
