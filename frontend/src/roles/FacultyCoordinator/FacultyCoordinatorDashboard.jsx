export function FacultyCoordinatorDashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Faculty Coordinator Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user.username}</strong>
          </p>
        </div>
        <button className="btn" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-section">
        <h2 className="section-title">Faculty events overview</h2>
        <p className="section-text">
          Faculty coordinators can approve student events, manage faculty-level
          schedules, and coordinate with organizers.
        </p>
      </section>
    </div>
  )
}

