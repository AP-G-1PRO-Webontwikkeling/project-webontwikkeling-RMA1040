"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashMiddleware = void 0;
function flashMiddleware(req, res, next) {
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message;
    }
    else {
        res.locals.message = undefined;
    }
    next();
}
exports.flashMiddleware = flashMiddleware;
;
