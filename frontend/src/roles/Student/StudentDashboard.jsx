export function StudentDashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Student Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user.username}</strong>
          </p>
        </div>
        <button className="btn" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-section">
        <h2 className="section-title">Your events</h2>
        <p className="section-text">
          Here students can browse upcoming university events, register, and see
          their registrations.
        </p>
      </section>
    </div>
  )
}

