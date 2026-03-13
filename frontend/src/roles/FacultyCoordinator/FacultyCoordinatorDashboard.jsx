import React, { useState } from 'react'
import {
  Users,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight,
  LayoutDashboard,
  Menu,
  X,
  Search,
  LogOut,
  Bell,
  ScanLine,
  UserCheck,
  Mic2,
  Eye,
} from 'lucide-react'
import { motion } from 'motion/react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const participationData = [
  { name: 'Jan', participation: 20 },
  { name: 'Feb', participation: 35 },
  { name: 'Mar', participation: 45 },
  { name: 'Apr', participation: 30 },
  { name: 'May', participation: 55 },
  { name: 'Jun', participation: 40 },
]

const MOCK_MY_PARTICIPATION = [
  { id: 'e3', title: 'Research Symposium', dateLabel: 'Jun 15, 2026', role: 'speaker' },
  { id: 'e1', title: 'AI Workshop 2026', dateLabel: 'May 20, 2026', role: 'supervisor' },
  { id: 'e4', title: 'Web Dev Bootcamp: React + Vite', dateLabel: 'May 28, 2026', role: 'attendee' },
]

const MOCK_TARGETED_NOTIFICATIONS = [
  { id: 'n1', title: 'CS Dept: AI Workshop reminder', message: 'AI Workshop 2026 starts May 20. You are listed as supervisor.', dateLabel: 'Today', read: false },
  { id: 'n2', title: 'Academic: Research Symposium', message: 'You are speaking at Research Symposium on Jun 15.', dateLabel: 'Yesterday', read: true },
  { id: 'n3', title: 'Your department events this week', message: '2 academic events in IT Faculty this week.', dateLabel: '2 days ago', read: true },
]

const MOCK_ATTENDANCE = [
  { eventId: 'e1', eventTitle: 'AI Workshop 2026', dateLabel: 'May 20, 2026', total: 45, validated: 42 },
  { eventId: 'e3', eventTitle: 'Research Symposium', dateLabel: 'Jun 15, 2026', total: 32, validated: 0 },
]

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
  },
  {
    id: 'e4',
    title: 'Web Dev Bootcamp: React + Vite',
    description: 'Hands-on session building modern UIs and shipping fast.',
    dateLabel: 'May 28, 2026',
    time: '02:00 PM',
    location: 'Lab 3 (CS Building)',
    category: 'workshop',
    registeredCount: 76,
    capacity: 120,
  },
  {
    id: 'e7',
    title: 'Math Olympiad Qualifier',
    description: 'Challenge round for students competing in the national event.',
    dateLabel: 'Jun 12, 2026',
    time: '11:00 AM',
    location: 'Lecture Hall 2',
    category: 'academic',
    registeredCount: 38,
    capacity: 60,
  },
]

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-participation', label: 'My Participation', icon: UserCheck },
  { id: 'validate-attendance', label: 'Validate Attendance', icon: ScanLine },
  { id: 'events', label: 'Browse Events', icon: Calendar },
]

function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}

export function FacultyCoordinatorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notifications = MOCK_TARGETED_NOTIFICATIONS
  const unreadCount = notifications.filter((n) => !n.read).length

  const stats = [
    { label: 'Academic Events', value: '14', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Hours', value: '42', icon: Clock, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Students Mentored', value: '128', icon: Users, color: 'bg-orange-50 text-orange-600' },
    { label: 'Certifications', value: '5', icon: Award, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="h-screen bg-[#F5F5F5] overflow-hidden flex">
      {/* Sidebar */}
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
              University Events
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
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              )}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <item.icon
                size={20}
                className={cn(
                  'shrink-0',
                  activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600',
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
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl w-[22rem] max-w-full border border-black/5">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search events, students..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
                aria-label="Targeted notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-black/5 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">Targeted notifications</p>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          'px-4 py-3 border-b border-black/5 last:border-b-0',
                          n.read ? 'bg-white' : 'bg-indigo-50/40',
                        )}
                      >
                        <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.dateLabel}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pl-5 border-l border-black/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.username ?? 'Faculty'}</p>
                <p className="text-xs text-slate-500 capitalize">Faculty Coordinator</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                {user?.username?.charAt(0) ?? 'F'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Faculty Portal
                  </h1>
                  <p className="text-slate-500 mt-1">
                    Monitor academic events and track your professional participation.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <BookOpen size={24} />
                  </div>
                </div>
              </div>

              {/* Faculty Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
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
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Event trends + Academic Events */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Event trends</h2>
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
                      <TrendingUp size={14} />
                      +8% vs last term
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={participationData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="participation" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Academic Events</h2>
                  <div className="space-y-6">
                    {MOCK_EVENTS.map((event) => (
                      <div key={event.id} className="group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded-md">
                            {event.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {event.dateLabel}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} /> {event.registeredCount} Students
                          </span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold text-indigo-600">View Details</span>
                          <ChevronRight size={16} className="text-indigo-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full mt-8 py-3 rounded-2xl border border-indigo-100 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    Browse All Academic Events
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-participation' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  My Participation
                </h1>
                <p className="text-slate-500 mt-1">
                  Events where you participate as attendee, speaker, or supervisor.
                </p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                <div className="space-y-4">
                  {MOCK_MY_PARTICIPATION.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          {item.role === 'speaker' && <Mic2 size={22} />}
                          {item.role === 'supervisor' && <UserCheck size={22} />}
                          {item.role === 'attendee' && <Eye size={22} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-500">{item.dateLabel}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md capitalize">
                            {item.role}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validate-attendance' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Validate Attendance
                </h1>
                <p className="text-slate-500 mt-1">
                  Reliable attendance validation for students at academic-related events.
                </p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Academic events – attendance</h2>
                <div className="space-y-4">
                  {MOCK_ATTENDANCE.map((a) => (
                    <div
                      key={a.eventId}
                      className="flex items-center justify-between p-4 rounded-2xl border border-black/5 hover:border-indigo-100 transition-colors"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900">{a.eventTitle}</h3>
                        <p className="text-sm text-slate-500">{a.dateLabel}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {a.validated} of {a.total} students validated
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                          <ScanLine size={18} />
                          {a.validated > 0 ? 'View / Scan more' : 'Scan attendance'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-6">
                  Use the scanner to verify student QR codes at event entry for reliable attendance records.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Browse Events
                </h1>
                <p className="text-slate-500 mt-1">
                  View and manage academic and workshop events.
                </p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">All Academic & Workshop Events</h2>
                <div className="space-y-6">
                  {MOCK_EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-2xl border border-black/5 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold uppercase rounded-md">
                          {event.category}
                        </span>
                        <span className="text-xs text-slate-400">{event.dateLabel}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {event.registeredCount} / {event.capacity} registered
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
