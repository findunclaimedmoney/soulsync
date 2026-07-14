import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import entitiesRouter from "./entities";
import integrationsRouter from "./integrations";
import functionsRouter from "./functions";
import companionRouter from "./companion";
import heygenRouter from "./heygen";
import mobileRouter from "./mobile";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/entities", entitiesRouter);
router.use("/integrations", integrationsRouter);
router.use("/functions", functionsRouter);
router.use(companionRouter);
router.use(heygenRouter);
router.use("/mobile", mobileRouter);

export default router;
