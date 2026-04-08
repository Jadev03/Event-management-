import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Activity,
  Bell,
  Filter,
  LogOut,
  Lock,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Users,
  X,
  BarChart3,
} from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChangePasswordModal } from '../../components/ChangePasswordModal.jsx'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const formatRole = (role) => {
  switch (role) {
    case 'student':
      return 'Student'
    case 'facultyCoordinator':
      return 'Faculty Coordinator'
    case 'organizer':
      return 'Organizer'
    case 'admin':
      return 'Admin'
    default:
      return role
  }
}

const formatShortTime = (timestamp) => {
  if (!timestamp) return '—'
  const d = new Date(timestamp)
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminDashboard({
  user,
  onLogout,
  onToggleDeactivate,
  users = [],
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [usersTab, setUsersTab] = useState('list')
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('student')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingEmail, setEditingEmail] = useState('')
  const [editingRole, setEditingRole] = useState('student')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [deleteCandidate, setDeleteCandidate] = useState(null) // { id, email, username }
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  const [monthlyAnalytics, setMonthlyAnalytics] = useState([])
  const [monthlyStatus, setMonthlyStatus] = useState('idle') // idle | loading
  const [monthlyError, setMonthlyError] = useState('')

  const [loginAnalytics, setLoginAnalytics] = useState([])
  const [loginStatus, setLoginStatus] = useState('idle') // idle | loading
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (activeTab !== 'analytics') return

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      setMonthlyAnalytics([])
      setMonthlyError('You are not logged in.')
      setLoginAnalytics([])
      setLoginError('You are not logged in.')
      return
    }

    setMonthlyStatus('loading')
    setMonthlyError('')
    axios
      .get(`${API_BASE_URL}/api/admin/analytics/events-by-month?months=6`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setMonthlyAnalytics(res.data?.series ?? [])
      })
      .catch((e) => {
        setMonthlyAnalytics([])
        setMonthlyError(
          e?.response?.data?.message ||
            'Unable to load analytics from server.',
        )
      })
      .finally(() => setMonthlyStatus('idle'))

    setLoginStatus('loading')
    setLoginError('')
    axios
      .get(`${API_BASE_URL}/api/admin/analytics/login-traffic-by-month?months=6`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        setLoginAnalytics(res.data?.series ?? [])
      })
      .catch((e) => {
        setLoginAnalytics([])
        setLoginError(
          e?.response?.data?.message || 'Unable to load analytics from server.',
        )
      })
      .finally(() => setLoginStatus('idle'))
  }, [activeTab])

  const generatePassword = () => {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*?'
    let pwd = ''
    for (let i = 0; i < 10; i += 1) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pwd
  }

  const handleSubmitNewUser = async (e) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      alert('Please enter a full name and email.')
      return
    }
    const password = generatePassword()
    if (!onCreateUser) return
    setIsCreatingUser(true)
    let created = null
    try {
      created = await onCreateUser({
        email: newEmail,
        username: newName,
        password,
        role: newRole,
      })
    } catch (err) {
      // If something unexpected happens, don't crash the page.
      alert(err?.message || 'Unable to create user.')
      return
    } finally {
      setIsCreatingUser(false)
    }
    if (!created) return

    setNewName('')
    setNewEmail('')

    // Intentionally do not open mailto/email drafts.
  }

  const totalUsers = users.length

  const recentUsers = useMemo(
    () => [...users].slice(-5).reverse(),
    [users],
  )

  const usersNeedingAttention = useMemo(() => {
    const base = [...(users || [])]
    return base
      .filter((u) => Boolean(u.isDeactivated) || Number(u.failedLoginAttempts ?? 0) >= 3)
      .sort((a, b) => {
        const aDeact = Boolean(a.isDeactivated)
        const bDeact = Boolean(b.isDeactivated)
        if (aDeact !== bDeact) return aDeact ? -1 : 1
        return Number(b.failedLoginAttempts ?? 0) - Number(a.failedLoginAttempts ?? 0)
      })
      .slice(0, 8)
  }, [users])

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="h-screen bg-[#F5F5F5] overflow-hidden flex">
      <ChangePasswordModal
        open={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Delete confirmation modal */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete user"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeletingUser) {
              setDeleteCandidate(null)
            }
          }}
        >
          <div className="w-full max-w-md rounded-[24px] bg-white border border-black/5 shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-900">
              Are you sure?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              This will permanently delete{' '}
              <span className="font-semibold text-slate-900">
                {deleteCandidate.username}
              </span>{' '}
              (<span className="font-mono text-xs">{deleteCandidate.email}</span>)
              from the system.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
              >
                No
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={async () => {
                  if (!onDeleteUser) return
                  setIsDeletingUser(true)
                  const ok = await onDeleteUser(deleteCandidate.id)
                  setIsDeletingUser(false)
                  if (ok) setDeleteCandidate(null)
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-100 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                {isDeletingUser ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar / Drawer */}
      <aside className="bg-white border-r border-black/5 flex flex-col z-20 transition-all duration-200" style={{ width: isSidebarOpen ? 260 : 80 }}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-indigo-600">
              UniEvent
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  'shrink-0',
                  activeTab === item.id
                    ? 'text-indigo-600'
                    : 'text-slate-400 group-hover:text-slate-600',
                )}
              />
              {isSidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all duration-200 mb-2"
          >
            <Lock size={20} />
            {isSidebarOpen && (
              <span className="font-medium text-sm">Change password</span>
            )}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 md:px-8 z-10">
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl w-[22rem] max-w-full border border-black/5">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search users, events, or logs..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-5">
          <button
            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white" />
          </button>

          <div className="flex items-center gap-3 pl-5 border-l border-black/5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user.username}
              </p>
              <p className="text-xs text-slate-500 capitalize">admin</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
              {user.username?.charAt(0) ?? 'A'}
            </div>
          </div>
        </div>
      </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Page header actions */}
          <div className="flex items-center justify-between gap-4">
            <div>
              {activeTab === 'users' ? (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Users &amp; Roles
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Manage university users, roles, and access controls.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Global system overview, role management, and security analytics.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Overview tab: stats + recent users */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Total Users',
                    value: String(totalUsers),
                    change: 'Live',
                    icon: Users,
                    color: 'bg-indigo-50 text-indigo-600',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center',
                          stat.color,
                        )}
                      >
                        <stat.icon size={24} />
                      </div>
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
                          stat.change.startsWith('+')
                            ? 'bg-emerald-50 text-emerald-600'
                            : stat.change === 'Attention'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-slate-50 text-slate-500',
                        )}
                      >
                        <span>{stat.change}</span>
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </h3>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Recently added users
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Last 5 users created across Students, Faculty Coordinators, Organizers, and Admins.
                  </p>
                  {recentUsers.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No users added yet. Use the &quot;Add user&quot; action in the Users &amp; Roles tab.
                    </p>
                  )}
                  <ul className="space-y-3">
                    {recentUsers.map((u) => (
                      <li
                        key={u.email}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-black/5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {u.username?.charAt(0) ?? u.email.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {u.username}
                            </p>
                            <p className="text-xs text-slate-500">
                              {u.email}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-100">
                          {formatRole(u.role)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Account management
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Failed login attempts and account status (manage in Users &amp; Roles tab).
                  </p>

                  {usersNeedingAttention.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No users found yet.
                    </p>
                  )}

                  {usersNeedingAttention.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border border-black/5">
                          <tr>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              User
                            </th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              Role
                            </th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              Failed attempts
                            </th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              Status
                            </th>
                            <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 border border-black/5 border-t-0">
                          {usersNeedingAttention.map((u) => {
                            const attempts = Number(u.failedLoginAttempts ?? 0)
                            const isDeactivated = Boolean(u.isDeactivated)
                            const statusLabel = isDeactivated ? 'Deactivated' : 'Active'
                            const statusClass = isDeactivated
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'

                            const attemptClass =
                              attempts >= 10
                                ? 'text-red-700'
                                : attempts >= 3
                                  ? 'text-orange-700'
                                  : 'text-slate-700'

                            const attentionBadge = isDeactivated
                              ? { label: 'Deactivated', className: 'bg-red-50 text-red-700 border-red-100' }
                              : attempts >= 3
                                ? { label: 'Alert', className: 'bg-orange-50 text-orange-700 border-orange-100' }
                                : null

                            return (
                              <tr key={u.email} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                      {u.username}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                      {u.email}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs font-bold text-slate-600">
                                    {formatRole(u.role)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={cn('text-xs font-bold', attemptClass)}>
                                    {attempts}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={cn(
                                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                                      statusClass,
                                    )}
                                  >
                                    {statusLabel}
                                  </span>
                                  {attentionBadge && (
                                    <span
                                      className={cn(
                                        'ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                                        attentionBadge.className,
                                      )}
                                    >
                                      {attentionBadge.label}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {isDeactivated ? (
                                    <button
                                      type="button"
                                      onClick={() => onToggleDeactivate?.(u.email)}
                                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    >
                                      Activate
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Analytics tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Monthly event status analytics
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Event counts by month, split by status.
                    </p>
                  </div>
                </div>

                {monthlyError && (
                  <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {monthlyError}
                  </div>
                )}

                {monthlyStatus === 'loading' && monthlyAnalytics.length === 0 && (
                  <p className="text-sm text-slate-600">Loading analytics…</p>
                )}

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyAnalytics}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#F1F5F9"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '16px',
                          border: 'none',
                          boxShadow:
                            '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        dataKey="pendingApprovals"
                        name="Pending"
                        type="monotone"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        dataKey="accepted"
                        name="Accepted"
                        type="monotone"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        dataKey="rejected"
                        name="Rejected"
                        type="monotone"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        dataKey="completed"
                        name="Completed"
                        type="monotone"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Monthly login traffic analytics
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Total login attempts, failed attempts, and distinct users by month.
                    </p>
                  </div>
                </div>

                {loginError && (
                  <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {loginError}
                  </div>
                )}

                {loginStatus === 'loading' && loginAnalytics.length === 0 && (
                  <p className="text-sm text-slate-600">Loading analytics…</p>
                )}

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loginAnalytics}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#F1F5F9"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748B' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '16px',
                          border: 'none',
                          boxShadow:
                            '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Legend />
                      <Line
                        dataKey="totalAttempts"
                        name="Total login attempts"
                        type="monotone"
                        stroke="#4F46E5"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        dataKey="failedAttempts"
                        name="Failed attempts"
                        type="monotone"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        dataKey="trafficUsers"
                        name="User traffic"
                        type="monotone"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Security tab removed */}

          {/* Users tab: System Administration -> internal tabs for list / add */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-black/5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">
                    Choose view
                  </span>
                  <span className="text-xs text-slate-500">
                    Switch between managing users and adding new accounts.
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 rounded-2xl bg-indigo-50/60 p-1 border border-indigo-100 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setUsersTab('list')}
                    className={cn(
                      'px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                      usersTab === 'list'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'bg-transparent text-slate-600 hover:text-slate-900',
                    )}
                  >
                    User &amp; role management
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsersTab('add')}
                    className={cn(
                      'px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                      usersTab === 'add'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-transparent text-slate-600 hover:text-slate-900',
                    )}
                  >
                    Add user
                  </button>
                </div>
              </div>

              {/* Sub-tab: list */}
              {usersTab === 'list' && (
                <div className="p-6 border-t border-black/5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        User &amp; role management
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-10 pr-4 py-2 bg-slate-50 border border-black/5 rounded-xl text-sm outline-none w-64"
                        />
                      </div>
                      <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <Filter size={20} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-black/5">
                        <tr>
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            User
                          </th>
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Role
                          </th>
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Status
                          </th>
                          {/* login-attempt columns removed */}
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {users.map((entry) => {
                          const isDeactivated = entry.isDeactivated
                          const statusLabel = isDeactivated ? 'Deactivated' : 'Active'
                          const statusClass = isDeactivated
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          const isEditing = editingUserId === entry.id

                          return (
                            <tr
                              key={entry.email}
                              className="hover:bg-slate-50 transition-colors group"
                            >
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {entry.username.charAt(0)}
                                  </div>
                                  <div>
                                    {isEditing ? (
                                      <div className="flex flex-col gap-2">
                                        <input
                                          type="text"
                                          value={editingName}
                                          onChange={(e) => setEditingName(e.target.value)}
                                          className="w-64 max-w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                                          placeholder="Full name"
                                        />
                                        <input
                                          type="email"
                                          value={editingEmail}
                                          onChange={(e) =>
                                            setEditingEmail(e.target.value)
                                          }
                                          className="w-64 max-w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                                          placeholder="Email"
                                        />
                                      </div>
                                    ) : (
                                      <>
                                        <p className="font-bold text-slate-900">
                                          {entry.username}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {entry.email}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                {isEditing ? (
                                  <select
                                    value={editingRole}
                                    onChange={(e) => setEditingRole(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl border border-black/5 bg-slate-50 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/40"
                                  >
                                    <option value="student">Student</option>
                                    <option value="facultyCoordinator">
                                      Faculty Coordinator
                                    </option>
                                    <option value="organizer">Organizer</option>
                                  </select>
                                ) : (
                                  <span className="text-xs font-bold text-slate-600">
                                    {formatRole(entry.role)}
                                  </span>
                                )}
                              </td>
                              <td className="px-8 py-4">
                                <span
                                  className={cn(
                                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                                    statusClass,
                                  )}
                                >
                                  {statusLabel}
                                </span>
                              </td>
                              {/* login-attempt cells removed */}
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-2">
                                  {isEditing ? (
                                    <>
                                      <button
                                        type="button"
                                        disabled={isSavingEdit}
                                        onClick={async () => {
                                          if (!onUpdateUser) return
                                          const nextName = editingName.trim()
                                          const nextEmail = editingEmail.trim()
                                          if (!nextName || !nextEmail) {
                                            alert('Name and email are required.')
                                            return
                                          }

                                          setIsSavingEdit(true)
                                          const updated = await onUpdateUser(entry.id, {
                                            name: nextName,
                                            email: nextEmail,
                                            role: editingRole,
                                          })
                                          setIsSavingEdit(false)

                                          if (!updated) return
                                          setEditingUserId(null)
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                      >
                                        {isSavingEdit ? 'Saving…' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingUserId(null)
                                          setEditingName('')
                                          setEditingEmail('')
                                          setEditingRole('student')
                                        }}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          onToggleDeactivate &&
                                          onToggleDeactivate(entry.email)
                                        }
                                        className={cn(
                                          'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors',
                                          isDeactivated
                                            ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                            : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
                                        )}
                                      >
                                        {isDeactivated ? 'Activate' : 'Deactivate'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDeleteCandidate({
                                            id: entry.id,
                                            email: entry.email,
                                            username: entry.username,
                                          })
                                        }}
                                        className="p-2 rounded-xl border border-red-100 bg-white text-red-700 hover:bg-red-50 transition-colors"
                                        aria-label={`Delete ${entry.username}`}
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingUserId(entry.id)
                                          setEditingName(entry.username || '')
                                          setEditingEmail(entry.email || '')
                                          setEditingRole(entry.role || 'student')
                                        }}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                      >
                                        <Pencil
                                          size={18}
                                          className="text-slate-400"
                                        />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab: add */}
              {usersTab === 'add' && (
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Add new user
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Create Students, Faculty Coordinators, or Organizers. A random temporary password will be generated and opened in an email draft to the user.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitNewUser} className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                        placeholder="e.g. Nimal Perera"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        University email
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                        placeholder="name@university.ac.lk"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">
                        Role
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <option value="student">Student</option>
                        <option value="facultyCoordinator">
                          Faculty Coordinator
                        </option>
                        <option value="organizer">Organizer</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                      disabled={isCreatingUser}
                    >
                      {isCreatingUser ? 'Creating…' : 'Create user & open email'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

