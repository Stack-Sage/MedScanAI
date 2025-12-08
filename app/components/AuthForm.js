import React, { useState } from "react"

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [btnActive, setBtnActive] = useState(false)
  const isRegister = mode === "register"

  function handleSubmit(e) {
    e.preventDefault()
    alert(`${isRegister ? "Register" : "Login"} with: ${email} / ${password}${isRegister ? " / " + name : ""}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-gradient-to-br from-cream-100 via-blue-50 to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-2xl shadow-2xl p-10 border border-blue-100 dark:border-zinc-800 w-full max-w-md flex flex-col gap-5 animate-fade-in"
      style={{ boxShadow: "0 8px 32px 0 rgba(80, 120, 255, 0.10)" }}
    >
      <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2 tracking-tight text-center drop-shadow">{isRegister ? "Register" : "Login"}</h2>
      {isRegister && (
        <input
          type="text"
          placeholder="Name"
          className="rounded-lg border border-blue-100 dark:border-zinc-700 p-3 bg-blue-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        className="rounded-lg border border-blue-100 dark:border-zinc-700 p-3 bg-blue-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="rounded-lg border border-blue-100 dark:border-zinc-700 p-3 bg-blue-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition"
          onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M17 17l4 4m0 0l-4-4m4 4V13"></path></svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
          )}
        </button>
      </div>
      <button
        type="submit"
        className={`rounded-lg bg-blue-600 text-white font-semibold py-3 mt-2 shadow-md hover:bg-blue-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300`}
        onMouseDown={() => setBtnActive(true)}
        onMouseUp={() => setBtnActive(false)}
      >
        {isRegister ? "Register" : "Login"}
      </button>
      <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
        {isRegister
          ? "Already have an account? "
          : "Don't have an account? "}
        <span className="underline text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
          tabIndex={0}
          onClick={() => window.location.href = isRegister ? "/login" : "/register"}
        >
          {isRegister ? "Login" : "Register"}
        </span>
      </div>
    </form>
  )
}
