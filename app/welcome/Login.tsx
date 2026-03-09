import { useState, type SetStateAction } from "react";
import { useNavigate } from "react-router";

const FAKE_ADMINS = [
  { email: "ada@admin.com", password: "password123", name: "Ada Lovelace", avatar: "AL" },
  { email: "grace@admin.com", password: "password123", name: "Grace Hopper", avatar: "GH" },
];

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const admin = FAKE_ADMINS.find(
        (a) => a.email === email && a.password === password
      );

      if (!admin) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("admin", JSON.stringify(admin));
      navigate("/dashboard");
    }, 1000);
  };

  const fillDemo = (adminEmail: SetStateAction<string>) => {
    setEmail(adminEmail);
    setPassword("password123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono px-4">

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-9 flex flex-col gap-7">

        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <span className="text-3xl text-blue-400">⬡</span>
          <h1 className="text-white text-xl font-bold tracking-widest mt-1">ADMIN</h1>
          <p className="text-zinc-600 text-xs tracking-widest">dashboard · logger demo</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-xs tracking-widest">EMAIL</label>
            <input
              type="email"
              placeholder="you@admin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-4 py-3 text-zinc-300 text-sm font-mono placeholder-zinc-700 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-600 text-xs tracking-widest">PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-zinc-950 border border-zinc-800 rounded-md px-4 py-3 text-zinc-300 text-sm font-mono placeholder-zinc-700 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-950 border border-red-900 rounded-md px-4 py-3 text-red-400 text-xs flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs tracking-widest rounded-md py-3.5 transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                signing in...
              </>
            ) : "SIGN IN"}
          </button>

        </div>

        {/* Demo accounts */}
        <div className="border-t border-zinc-800 pt-6 flex flex-col gap-3">
          <p className="text-zinc-700 text-xs tracking-widest">DEMO ACCOUNTS</p>

          <div className="flex flex-col gap-2">
            {FAKE_ADMINS.map((a) => (
              <button
                key={a.email}
                onClick={() => fillDemo(a.email)}
                className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-md px-3 py-2.5 flex items-center gap-3 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {a.avatar}
                </div>
                <div>
                  <p className="text-zinc-300 text-xs">{a.name}</p>
                  <p className="text-zinc-600 text-xs">{a.email}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-zinc-700 text-xs text-center">
            click an account to autofill, then sign in
          </p>
        </div>

      </div>
    </div>
  );
}