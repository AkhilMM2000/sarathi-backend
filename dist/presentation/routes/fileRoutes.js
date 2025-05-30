"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const FileController_1 = require("../controllers/FileController");
const router = (0, express_1.Router)();
const fileController = tsyringe_1.container.resolve(FileController_1.FileController);
router.get("/signed-url", async (req, res) => {
    await fileController.getSignedUrl(req, res);
});
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map