
type Level = "debug" | "info" | "warn" | "error";

export interface LogEntry {
    id: string;
    level: Level;
    message: string;
    meta: Record<string, unknown>;
    ts: number;
}

let _listeners: ((entry: LogEntry) => void)[] = [];
let _minLevel: Level = "debug";

const LEVELS: Record<Level, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function emit(level: Level, message: string, meta: Record<string, unknown> = {}) {
    if (LEVELS[level] < LEVELS[_minLevel]) return;

    const entry: LogEntry = {
        id: crypto.randomUUID(),
        level,
        message,
        meta,
        ts: Date.now(),
    };

    _listeners.forEach((fn) => fn(entry));
}

export const logger = {
    debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta ?? {}),
    info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta ?? {}),
    warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta ?? {}),
    error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta ?? {}),

    setLevel: (level: Level) => { _minLevel = level; },

    subscribe: (fn: (entry: LogEntry) => void) => {
        _listeners.push(fn);
        return () => { _listeners = _listeners.filter((l) => l !== fn); };
    },
};