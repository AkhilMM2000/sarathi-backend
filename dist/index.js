"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
// 1️⃣ LOAD ALL DI FIRST
require("./infrastructure/config/container");
require("./infrastructure/config/useCaseContainer");
require("./infrastructure/config/controllerContainer");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// 2️⃣ AFTER DI, YOU CAN IMPORT CONTROLLERS & ROUTES
const userRoutes_1 = __importDefault(require("./presentation/routes/userRoutes"));
const driverRoutes_1 = __importDefault(require("./presentation/routes/driverRoutes"));
const AuthRoute_1 = __importDefault(require("./presentation/routes/AuthRoute"));
const adminRoutes_1 = __importDefault(require("./presentation/routes/adminRoutes"));
const fileRoutes_1 = __importDefault(require("./presentation/routes/fileRoutes"));
const googleAuthRoute_1 = __importDefault(require("./presentation/routes/googleAuthRoute"));
const BookingRoute_1 = __importDefault(require("./presentation/routes/BookingRoute"));
const Routes_1 = require("./constants/Routes");
const errorHandler_1 = require("./middleware/errorHandler");
const socket_1 = require("./infrastructure/socket/socket");
const referralSocket_1 = require("./infrastructure/socket/referralSocket");
const SocketNotification_1 = require("./infrastructure/socket/SocketNotification");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// 3️⃣ ROUTES (they can safely resolve controllers now)
app.use(Routes_1.ROUTES.USER.BASE, userRoutes_1.default);
app.use(Routes_1.ROUTES.DRIVER.BASE, driverRoutes_1.default);
app.use(Routes_1.ROUTES.ADMIN.BASE, adminRoutes_1.default);
app.use(Routes_1.ROUTES.FILES.BASE, fileRoutes_1.default);
app.use(Routes_1.ROUTES.BOOKING.BASE, BookingRoute_1.default);
app.use(Routes_1.ROUTES.AUTH.BASE, AuthRoute_1.default);
app.use(Routes_1.ROUTES.AUTH.GOOGLE.BASE, googleAuthRoute_1.default);
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app);
// 4️⃣ Socket initialization
(0, socket_1.initializeSocket)(server);
(0, referralSocket_1.initializeReferralSocket)();
(0, SocketNotification_1.NotificationSocket)();
// 5️⃣ DB + Server start
(0, database_1.connectDB)().then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
//# sourceMappingURL=index.js.map