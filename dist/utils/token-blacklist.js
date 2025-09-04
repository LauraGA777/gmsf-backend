"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TokenBlacklist {
    static add(token) {
        TokenBlacklist.blacklist.add(token);
    }
    static has(token) {
        return TokenBlacklist.blacklist.has(token);
    }
    // Opcional: Limpiar tokens antiguos periódicamente
    static cleanup() {
        TokenBlacklist.blacklist.clear();
    }
}
TokenBlacklist.blacklist = new Set();
exports.default = TokenBlacklist;
