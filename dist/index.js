"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./infrastructure/config/container");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database");
const userRoutes_1 = __importDefault(require("./presentation/routes/userRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const driverRoutes_1 = __importDefault(require("./presentation/routes/driverRoutes"));
const AuthRoute_1 = __importDefault(require("./presentation/routes/AuthRoute"));
const adminRoutes_1 = __importDefault(require("./presentation/routes/adminRoutes"));
const fileRoutes_1 = __importDefault(require("./presentation/routes/fileRoutes"));
const googleAuthRoute_1 = __importDefault(require("./presentation/routes/googleAuthRoute"));
const BookingRoute_1 = __importDefault(require("./presentation/routes/BookingRoute"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const dotenv_1 = __importDefault(require("dotenv"));
const socket_1 = require("./infrastructure/socket/socket");
const referralSocket_1 = require("./infrastructure/socket/referralSocket");
const SocketNotification_1 = require("./infrastructure/socket/SocketNotification");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies (like JWT tokens) to be sent
}));
app.use(express_1.default.json());
// Routes
app.use("/api/users", userRoutes_1.default);
app.use('/api/drivers', driverRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use("/api/files", fileRoutes_1.default);
app.use('/api', BookingRoute_1.default);
app.use('/api/auth', AuthRoute_1.default);
app.use('/api/auth/google', googleAuthRoute_1.default);
const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
    (0, errorHandler_1.errorHandler)(err, req, res, next);
});
const server = http_1.default.createServer(app);
(0, socket_1.initializeSocket)(server);
(0, referralSocket_1.initializeReferralSocket)();
(0, SocketNotification_1.NotificationSocket)();
// Start Server
(0, database_1.connectDB)().then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
//# sourceMappingURL=index.js.map