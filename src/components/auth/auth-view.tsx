"use client";

import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useGameStore } from "@/lib/store/useGameStore";
import GlassPanel from "@/components/ui/glass-panel";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function AuthView() {
  const { login, register } = useAuth()
  const setView = useGameStore((state) => state.setView);
  const authMode = useGameStore((state) => state.authMode);
  const setAuthMode = useGameStore((state) => state.setAuthMode);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMode === "register") {
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        await register({ username: username.trim(), email: email.trim(), password });
        setView("lobby");
      } catch (err: any) {
        setError(err.message || "Failed to join the pack. Try again.");
      }
    } else {
      try {
        const success = await login({ email: email.trim(), password });
        if (success === true) {
          setView("lobby");
        } else if (success instanceof Error) {
          setError(success.message);
        } else {
          setError("Gagal login. Periksa kembali email dan password.");
        }
      } catch (err: any) {
        setError(err.message || "User tidak ditemukan atau password salah!");
      }
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in relative z-20">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => setView("landing")}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-purple-400 transition-colors mb-6 text-sm group cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Return to Woods
      </button>

      <GlassPanel className="p-8">
        {/* Tab Headers */}
        <div className="flex border-b border-purple-500/20 mb-8 pb-3">
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setError("");
            }}
            className={`flex-1 text-center py-2 font-cinzel font-semibold tracking-wider transition-all cursor-pointer ${authMode === "login"
              ? "text-white text-shadow-glow border-b-2 border-purple-500"
              : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("register");
              setError("");
            }}
            className={`flex-1 text-center py-2 font-cinzel font-semibold tracking-wider transition-all cursor-pointer ${authMode === "register"
              ? "text-white text-shadow-glow border-b-2 border-purple-500"
              : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-werewolf-red/10 border border-werewolf-red/30 text-werewolf-red text-xs px-4 py-3 rounded-lg text-center font-medium animate-pulse">
              ⚠️ {error}
            </div>
          )}

          {/* Username Input */}
          {authMode === "register" && (
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block"
              >
                Pack Name (Username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="
                  w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600
                  focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                  transition-all duration-200
                "
                />
              </div>
            </div>
          )}

          {/* Email Input (Register Only) */}
          <div className="space-y-2 animate-slide-down">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="
                    w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600
                    focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                    transition-all duration-200
                  "
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block"
            >
              Secret Phrase (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="
                  w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-zinc-600
                  focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                  transition-all duration-200
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input (Register Only) */}
          {authMode === "register" && (
            <div className="space-y-2 animate-slide-down">
              <label
                htmlFor="confirmPassword"
                className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block"
              >
                Confirm Secret Phrase
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="
                    w-full bg-spooky-black/80 border border-purple-500/20 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600
                    focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
                    transition-all duration-200
                  "
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="
              relative w-full py-3.5 rounded-xl font-cinzel font-bold tracking-widest text-white text-sm
              bg-gradient-to-r from-purple-800 to-purple-950 border border-purple-500/50
              hover:from-purple-700 hover:to-purple-900 hover:border-purple-400
              shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]
              transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer
            "
          >
            {authMode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                ENTER LOBBY
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                JOIN THE PACK
              </>
            )}
          </button>
        </form>
      </GlassPanel>
    </div>
  );
}
