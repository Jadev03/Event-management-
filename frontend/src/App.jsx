import { useEffect, useState } from 'react'
import axios from 'axios'

import { Login } from './components/Login.jsx'
import { AdminDashboard } from './roles/Admin/AdminDashboard.jsx'
import { FacultyCoordinatorDashboard } from './roles/FacultyCoordinator/FacultyCoordinatorDashboard.jsx'
import { OrganizerDashboard } from './roles/Organizer/OrganizerDashboard.jsx'
import { StudentDashboard } from './roles/Student/StudentDashboard.jsx'

const ATTEMPT_WINDOW_MINUTES = 10

// Prefer Vite env, fall back to local dev URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// NOTE: no mock login-attempt data; UI reflects only what happens in this session.
const DUMMY_FAILED_ATTEMPTS = []

const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState('')

  const [adminUsers, setAdminUsers] = useState([])

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Client-side security analytics for admin (UI only, current session)
  const [loginAttempts, setLoginAttempts] = useState(DUMMY_FAILED_ATTEMPTS)

  // On first load, try to restore user from localStorage so refresh keeps user logged in.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed && parsed.email && parsed.role && parsed.username) {
        setCurrentUser(parsed)
      } else {
        localStorage.removeItem('currentUser')
      }
    } catch {
      // If corrupted, clear it.
      localStorage.removeItem('currentUser')
    }
  }, [])

  // Admin: always use real backend users (seeded if DB is empty)
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) return

    axios
      .get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        const items = res.data?.users ?? []
        setAdminUsers(
          items
            .filter((u) => u.role !== 'admin')
            .map((u) => ({
              id: u.id,
              email: u.email,
              username: u.name,
              role: u.role,
              isDeactivated: Boolean(u.isDeactivated),
              failedLoginAttempts: u.failedLoginAttempts ?? 0,
              loginSecurityAlertActive: Boolean(u.loginSecurityAlertActive),
              loginSecurityAlertTriggeredAt: u.loginSecurityAlertTriggeredAt ?? null,
              loginSecurityAlertReadAt: u.loginSecurityAlertReadAt ?? null,
            })),
        )
      })
      .catch(() => {
        // keep current state
      })
  }, [currentUser])

  const recordLoginAttempt = (email, success) => {
    const normalizedEmail = email.trim()
    const timestamp = Date.now()

    setLoginAttempts((prev) => {
      return [...prev.slice(-199), { email: normalizedEmail, success, timestamp }]
    })
  }

  const handleToggleDeactivate = async (email) => {
    const key = email.trim()
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      alert('You are not logged in.')
      return
    }

    const target = adminUsers.find((u) => u.email.trim() === key)
    if (!target?.id) return

    try {
      const endpoint = target.isDeactivated
        ? `${API_BASE_URL}/api/admin/users/${target.id}/activate`
        : `${API_BASE_URL}/api/admin/users/${target.id}/deactivate`

      const res = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )

      const updated = res.data?.user
      if (updated?.id) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id
              ? {
                  ...u,
                  isDeactivated: Boolean(updated.isDeactivated),
                  failedLoginAttempts: updated.failedLoginAttempts ?? 0,
                }
              : u,
          ),
        )
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Unable to update user status.')
    }
  }

  const handleMarkLoginSecurityAlertRead = async (userId) => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      alert('You are not logged in.')
      return false
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/users/${userId}/login-security-alert/read`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      const updated = res.data?.user
      if (updated?.id) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id
              ? {
                  ...u,
                  loginSecurityAlertActive: Boolean(updated.loginSecurityAlertActive),
                  loginSecurityAlertTriggeredAt:
                    updated.loginSecurityAlertTriggeredAt ?? u.loginSecurityAlertTriggeredAt ?? null,
                  loginSecurityAlertReadAt: updated.loginSecurityAlertReadAt ?? null,
                }
              : u,
          ),
        )
      }
      return true
    } catch (e) {
      alert(e?.response?.data?.message || 'Unable to mark alert as read.')
      return false
    }
  }

  const handleLogin = async (email, password) => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          email: trimmedEmail,
          password: trimmedPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      // Backend returns: { message, user, token, refreshToken }
      const { token, refreshToken, user } = response.data || {}

      if (!user) {
        setError('Unexpected server response. Please try again.')
        setCurrentUser(null)
        recordLoginAttempt(trimmedEmail, false)
        return
      }

      if (token) {
        localStorage.setItem('accessToken', token)
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }

      const mappedUser = {
        id: user.id,
        email: user.email,
        username: user.name,
        role: user.role,
      }

      recordLoginAttempt(trimmedEmail, true)
      setCurrentUser(mappedUser)
      try {
        localStorage.setItem('currentUser', JSON.stringify(mappedUser))
      } catch {
        // non-fatal
      }
      setError('')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      const responseMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === 'string' ? err.response.data : null)

      setError(
        responseMessage ||
          'Unable to connect to server. Please try again later.',
      )
      setCurrentUser(null)
      recordLoginAttempt(trimmedEmail, false)
    }
  }

  const performLogout = async () => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')

    try {
      if (accessToken || refreshToken) {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          { refreshToken },
          {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
              'Content-Type': 'application/json',
            },
          },
        )
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error during logout', err)
      // We still clear local state/tokens even if backend call fails
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('currentUser')
      setCurrentUser(null)
      setError('')
    }
  }

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true)
  }

  const LogoutConfirmModal = isLogoutConfirmOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm sign out"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoggingOut) {
          setIsLogoutConfirmOpen(false)
        }
      }}
    >
      <div className="w-full max-w-md rounded-[24px] bg-white border border-black/5 shadow-xl p-6">
        <h3 className="text-lg font-bold text-slate-900">Are you sure?</h3>
        <p className="text-sm text-slate-600 mt-2">
          Are you sure you want to sign out?
        </p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => setIsLogoutConfirmOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            No
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={async () => {
              setIsLoggingOut(true)
              await performLogout()
              setIsLoggingOut(false)
              setIsLogoutConfirmOpen(false)
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-indigo-100 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {isLoggingOut ? 'Signing out…' : 'Yes, sign out'}
          </button>
        </div>
      </div>
    </div>
  ) : null

  if (!currentUser) {
    return <Login onLogin={handleLogin} error={error} />
  }

  const handleCreateUser = async ({ email, username, password, role }) => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      alert('You are not logged in.')
      return null
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/users`,
        { name: username, email, role, password },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      const created = res.data?.user
      const generatedPassword = res.data?.generatedPassword
      if (created?.email) {
        setAdminUsers((prev) => [
          {
            id: created.id,
            email: created.email,
            username: created.name,
            role: created.role,
          },
          ...prev,
        ])
      }

      return created
        ? {
            email: created.email,
            username: created.name,
            role: created.role,
            generatedPassword: generatedPassword || password,
          }
        : null
    } catch (e) {
      alert(e?.response?.data?.message || 'Unable to create user.')
      return null
    }
  }

  const handleUpdateUser = async (id, updates) => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      alert('You are not logged in.')
      return null
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/admin/users/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )

      const updated = res.data?.user
      if (updated?.id) {
        setAdminUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id
              ? {
                  ...u,
                  email: updated.email,
                  username: updated.name,
                  role: updated.role,
                }
              : u,
          ),
        )
      }

      return updated || null
    } catch (e) {
      alert(e?.response?.data?.message || 'Unable to update user.')
      return null
    }
  }

  const handleDeleteUser = async (id) => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      alert('You are not logged in.')
      return false
    }

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const deletedUserId = res.data?.deletedUserId
      if (deletedUserId) {
        setAdminUsers((prev) => prev.filter((u) => u.id !== deletedUserId))
      } else {
        setAdminUsers((prev) => prev.filter((u) => u.id !== id))
      }

      return true
    } catch (e) {
      alert(e?.response?.data?.message || 'Unable to delete user.')
      return false
    }
  }

  const securityProps = {
    loginAttempts,
    lockedEmails: {},
    deactivatedEmails: Object.fromEntries(
      adminUsers
        .filter((u) => u.isDeactivated)
        .map((u) => [u.email.trim(), { email: u.email.trim() }]),
    ),
    onToggleLock: null,
    onToggleDeactivate: handleToggleDeactivate,
  }

  const commonProps = {
    user: currentUser,
    onLogout: handleLogout,
    ...securityProps,
  }

  switch (currentUser.role) {
    case 'student':
      return (
        <>
          {LogoutConfirmModal}
          <StudentDashboard {...commonProps} />
        </>
      )
    case 'facultyCoordinator':
      return (
        <>
          {LogoutConfirmModal}
          <FacultyCoordinatorDashboard {...commonProps} />
        </>
      )
    case 'organizer':
      return (
        <>
          {LogoutConfirmModal}
          <OrganizerDashboard {...commonProps} />
        </>
      )
    case 'admin':
      return (
        <>
          {LogoutConfirmModal}
          <AdminDashboard
            {...commonProps}
            users={adminUsers}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onMarkLoginSecurityAlertRead={handleMarkLoginSecurityAlertRead}
          />
        </>
      )
    default:
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-8">
          {LogoutConfirmModal}
          <div className="bg-white border border-black/5 rounded-3xl shadow-xl shadow-indigo-100 p-8 max-w-lg w-full text-center">
            <p className="text-slate-700">
              Signed in as <strong>{currentUser.username}</strong> with unknown
              role: <code className="text-slate-900">{currentUser.role}</code>
            </p>
            <button
              className="mt-6 inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>
      )
  }
}

export default function App() {
  return <AppContent />
}
