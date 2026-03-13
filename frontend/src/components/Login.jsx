import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, GraduationCap, Lock, Mail } from 'lucide-react'

export function Login({ onLogin, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-indigo-100 p-10 border border-black/5"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            University Events
          </h1>
          <p className="text-slate-500 mt-2 text-center">
            Welcome back, please login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              University email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@uni.edu"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-black/5 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:underline"
              onClick={() =>
                alert(
                  'Forgot password is not implemented in this demo. Please contact the university IT helpdesk.',
                )
              }
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            Sign In
            <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  )
}

