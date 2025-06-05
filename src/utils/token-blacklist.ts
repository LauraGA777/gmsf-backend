class TokenBlacklist {
    private static blacklist: Set<string> = new Set();

    static add(token: string): void {
        TokenBlacklist.blacklist.add(token);
    }

    static has(token: string): boolean {
        return TokenBlacklist.blacklist.has(token);
    }

    // Opcional: Limpiar tokens antiguos periódicamente
    static cleanup(): void {
        TokenBlacklist.blacklist.clear();
    }
}

export default TokenBlacklist; 