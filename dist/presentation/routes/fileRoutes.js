"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const FileController_1 = require("../controllers/FileController");
const Routes_1 = require("../../constants/Routes");
const router = (0, express_1.Router)();
const fileController = tsyringe_1.container.resolve(FileController_1.FileController);
router.get(Routes_1.ROUTES.FILES.SIGNED_URL, (req, res, next) => {
    fileController.getSignedUrl(req, res, next);
});
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map