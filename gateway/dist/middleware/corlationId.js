"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
exports.default = (req, res, next) => {
    let uuid = (0, uuid_1.v4)();
    req.headers.corelationId = uuid;
    console.log("corelationId add to req", req.headers.corelationId);
    next();
};
