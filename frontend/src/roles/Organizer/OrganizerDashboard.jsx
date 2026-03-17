import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  MoreVertical,
  Plus,
  Search,
  Users,
  X,
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
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'academic',
    date: '',
    time: '',
    place: '',
    seats: '',
    thumbnail: '',
  })
  const [createError, setCreateError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editError, setEditError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'academic',
    date: '',
    time: '',
    place: '',
    seats: '',
    thumbnail: '',
    status: 'pending',
  })

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      setEvents(MOCK_EVENTS)
      return
    }

    axios
      .get(`${API_BASE_URL}/api/events/mine`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        const serverEvents = res.data?.events ?? []
        setEvents(serverEvents)
      })
      .catch(() => {
        // Fall back to local mocks if backend is unavailable
        setEvents(MOCK_EVENTS)
      })
  }, [API_BASE_URL])

  const handleOpenCreate = () => {
    setCreateError('')
    setIsCreateOpen(true)
  }

  const handleCloseCreate = () => {
    setCreateError('')
    setIsCreateOpen(false)
  }

  const toDateInputValue = (d) => {
    if (!d) return ''
    const dateObj = typeof d === 'string' ? new Date(d) : d
    if (Number.isNaN(dateObj.getTime())) return ''
    const yyyy = dateObj.getFullYear()
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dd = String(dateObj.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const handleOpenEdit = (event) => {
    setEditError('')
    setEditingEvent(event)
    // event can be either mapped (title/date string) or server event shape
    if (event?.name) {
      setEditForm({
        name: event.name ?? '',
        description: event.description ?? '',
        type: event.type ?? 'academic',
        date: toDateInputValue(event.date),
        time: event.time ?? '',
        place: event.place ?? '',
        seats: String(event.totalSeats ?? ''),
        thumbnail: event.thumbnailUrl ?? '',
        status: event.status ?? 'pending',
      })
    } else {
      // Legacy/mocked event (limited fields)
      setEditForm((prev) => ({
        ...prev,
        name: event.title ?? '',
        date: '',
        time: '',
        place: '',
        seats: String(event.capacity ?? ''),
        thumbnail: event.thumbnailUrl ?? event.thumbnail ?? '',
        status: event.status ?? 'pending',
      }))
    }
    setIsEditOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setEditingEvent(null)
    setEditError('')
  }

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    setEditError('')

    if (
      !editingEvent?.id ||
      !editForm.name.trim() ||
      !editForm.date ||
      !editForm.time ||
      !editForm.place.trim() ||
      !editForm.seats
    ) {
      setEditError(
        'Please fill in event name, date, time, place and total seats.',
      )
      return
    }

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      setEditError('You are not logged in.')
      return
    }

    setIsUpdating(true)
    axios
      .put(
        `${API_BASE_URL}/api/events/${editingEvent.id}`,
        {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          type: editForm.type,
          date: editForm.date,
          time: editForm.time,
          place: editForm.place.trim(),
          totalSeats: Number.parseInt(editForm.seats, 10),
          thumbnailUrl: editForm.thumbnail.trim(),
          status: editForm.status,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      .then((res) => {
        const updated = res.data?.event
        if (updated) {
          setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)))
        }
        setIsEditOpen(false)
        setEditingEvent(null)
      })
      .catch((err) => {
        setEditError(
          err?.response?.data?.message ||
            'Unable to update event. Please try again.',
        )
      })
      .finally(() => setIsUpdating(false))
  }

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmitCreate = (e) => {
    e.preventDefault()
    setCreateError('')
    if (
      !form.name.trim() ||
      !form.date ||
      !form.time ||
      !form.place.trim() ||
      !form.seats
    ) {
      setCreateError(
        'Please fill in event name, date, time, place and total seats.',
      )
      return
    }

    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      setCreateError('You are not logged in.')
      return
    }

    setIsSaving(true)
    axios
      .post(
        `${API_BASE_URL}/api/events`,
        {
          name: form.name.trim(),
          description: form.description.trim(),
          type: form.type,
          date: form.date,
          time: form.time,
          place: form.place.trim(),
          totalSeats: Number.parseInt(form.seats, 10),
          thumbnailUrl: form.thumbnail.trim(),
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      .then((res) => {
        const created = res.data?.event
        if (created) {
          setEvents((prev) => [created, ...prev])
        }
        setForm({
          name: '',
          description: '',
          type: 'academic',
          date: '',
          time: '',
          place: '',
          seats: '',
          thumbnail: '',
        })
        setIsCreateOpen(false)
      })
      .catch((err) => {
        setCreateError(
          err?.response?.data?.message ||
            'Unable to create event. Please try again.',
        )
      })
      .finally(() => setIsSaving(false))
  }

  const allEvents = useMemo(
    () =>
      (events?.length ? events : MOCK_EVENTS).map((e) => {
        if (e.title) return e
        return {
          id: e.id,
          title: e.name,
          date: new Date(e.date).toLocaleDateString(undefined, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          registeredCount: 0,
          capacity: e.totalSeats,
          status: e.status ?? 'pending',
          thumbnailUrl: e.thumbnailUrl ?? '',
          _server: e,
        }
      }),
    [events],
  )

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
            <button
              className="hidden sm:inline-flex bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              onClick={handleOpenCreate}
            >
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
        {isCreateOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-black/5 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
              <button
                type="button"
                onClick={handleCloseCreate}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                aria-label="Close create event form"
              >
                <X size={18} />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Create new event
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Add event details. This form is local-only for now and will add
                to your &quot;My Events&quot; list.
              </p>
              <form
                onSubmit={handleSubmitCreate}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {createError && (
                  <div className="md:col-span-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                )}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Event name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="e.g. AI Workshop 2026"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Event type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="academic">Academic</option>
                    <option value="workshop">Work</option>
                    <option value="sports">Sports</option>
                    <option value="social">Social</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Time
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Place
                  </label>
                  <input
                    type="text"
                    value={form.place}
                    onChange={(e) => handleFormChange('place', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="e.g. Innovation Lab"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Total number of seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.seats}
                    onChange={(e) => handleFormChange('seats', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="e.g. 150"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Event description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange('description', e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                    placeholder="Brief description of the event..."
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Thumbnail image URL
                  </label>
                  <input
                    type="url"
                    value={form.thumbnail}
                    onChange={(e) =>
                      handleFormChange('thumbnail', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    For now this is stored only in the browser and used for
                    display.
                  </p>
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseCreate}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving…' : 'Save event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl border border-black/5 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                aria-label="Close edit event form"
              >
                <X size={18} />
              </button>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Edit event
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Update this event and save changes.
              </p>
              <form
                onSubmit={handleSubmitEdit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {editError && (
                  <div className="md:col-span-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {editError}
                  </div>
                )}

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Event name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Event type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => handleEditChange('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="academic">Academic</option>
                    <option value="work">Work</option>
                    <option value="sports">Sports</option>
                    <option value="social">Social</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => handleEditChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Place
                  </label>
                  <input
                    type="text"
                    value={editForm.place}
                    onChange={(e) => handleEditChange('place', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Total number of seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.seats}
                    onChange={(e) => handleEditChange('seats', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Event description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      handleEditChange('description', e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Thumbnail image URL
                  </label>
                  <input
                    type="url"
                    value={editForm.thumbnail}
                    onChange={(e) =>
                      handleEditChange('thumbnail', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-black/5 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
            <button
              className="sm:hidden bg-indigo-600 text-white px-4 py-2.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              onClick={handleOpenCreate}
            >
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
                        Thumbnail
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
                    {allEvents.map((event) => (
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
                        <td className="px-6 md:px-8 py-4">
                          {event.thumbnailUrl ? (
                            <img
                              src={event.thumbnailUrl}
                              alt={`${event.title} thumbnail`}
                              className="w-16 h-10 rounded-xl object-cover border border-black/5"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
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
                          <button
                            className="text-indigo-600 font-bold text-sm hover:underline"
                            onClick={() =>
                              handleOpenEdit(event._server ? event._server : event)
                            }
                          >
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
