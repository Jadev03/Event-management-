import { useState } from 'react'

import { Login } from './components/Login.jsx'
import { AdminDashboard } from './roles/Admin/AdminDashboard.jsx'
import { FacultyCoordinatorDashboard } from './roles/FacultyCoordinator/FacultyCoordinatorDashboard.jsx'
import { OrganizerDashboard } from './roles/Organizer/OrganizerDashboard.jsx'
import { StudentDashboard } from './roles/Student/StudentDashboard.jsx'
import { users } from './data/users.js'

const AppContent = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [error, setError] = useState('')

  const handleLogin = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword,
    )

    if (!matchedUser) {
      setError('Invalid university email or password.')
      setCurrentUser(null)
      return
    }

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

  const commonProps = { user: currentUser, onLogout: handleLogout }

  switch (currentUser.role) {
    case 'student':
      return <StudentDashboard {...commonProps} />
    case 'facultyCoordinator':
      return <FacultyCoordinatorDashboard {...commonProps} />
    case 'organizer':
      return <OrganizerDashboard {...commonProps} />
    case 'admin':
      return <AdminDashboard {...commonProps} />
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
