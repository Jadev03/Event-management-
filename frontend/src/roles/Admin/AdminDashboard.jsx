import React, { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Filter,
  LogOut,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Users,
  X,
  BarChart3,
} from 'lucide-react'
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const ATTEMPT_WINDOW_MINUTES = 10

const predictiveData = [
  { name: 'Jan', attendance: 400, prediction: 450, noShow: 50 },
  { name: 'Feb', attendance: 300, prediction: 380, noShow: 80 },
  { name: 'Mar', attendance: 600, prediction: 580, noShow: 20 },
  { name: 'Apr', attendance: 800, prediction: 850, noShow: 40 },
  { name: 'May', attendance: 500, prediction: 600, noShow: 100 },
  { name: 'Jun', attendance: 900, prediction: 920, noShow: 30 },
]

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
  loginAttempts = [],
  lockedEmails = {},
  deactivatedEmails = {},
  onToggleLock,
  onToggleDeactivate,
  users = [],
  onCreateUser,
}) {
  const now = Date.now()
  const windowMs = ATTEMPT_WINDOW_MINUTES * 60 * 1000

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [usersTab, setUsersTab] = useState('list')

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('student')
  const [lastCreatedUser, setLastCreatedUser] = useState(null)

  const generatePassword = () => {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*?'
    let pwd = ''
    for (let i = 0; i < 10; i += 1) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pwd
  }

  const handleSubmitNewUser = (e) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) {
      alert('Please enter a full name and email.')
      return
    }
    const password = generatePassword()
    if (!onCreateUser) return
    const created = onCreateUser({
      email: newEmail,
      username: newName,
      password,
      role: newRole,
    })
    if (!created) return

    setLastCreatedUser({ ...created, generatedPassword: password })
    setNewName('')
    setNewEmail('')

    const subject = encodeURIComponent('Your UniEvent account credentials')
    const body = encodeURIComponent(
      `Hi ${created.username},\n\n` +
        `An account has been created for you on the UniEvent system.\n\n` +
        `Email: ${created.email}\n` +
        `Temporary password: ${password}\n\n` +
        `Please sign in and change your password as soon as possible.\n\n` +
        `Best regards,\n` +
        `Event Management Team`,
    )
    window.open(`mailto:${created.email}?subject=${subject}&body=${body}`)
  }

  const totalUsers = users.length
  const activeUsers = users.filter(
    (u) => !deactivatedEmails[u.email.toLowerCase()],
  ).length
  const lockedCount = Object.keys(lockedEmails).length
  const failedAttemptsToday = loginAttempts.filter((a) => {
    if (a.success) return false
    const d = new Date(a.timestamp)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length

  const enrichedUsers = useMemo(() => {
    return users
      .map((u) => {
        const key = u.email.toLowerCase()
        const attemptsForUser = loginAttempts.filter((a) => a.email === key)
        const failedRecent = attemptsForUser.filter(
          (a) => !a.success && now - a.timestamp <= windowMs,
        )
        const totalFailed = attemptsForUser.filter((a) => !a.success).length
        const lastAttempt =
          attemptsForUser.length > 0
            ? attemptsForUser[attemptsForUser.length - 1].timestamp
            : null

        const isLocked = Boolean(lockedEmails[key])
        const isDeactivated = Boolean(deactivatedEmails[key])

        const riskScore =
          failedRecent.length * 2 +
          (isLocked ? 3 : 0) +
          (isDeactivated ? 5 : 0)

        return {
          ...u,
          key,
          failedRecent: failedRecent.length,
          totalFailed,
          lastAttempt,
          isLocked,
          isDeactivated,
          riskScore,
        }
      })
      .sort((a, b) => b.riskScore - a.riskScore)
  }, [users, loginAttempts, lockedEmails, deactivatedEmails, now, windowMs])

  const recentSecurityLogs = useMemo(
    () =>
      [...loginAttempts]
        .slice(-10)
        .reverse()
        .map((a) => {
          const matchingUser = users.find(
            (u) => u.email.toLowerCase() === a.email,
          )
          const displayName = matchingUser?.username ?? a.email
          return {
            user: displayName,
            action: a.success ? 'Successful login' : 'Failed login',
            target: matchingUser ? formatRole(matchingUser.role) : 'Unknown user',
            time: formatShortTime(a.timestamp),
            type: a.success ? 'info' : 'danger',
          }
        }),
    [loginAttempts, users],
  )

  const recentUsers = useMemo(
    () => [...users].slice(-5).reverse(),
    [users],
  )

  const topFailedUsers = useMemo(
    () =>
      [...enrichedUsers]
        .sort((a, b) => b.totalFailed - a.totalFailed)
        .slice(0, 5),
    [enrichedUsers],
  )

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security Logs', icon: ShieldCheck },
  ]

  return (
    <div className="h-screen bg-[#F5F5F5] overflow-hidden flex">
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
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Global system overview, role management, and security analytics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-black/5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Download audit logs
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Security settings
              </button>
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
                    change: '+3%',
                    icon: Users,
                    color: 'bg-indigo-50 text-indigo-600',
                  },
                  {
                    label: 'Active Accounts',
                    value: String(activeUsers),
                    change: 'Stable',
                    icon: Activity,
                    color: 'bg-emerald-50 text-emerald-600',
                  },
                  {
                    label: 'Failed Logins Today',
                    value: String(failedAttemptsToday),
                    change:
                      failedAttemptsToday > 0 ? '+security review' : 'Clean',
                    icon: AlertTriangle,
                    color: 'bg-orange-50 text-orange-600',
                  },
                  {
                    label: 'Locked Accounts',
                    value: String(lockedCount),
                    change: lockedCount > 0 ? 'Attention' : 'All clear',
                    icon: ShieldCheck,
                    color: 'bg-purple-50 text-purple-600',
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
                        {stat.change === '+3%' && <ArrowUpRight size={14} />}
                        {stat.change === 'Attention' && (
                          <ArrowDownRight size={14} />
                        )}
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
                    Most failed login attempts
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Top 5 users with the highest failed login count. Sorted by total failed attempts.
                  </p>
                  {topFailedUsers.length === 0 && (
                    <p className="text-sm text-slate-500">
                      No failed login attempts recorded yet.
                    </p>
                  )}
                  <ul className="space-y-3">
                    {topFailedUsers.map((u) => {
                      const isDeactivated = u.isDeactivated
                      const statusLabel = isDeactivated ? 'Deactivated' : 'Active'
                      const statusClass = isDeactivated
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'

                      return (
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
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest border',
                                statusClass,
                              )}
                            >
                              {statusLabel}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Failed attempts:{' '}
                              <span className="font-semibold text-slate-800">
                                {u.totalFailed}
                              </span>
                            </span>
                            <div className="flex gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onToggleDeactivate &&
                                  onToggleDeactivate(u.email)
                                }
                                className={cn(
                                  'px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors',
                                  isDeactivated
                                    ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
                                )}
                              >
                                {isDeactivated ? 'Activate' : 'Deactivate'}
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  {topFailedUsers.length > 0 && (
                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className="px-8 py-2.5 rounded-full border border-indigo-200 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                      >
                        See more
                      </button>
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
                      Predictive attendance insights
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Forecast event turnout to help faculty, organizers, and
                      students plan better.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-600" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Actual
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Predicted
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={predictiveData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#F1F5F9"
                      />
                      <XAxis
                        dataKey="name"
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
                      <Area
                        type="monotone"
                        dataKey="prediction"
                        fill="#10B981"
                        fillOpacity={0.1}
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Bar
                        dataKey="attendance"
                        fill="#4F46E5"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                      <Line
                        type="monotone"
                        dataKey="noShow"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Recent security activity
              </h2>
              <div className="space-y-6">
                {recentSecurityLogs.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No recent login activity yet. Failed and suspicious attempts
                    will appear here.
                  </p>
                )}
                {recentSecurityLogs.map((log, index) => (
                  <div
                    key={`${log.user}-${log.time}-${index}`}
                    className="flex gap-4"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl shrink-0 flex items-center justify-center',
                        log.type === 'danger'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-indigo-50 text-indigo-600',
                      )}
                    >
                      {log.type === 'danger' ? (
                        <AlertTriangle size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {log.action}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {log.user}
                        </span>{' '}
                        ({log.target})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-2xl border border-black/5 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                View full security logs
              </button>
            </div>
          )}

          {/* Users tab: System Administration -> internal tabs for list / add */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-black/5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Admin Dashboard
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage university users, roles, and access controls.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-2xl bg-slate-50 p-1 border border-black/5">
                  <button
                    type="button"
                    onClick={() => setUsersTab('list')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                      usersTab === 'list'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800',
                    )}
                  >
                    User &amp; role management
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsersTab('add')}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
                      usersTab === 'add'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800',
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
                      <span>•</span>
                      <span>
                        Review Students, Faculty Coordinators, Organizers, and Admins.
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
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Failed in last {ATTEMPT_WINDOW_MINUTES}m
                          </th>
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Last attempt
                          </th>
                          <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {enrichedUsers.map((entry) => {
                          const isDeactivated = entry.isDeactivated
                          const statusLabel = isDeactivated ? 'Deactivated' : 'Active'
                          const statusClass = isDeactivated
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'

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
                                    <p className="font-bold text-slate-900">
                                      {entry.username}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {entry.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <span className="text-xs font-bold text-slate-600">
                                  {formatRole(entry.role)}
                                </span>
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
                              <td className="px-8 py-4 text-sm text-slate-600">
                                {entry.failedRecent}
                              </td>
                              <td className="px-8 py-4 text-sm text-slate-600">
                                {formatShortTime(entry.lastAttempt)}
                              </td>
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-2">
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
                                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <MoreHorizontal
                                      size={18}
                                      className="text-slate-400"
                                    />
                                  </button>
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
                    >
                      Create user &amp; open email
                    </button>
                  </form>

                  {lastCreatedUser && (
                    <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 space-y-2 max-w-md">
                      <p className="text-xs font-semibold text-indigo-800">
                        Last created user
                      </p>
                      <p className="text-sm text-slate-800">
                        {lastCreatedUser.username} ({lastCreatedUser.email}) – role:{' '}
                        <span className="font-semibold">
                          {formatRole(lastCreatedUser.role)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600">
                        Temporary password:{' '}
                        <code className="px-1.5 py-0.5 rounded-md bg-white border border-indigo-100 text-[11px]">
                          {lastCreatedUser.generatedPassword}
                        </code>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

