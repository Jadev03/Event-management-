import { useState } from 'react'

import { Login } from './components/Login.jsx'
import { AdminDashboard } from './roles/Admin/AdminDashboard.jsx'
import { FacultyCoordinatorDashboard } from './roles/FacultyCoordinator/FacultyCoordinatorDashboard.jsx'
import { OrganizerDashboard } from './roles/Organizer/OrganizerDashboard.jsx'
import { StudentDashboard } from './roles/Student/StudentDashboard.jsx'
import { users as baseUsers } from './data/users.js'

const MAX_FAILED_ATTEMPTS = 5
const ATTEMPT_WINDOW_MINUTES = 10

// Dummy failed login attempts so "Most failed login attempts" shows data (counts > 0)
const _now = Date.now()
const _hour = 60 * 60 * 1000
const DUMMY_FAILED_ATTEMPTS = [
  { email: 'student1@university.ac.lk', success: false, timestamp: _now - 3 * _hour },
  { email: 'student1@university.ac.lk', success: false, timestamp: _now - 2 * _hour },
  { email: 'student1@university.ac.lk', success: false, timestamp: _now - 1 * _hour },
  { email: 'faculty1@university.ac.lk', success: false, timestamp: _now - 5 * _hour },
  { email: 'faculty1@university.ac.lk', success: false, timestamp: _now - 4 * _hour },
  { email: 'organizer1@university.ac.lk', success: false, timestamp: _now - 6 * _hour },
]

const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState('')

  const [extraUsers, setExtraUsers] = useState([])

  // Simple in-memory security analytics for admin (pre-seeded with dummy failed attempts)
  const [loginAttempts, setLoginAttempts] = useState(DUMMY_FAILED_ATTEMPTS)
  const [lockedEmails, setLockedEmails] = useState({})
  const [deactivatedEmails, setDeactivatedEmails] = useState({})

  const recordLoginAttempt = (email, success) => {
    const normalizedEmail = email.trim().toLowerCase()
    const timestamp = Date.now()

    setLoginAttempts((prev) => {
      const next = [...prev.slice(-199), { email: normalizedEmail, success, timestamp }]

      if (!success) {
        setLockedEmails((prevLocked) => {
          const now = Date.now()
          const windowMs = ATTEMPT_WINDOW_MINUTES * 60 * 1000
          const failedForUser = next.filter(
            (a) =>
              a.email === normalizedEmail &&
              !a.success &&
              now - a.timestamp <= windowMs,
          )

          if (failedForUser.length >= MAX_FAILED_ATTEMPTS) {
            if (prevLocked[normalizedEmail]) return prevLocked
            return {
              ...prevLocked,
              [normalizedEmail]: {
                email: normalizedEmail,
                lockedAt: now,
                reason: 'too_many_failed_logins',
                failuresInWindow: failedForUser.length,
              },
            }
          }

          return prevLocked
        })
      }

      return next
    })
  }

  const handleToggleLock = (email) => {
    const key = email.trim().toLowerCase()
    setLockedEmails((prev) => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = {
          email: key,
          lockedAt: Date.now(),
          reason: 'manual_lock',
        }
      }
      return next
    })
  }

  const handleToggleDeactivate = (email) => {
    const key = email.trim().toLowerCase()
    setDeactivatedEmails((prev) => {
      const next = { ...prev }
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = {
          email: key,
          deactivatedAt: Date.now(),
          reason: 'admin_decision',
        }
        setLockedEmails((prevLocked) => ({
          ...prevLocked,
          [key]: {
            email: key,
            lockedAt: Date.now(),
            reason: 'deactivated',
          },
        }))
      }
      return next
    })
  }

  const handleLogin = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (deactivatedEmails[trimmedEmail]) {
      setError(
        'Your account has been deactivated. Please contact the administrator.',
      )
      setCurrentUser(null)
      recordLoginAttempt(trimmedEmail, false)
      return
    }

    if (lockedEmails[trimmedEmail]) {
      setError(
        'Your account is temporarily locked due to too many failed login attempts.',
      )
      setCurrentUser(null)
      return
    }

    const allUsers = [...baseUsers, ...extraUsers]
    const matchedUser = allUsers.find(
      (u) =>
        u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword,
    )

    if (!matchedUser) {
      setError('Invalid university email or password.')
      setCurrentUser(null)
       recordLoginAttempt(trimmedEmail, false)
      return
    }

    recordLoginAttempt(trimmedEmail, true)
    setCurrentUser(matchedUser)
    setError('')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setError('')
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} error={error} />
  }

  const allUsers = [...baseUsers, ...extraUsers]

  const handleCreateUser = ({ email, username, password, role }) => {
    const normalEmail = email.trim().toLowerCase()
    const exists = allUsers.some(
      (u) => u.email.toLowerCase() === normalEmail,
    )
    if (exists) {
      alert('A user with this email already exists.')
      return null
    }

    const newUser = {
      email: normalEmail,
      password,
      username,
      role,
    }
    setExtraUsers((prev) => [...prev, newUser])
    return newUser
  }

  const securityProps = {
    loginAttempts,
    lockedEmails,
    deactivatedEmails,
    onToggleLock: handleToggleLock,
    onToggleDeactivate: handleToggleDeactivate,
  }

  const commonProps = {
    user: currentUser,
    onLogout: handleLogout,
    ...securityProps,
  }

  switch (currentUser.role) {
    case 'student':
      return <StudentDashboard {...commonProps} />
    case 'facultyCoordinator':
      return <FacultyCoordinatorDashboard {...commonProps} />
    case 'organizer':
      return <OrganizerDashboard {...commonProps} />
    case 'admin':
      return (
        <AdminDashboard
          {...commonProps}
          users={allUsers}
          onCreateUser={handleCreateUser}
        />
      )
    default:
      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-8">
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
