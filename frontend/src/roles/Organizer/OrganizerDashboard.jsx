export function OrganizerDashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Organizer Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user.username}</strong>
          </p>
        </div>
        <button className="btn" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-section">
        <h2 className="section-title">Manage your events</h2>
        <p className="section-text">
          Organizers can create events, manage registrations, and communicate
          with participants.
        </p>
      </section>
    </div>
  )
}

