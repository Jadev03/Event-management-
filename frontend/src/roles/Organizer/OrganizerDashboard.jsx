import { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MoreVertical,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444']

const pieData = [
  { name: 'Approved', value: 12 },
  { name: 'Pending', value: 5 },
  { name: 'Completed', value: 24 },
  { name: 'Rejected', value: 2 },
]

const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'AI Workshop 2026',
    date: 'May 20, 2026',
    registeredCount: 120,
    capacity: 180,
    status: 'approved',
  },
  {
    id: 'e2',
    title: 'Annual Sports Meet',
    date: 'Jun 02, 2026',
    registeredCount: 340,
    capacity: 500,
    status: 'approved',
  },
  {
    id: 'e3',
    title: 'Research Symposium',
    date: 'Jun 15, 2026',
    registeredCount: 60,
    capacity: 120,
    status: 'pending',
  },
  {
    id: 'e4',
    title: 'Web Dev Bootcamp: React + Vite',
    date: 'May 28, 2026',
    registeredCount: 95,
    capacity: 150,
    status: 'approved',
  },
  {
    id: 'e5',
    title: 'Career Fair 2026',
    date: 'Jun 05, 2026',
    registeredCount: 420,
    capacity: 900,
    status: 'completed',
  },
]

export function OrganizerDashboard({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="h-screen bg-[#F5F5F5] overflow-hidden flex">
      {/* Sidebar / drawer */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-black/5 flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-indigo-600"
            >
              Organizer
            </motion.span>
          )}
          <button
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <span className="text-lg leading-none">×</span>
            ) : (
              <span className="text-lg leading-none">≡</span>
            )}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'events', label: 'My Events', icon: Calendar },
          ].map((item) => (
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
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <MoreVertical size={18} />
            {isSidebarOpen && (
              <span className="text-sm font-medium">Sign out</span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl w-[22rem] max-w-full border border-black/5">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search events or registrations..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="hidden sm:inline-flex bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
              <Plus size={18} /> Create event
            </button>
            <div className="flex items-center gap-3 pl-5 border-l border-black/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user.username}
                </p>
                <p className="text-xs text-slate-500 capitalize">organizer</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                {user.username?.charAt(0) ?? 'O'}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Page header text based on tab */}
          <div className="flex items-center justify-between gap-4">
            <div>
              {activeTab === 'overview' && (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Organizer Hub
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Manage your events and track attendance in real-time.
                  </p>
                </>
              )}
              {activeTab === 'events' && (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    My Events
                  </h1>
                  <p className="text-slate-500 mt-1">
                    See all events you manage, with registrations and status.
                  </p>
                </>
              )}
            </div>
            <button className="sm:hidden bg-indigo-600 text-white px-4 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
              <Plus size={18} /> Create event
            </button>
          </div>

          {/* Overview tab: stats + quick charts */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Active Events',
                    value: '8',
                    icon: Calendar,
                    color: 'bg-indigo-50 text-indigo-600',
                  },
                  {
                    label: 'Total Registrations',
                    value: '1,240',
                    icon: Users,
                    color: 'bg-emerald-50 text-emerald-600',
                  },
                  {
                    label: 'Avg. Attendance',
                    value: '84%',
                    icon: CheckCircle2,
                    color: 'bg-orange-50 text-orange-600',
                  },
                  {
                    label: 'Pending Approvals',
                    value: '3',
                    icon: Clock,
                    color: 'bg-purple-50 text-purple-600',
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm"
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
                        stat.color,
                      )}
                    >
                      <stat.icon size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </h3>
                  </motion.div>
                ))}
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Registration Trends (compact for overview) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-8">
                    Registration Trends (Top events)
                  </h2>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_EVENTS.slice(0, 4)}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#F1F5F9"
                        />
                        <XAxis
                          dataKey="title"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#64748B' }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748B' }}
                        />
                        <Tooltip
                          cursor={{ fill: '#F8FAFC' }}
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow:
                              '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Bar
                          dataKey="registeredCount"
                          fill="#4F46E5"
                          radius={[6, 6, 0, 0]}
                          barSize={36}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Event Status Distribution */}
                <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-8">
                    Event Status
                  </h2>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i] }}
                        />
                        <span className="text-xs font-medium text-slate-600">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Events tab: full managed events table */}
          {activeTab === 'events' && (
            <section className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-black/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    My Managed Events
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Quick view of your events, registrations and statuses.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Filter events..."
                      className="pl-10 pr-4 py-2 bg-slate-50 border border-black/5 rounded-xl text-sm outline-none w-60 md:w-72"
                    />
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <MoreVertical size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-black/5">
                    <tr>
                      <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Event Name
                      </th>
                      <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Date
                      </th>
                      <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Registrations
                      </th>
                      <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-6 md:px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {MOCK_EVENTS.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Calendar size={20} />
                            </div>
                            <span className="font-bold text-slate-900">
                              {event.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4 text-sm text-slate-600">
                          {event.date}
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{
                                  width: `${(event.registeredCount / event.capacity) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600">
                              {event.registeredCount}/{event.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                              event.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : event.status === 'pending'
                                  ? 'bg-orange-50 text-orange-600 border-orange-100'
                                  : 'bg-red-50 text-red-600 border-red-100',
                            )}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          <button className="text-indigo-600 font-bold text-sm hover:underline">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* No separate analytics tab – analytics are included in overview */}
        </main>
      </div>
    </div>
  )
}
