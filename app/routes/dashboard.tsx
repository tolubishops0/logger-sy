import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { logger, type LogEntry } from "~/lib/logger";
import { ErrorBoundary } from "~/components/ErrorBoundary";

import {
    getUsers,
    getUserById,
    getUsersBroken,
    getUsersSlow,
    type User,
    type Admin,
} from "~/lib/fakedb";

// ─────────────────────────────────────────────
//  HEADER
// ─────────────────────────────────────────────
function Header({ onLogout }: { onLogout: () => void }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        logger.info("Header — fetching admin profile");
        setLoading(true);

        setTimeout(() => {
            const stored = sessionStorage.getItem("admin");
            if (!stored) {
                logger.error("Header — no admin session found");
                setLoading(false);
                return;
            }
            const data = JSON.parse(stored) as Admin;
            logger.info("Header — admin profile loaded", { email: data.email });
            setAdmin(data);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 font-mono">
            <div className="flex items-center gap-3">
                <span className="text-blue-400 text-lg">⬡</span>
                <span className="text-white font-bold tracking-widest text-sm">ADMIN</span>
                <span className="text-zinc-700 text-xs tracking-widest hidden sm:block">/ dashboard</span>
            </div>

            <div className="flex items-center gap-4">
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse" />
                        <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
                    </div>
                ) : admin ? (
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center">
                            {admin.avatar}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-zinc-300 text-xs">{admin.name}</p>
                            <p className="text-zinc-600 text-xs">{admin.email}</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-red-400 text-xs">no session</span>
                )}

                <button
                    onClick={onLogout}
                    className="text-zinc-600 hover:text-zinc-300 text-xs border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded transition-colors"
                >
                    logout
                </button>
            </div>
        </header>
    );
}

// ─────────────────────────────────────────────
//  USER LIST — left panel
// ─────────────────────────────────────────────
type FetchMode = "normal" | "broken" | "slow";

function UserList({
    selectedId,
    onSelect,
}: {
    selectedId: number | null;
    onSelect: (id: number) => void;
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<FetchMode>("normal");
    const [fetchKey, setFetchKey] = useState(0);

    const fetchUsers = useCallback(async (fetchMode: FetchMode) => {
        setUsers([]);
        setLoading(true);
        logger.info("UserList — starting fetch", { mode: fetchMode });

        try {
            let data: any;

            if (fetchMode === "broken") data = await getUsersBroken();
            else if (fetchMode === "slow") data = await getUsersSlow();
            else data = await getUsers();
            console.log({ data })
            if (!data.users || !Array.isArray(data.users)) {
                logger.error("UserList — response has wrong shape", {
                    received: typeof data.users,
                    response: data,
                });
                setLoading(false);
                return;
            }

            logger.info("UserList — users loaded", { count: data.users.length, mode: fetchMode });
            setUsers(data.users);
        } catch (err: any) {
            logger.error("UserList — fetch threw an error", { error: err.message });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(mode);
    }, [fetchKey]);

    const refetch = (newMode: FetchMode) => {
        setMode(newMode);
        setFetchKey((k) => k + 1);
        // force re-run with the new mode directly
        setUsers([]);
        setLoading(true);
        logger.info("UserList — starting fetch", { mode: newMode });

        const fetcher =
            newMode === "broken" ? getUsersBroken :
                newMode === "slow" ? getUsersSlow :
                    getUsers;

        fetcher().then((data: any) => {
            if (!data.users || !Array.isArray(data.users)) {
                logger.error("UserList — response has wrong shape", {
                    received: typeof data.users,
                    response: data,
                });
                setLoading(false);
                return;
            }
            logger.info("UserList — users loaded", { count: data.users.length, mode: newMode });
            setUsers(data.users);
            setLoading(false);
        }).catch((err: any) => {
            logger.error("UserList — fetch threw an error", { error: err.message });
            setLoading(false);
        });
    };

    const STATUS_COLORS: Record<string, string> = {
        active: "text-green-400 bg-green-400/10",
        inactive: "text-zinc-500 bg-zinc-500/10",
        suspended: "text-red-400 bg-red-400/10",
    };

    return (
        <div className="flex flex-col h-full">

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <p className="text-zinc-500 text-xs tracking-widest font-mono">USERS</p>
                <span className="text-zinc-700 text-xs font-mono">{users.length} total</span>
            </div>

            {/* Fetch mode buttons */}
            <div className="flex gap-1.5 p-3 border-b border-zinc-800">
                {(["normal", "broken", "slow"] as FetchMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => refetch(m)}
                        className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${m === "broken" ? "border-red-900 text-red-500 hover:bg-red-500/10" :
                            m === "slow" ? "border-yellow-900 text-yellow-500 hover:bg-yellow-500/10" :
                                "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <div className="flex flex-col gap-2 p-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
                        ))}
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-zinc-700 text-xs font-mono">
                        no users loaded
                    </div>
                )}

                {!loading && users.map((u) => (
                    <button
                        key={u.id}
                        onClick={() => {
                            logger.info("UserList — user selected", { userId: u.id, name: u.name });
                            onSelect(u.id);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors text-left ${selectedId === u.id ? "bg-zinc-800/60 border-l-2 border-l-blue-500" : ""
                            }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold flex items-center justify-center flex-shrink-0 font-mono">
                            {u.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-zinc-200 text-xs font-mono truncate">{u.name}</p>
                            <p className="text-zinc-600 text-xs font-mono truncate">{u.role}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-mono flex-shrink-0 ${STATUS_COLORS[u.status]}`}>
                            {u.status}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  USER DETAIL — right panel
// ─────────────────────────────────────────────
function UserDetail({ userId }: { userId: number | null }) {
    const [user, setUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        setUser(null);
        setLoading(true);
        logger.info("UserDetail — fetching user details", { userId });

        getUserById(userId)
            .then(({ user }) => {
                logger.info("UserDetail — user details loaded", { userId, name: user.name });
                setUser(user);
                setLoading(false);
            })
            .catch((err) => {
                logger.error("UserDetail — failed to load user", { userId, error: err.message });
                setLoading(false);
            });
    }, [userId]);

    if (!userId) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-700 text-xs font-mono">
                ← select a user to see details
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-800 animate-pulse" />
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-3 bg-zinc-800 rounded animate-pulse" />
                        <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
                    </div>
                </div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-zinc-800/50 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    if (!user) return null;

    const STATUS_COLORS: Record<string, string> = {
        active: "text-green-400 bg-green-400/10 border-green-400/20",
        inactive: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
        suspended: "text-red-400 bg-red-400/10 border-red-400/20",
    };

    const fields = [
        { label: "EMAIL", value: user.email },
        { label: "ROLE", value: user.role },
        { label: "LOCATION", value: user.location },
        { label: "JOINED", value: user.joined },
        { label: "LAST SEEN", value: user.lastSeen },
        { label: "POSTS", value: String(user.posts) },
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto">

            {/* User hero */}
            <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-lg font-bold flex items-center justify-center font-mono">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-base font-mono">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded border font-mono ${STATUS_COLORS[user.status]}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col divide-y divide-zinc-800/50">
                {fields.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-6 py-3.5">
                        <span className="text-zinc-600 text-xs tracking-widest font-mono">{label}</span>
                        <span className="text-zinc-300 text-xs font-mono">{value}</span>
                    </div>
                ))}
            </div>

        </div>
    );
}

// ─────────────────────────────────────────────
//  LOG PANEL
// ─────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
    info: "text-blue-400 border-blue-400/30",
    warn: "text-yellow-400 border-yellow-400/30",
    error: "text-red-400 border-red-400/30",
    debug: "text-cyan-400 border-cyan-400/30",
};

function LogPanel({ logs }: { logs: LogEntry[] }) {
    const [open, setOpen] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    const visible = filter === "all" ? logs : logs.filter((l) => l.level === filter);

    return (
        <div className={`border-t border-zinc-800 bg-zinc-950 font-mono transition-all ${open ? "h-52" : "h-9"}`}>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 h-9 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                    >
                        {open ? "▼" : "▲"} LOGS
                    </button>
                    {open && (
                        <div className="flex gap-1">
                            {["all", "info", "warn", "error", "debug"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`text-xs px-2 py-0.5 rounded transition-colors ${filter === f ? "bg-zinc-700 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <span className="text-zinc-700 text-xs">{logs.length} entries</span>
            </div>

            {/* Entries */}
            {open && (
                <div className="h-40 overflow-y-auto">
                    {visible.length === 0 && (
                        <div className="flex items-center justify-center h-full text-zinc-700 text-xs">
                            no logs yet
                        </div>
                    )}
                    {visible.map((log, i) => {
                        const elapsed = ((log.ts - (logs[0]?.ts ?? log.ts)) / 1000).toFixed(2);
                        return (
                            <div key={log.id} className="flex items-start gap-3 px-4 py-2 border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors">
                                <span className="text-zinc-700 text-xs flex-shrink-0 tabular-nums">+{elapsed}s</span>
                                <span className={`text-xs border rounded px-1.5 py-px flex-shrink-0 font-bold ${LEVEL_COLORS[log.level]}`}>
                                    {log.level.toUpperCase()}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-zinc-400 text-xs">{log.message}</span>
                                    {Object.keys(log.meta).length > 0 && (
                                        <span className="text-zinc-700 text-xs ml-2 break-all">
                                            {JSON.stringify(log.meta)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────
function Footer() {
    return (
        <footer className="px-6 py-3 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between font-mono">
            <span className="text-zinc-700 text-xs">logger demo · built with React Router</span>
            <span className="text-zinc-700 text-xs">{new Date().getFullYear()}</span>
        </footer>
    );
}

// ─────────────────────────────────────────────
//  DASHBOARD PAGE
// ─────────────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        // redirect if not logged in
        if (!sessionStorage.getItem("admin")) {
            navigate("/");
            return;
        }

        logger.info("Dashboard — mounted");
        return logger.subscribe((entry) =>
            setLogs((prev) => [...prev.slice(-299), entry])
        );
    }, []);

    const handleLogout = () => {
        logger.info("Dashboard — admin logged out");
        sessionStorage.removeItem("admin");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-mono">

            {/* Header */}
            <Header onLogout={handleLogout} />

            {/* Body */}
            <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 57px - 44px - 208px)" }}>

                {/* Left — user list */}
                <div className="w-72 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col">
                    <ErrorBoundary section="UserList" onReset={() => setResetKey((k) => k + 1)}>
                        <UserList
                            key={resetKey}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                    </ErrorBoundary>
                </div>

                {/* Right — user detail */}
                {/* <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-zinc-500 text-xs tracking-widest">USER DETAILS</p>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ErrorBoundary section="UserDetail" onReset={() => setSelectedId(null)}>
                            <UserDetail key={selectedId} userId={selectedId} />
                        </ErrorBoundary>
                    </div>
                </div> */}

            </div>

            {/* Log panel */}
            <LogPanel logs={logs} />

            {/* Footer */}
            <Footer />

        </div>
    );
}