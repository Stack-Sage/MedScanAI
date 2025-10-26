'use client'
import React from "react"
import AuthForm from "../components/AuthForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-linear-to-br from-cream-100 via-blue-50 to-blue-100">
      <AuthForm mode="login" />
      <div className="mt-6 text-center text-zinc-600 text-sm">
        <div className="mb-2">Demo login: <b>user@example.com</b> / <b>password</b></div>
        <div>
          <span className="text-zinc-400">Don't have an account?</span>{" "}
          <a href="/register" className="text-blue-600 underline">Register here</a>
        </div>
      </div>
    </div>
  )
}
