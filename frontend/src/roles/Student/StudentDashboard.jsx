import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MapPin,
  Menu,
  QrCode,
  Search,
  X,
  Award,
  Users,
  ArrowRight,
  LogOut,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'AI Workshop 2026',
    description: 'Learn the basics of machine learning and modern AI tools.',
    dateLabel: 'May 20, 2026',
    time: '10:00 AM',
    location: 'Innovation Lab',
    category: 'workshop',
    registeredCount: 45,
    capacity: 100,
    image: 'https://picsum.photos/seed/ai-2026/800/400',
  },
  {
    id: 'e2',
    title: 'Annual Sports Meet',
    description: 'Cheer for your faculty and join friendly competitions.',
    dateLabel: 'Jun 02, 2026',
    time: '08:00 AM',
    location: 'Main Stadium',
    category: 'sports',
    registeredCount: 200,
    capacity: 500,
    image: 'https://picsum.photos/seed/sports-2026/800/400',
  },
  {
    id: 'e3',
    title: 'Research Symposium',
    description: 'Showcase of the latest projects from students and staff.',
    dateLabel: 'Jun 15, 2026',
    time: '01:00 PM',
    location: 'Conference Hall B',
    category: 'academic',
    registeredCount: 32,
    capacity: 80,
    image: 'https://picsum.photos/seed/research-2026/800/400',
  },
]

const WEEKLY_ACTIVITY_DATA = [
  { name: 'Mon', count: 4 },
  { name: 'Tue', count: 7 },
  { name: 'Wed', count: 5 },
  { name: 'Thu', count: 12 },
  { name: 'Fri', count: 8 },
  { name: 'Sat', count: 15 },
  { name: 'Sun', count: 10 },
]

export function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const stats = useMemo(
    () => [
      {
        label: 'Registered Events',
        value: '12',
        icon: Calendar,
        color: 'bg-indigo-50 text-indigo-600',
      },
      {
        label: 'Attended Events',
        value: '8',
        icon: CheckCircle2,
        color: 'bg-emerald-50 text-emerald-600',
      },
      {
        label: 'Upcoming This Week',
        value: '3',
        icon: Clock,
        color: 'bg-orange-50 text-orange-600',
      },
      {
        label: 'Reward Points',
        value: '450',
        icon: Award,
        color: 'bg-purple-50 text-purple-600',
      },
    ],
    [],
  )

  const notifications = useMemo(
    () => [
      {
        id: 'n1',
        title: 'Event reminder',
        message: 'AI Workshop 2026 starts in 2 hours.',
        dateLabel: 'Today • 08:00',
        read: false,
      },
      {
        id: 'n2',
        title: 'Registration confirmed',
        message: 'You are registered for Annual Sports Meet.',
        dateLabel: 'Yesterday • 17:20',
        read: true,
      },
    ],
    [],
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const sidebarItems = useMemo(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'events', label: 'Browse Events', icon: Calendar },
      { id: 'tickets', label: 'My Tickets', icon: QrCode },
    ],
    [],
  )

  return (
    <div className="h-screen bg-[#F5F5F5] overflow-hidden flex">
      {/* Sidebar / Drawer */}
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
              UniEvent Pro
            </motion.span>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <item.icon
                size={20}
                className={`shrink-0 ${
                  activeTab === item.id
                    ? 'text-indigo-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
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
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl w-[22rem] max-w-full border border-black/5">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen((v) => !v)}
                className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-black/5 shadow-2xl shadow-indigo-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">
                      Notifications
                    </p>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-black/5 last:border-b-0 ${
                          n.read ? 'bg-white' : 'bg-indigo-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {n.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-0.5">
                              {n.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {n.dateLabel}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="mt-1 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-5 border-l border-black/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user.username}
                </p>
                <p className="text-xs text-slate-500 capitalize">student</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                {user.username?.charAt(0) ?? 'S'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Page header (like UniEvent Pro) */}
          {activeTab === 'dashboard' && (
            <div className="flex items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Student Dashboard
                </h1>
                <p className="text-slate-500 mt-1">
                  Welcome back! Here&apos;s what&apos;s happening today.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm">
                <Calendar size={18} className="text-indigo-600" />
                <span className="text-sm font-semibold text-slate-700">
                  May 13, 2026
                </span>
              </div>
            </div>
          )}

          {/* Stats only on dashboard */}
          {activeTab === 'dashboard' && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}
                  >
                    <stat.icon size={22} />
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
          )}

          {/* Main content per tab */}
          {activeTab === 'dashboard' && <StudentOverviewSection />}
          {activeTab === 'events' && <StudentEventsSection />}
          {activeTab === 'tickets' && <StudentTicketsSection user={user} />}
        </main>
      </div>
    </div>
  )
}

function StudentOverviewSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Weekly activity chart */}
      <div className="lg:col-span-2 bg-white p-7 rounded-[32px] border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              Weekly activity
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              How many events you&apos;ve interacted with this week.
            </p>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[11px] font-bold">
            <span>+12% from last week</span>
          </div>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_ACTIVITY_DATA}>
              <defs>
                <linearGradient id="studentActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
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
                  boxShadow: '0 10px 15px -3px rgb(15 23 42 / 0.15)',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4F46E5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#studentActivity)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="lg:col-span-1 bg-white p-7 rounded-[32px] border border-black/5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming today</h2>
        <p className="text-sm text-slate-500 mb-6">
          Events starting soon. Make sure you don&apos;t miss them.
        </p>
        <div className="space-y-5">
          {MOCK_EVENTS.map((event, index) => (
            <div
              key={event.id}
              className="flex gap-4 group cursor-pointer items-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-black/5 group-hover:bg-indigo-50 transition-colors">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  May
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {15 + index}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {event.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-7 py-3 rounded-2xl border border-indigo-100 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors">
          View all schedule
        </button>
      </div>
    </section>
  )
}

function StudentEventsSection() {
  const [filter, setFilter] = useState('all')

  const filteredEvents =
    filter === 'all'
      ? MOCK_EVENTS
      : MOCK_EVENTS.filter((event) => event.category === filter)

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Discover events</h2>
          <p className="text-sm text-slate-500">
            Explore upcoming university events and find something that matches your
            interests.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-black/5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          {['all', 'workshop', 'sports', 'academic'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <motion.article
            key={event.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-[24px] overflow-hidden border border-black/5 shadow-sm hover:shadow-lg hover:shadow-indigo-50 transition-all group"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/40">
                  {event.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {event.title}
              </h3>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />{' '}
                    {event.dateLabel}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" /> {event.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" /> {event.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />{' '}
                    {event.registeredCount}/{event.capacity}
                  </span>
                </div>
              </div>
              <button className="mt-4 w-full py-2.5 rounded-2xl border border-indigo-100 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">
                Register for this event
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function StudentTicketsSection({ user }) {
  const ticket = {
    event: MOCK_EVENTS[0],
    id: 'TKT-99283-STU',
    userName: user.username,
    status: 'valid',
  }

  return (
    <section className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          My tickets
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Show your ticket at the entrance. This section mirrors the UniEvent ticket
          experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] overflow-hidden border border-black/5 shadow-2xl shadow-indigo-100 flex flex-col">
          <div className="h-32 bg-indigo-600 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                Confirmed ticket
              </span>
              <h3 className="text-xl font-bold text-white mt-3 leading-tight">
                {ticket.event.title}
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Date &amp; time
                </p>
                <p className="font-semibold text-slate-900">
                  {ticket.event.dateLabel}
                </p>
                <p className="text-xs text-slate-500">{ticket.event.time}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Location
                </p>
                <p className="font-semibold text-slate-900">
                  {ticket.event.location}
                </p>
                <p className="text-xs text-slate-500">Main campus</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Attendee
                </p>
                <p className="font-semibold text-slate-900">{ticket.userName}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status
                </p>
                <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                  <CheckCircle2 size={14} />
                  Valid entry
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-indigo-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Present this ticket at the event entrance. A QR or barcode can be added
              here later to match the full UniEvent implementation.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Entry instructions
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>Arrive at least 15 minutes before the event starts.</li>
              <li>Keep your student ID card with you for verification.</li>
              <li>This ticket is valid for a single entry only.</li>
              <li>
                Follow any additional instructions sent to your university email.
              </li>
            </ul>
          </div>

          <div className="bg-indigo-600 p-6 rounded-[28px] text-white relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <h3 className="text-base font-bold">Need help?</h3>
              <p className="text-sm text-indigo-100">
                If you have issues with your ticket or event registration, contact
                the student help desk.
              </p>
              <button className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-white text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">
                Contact support
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}


