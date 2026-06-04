import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      setError("to do");
    }, 1500);

  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-base">

      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8"
        style={{
          background: "var(--color-card)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--color-border)",
          boxShadow:
            "0 8px 32px var(--color-shadow), inset 0 1px 0 var(--color-border)",
        }}
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2"
            style={{
              background: "linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
            </svg>

          </div>
          <h1 className="text-2xl font-bold text-white">
            Asset Platform
          </h1>
          <p className="text-sm text-white/40 mt-1">Sign in to workspace</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg text-sm text-red-400 flex items-center gap-1"
            style={{ background: "var(--color-error-outlined)", border: "1px solid var(--color-error)" }}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 ">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full pl-2 pr-4 py-2 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid var(--color-main-border-focus)";
                  e.target.style.background = "var(--color-hover)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid var(--color-main-border)";
                  e.target.style.background = "var(--color-card)";
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="xxxxxxx"
                className="w-full pl-2 pr-10 py-2 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-main-border)",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid var(--color-main-border-focus)";
                  e.target.style.background = "var(--color-hover)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "1px solid var(--color-main-border)";
                  e.target.style.background = "var(--color-card)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? (

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>

                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>

                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all 
            duration-200 mt-2 relative overflow-hidden"
            style={{
              background: loading
                ? "var(--color-main-border-focus)"
                : "linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))",
            }}
          >
            {loading ? "Signing in..."
              : "Sign in"
            }
          </button>
        </form>
      </div>
    </div>
  );
}