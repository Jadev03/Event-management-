export function AdminDashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome, <strong>{user.username}</strong>
          </p>
        </div>
        <button className="btn" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-section">
        <h2 className="section-title">System administration</h2>
        <p className="section-text">
          Admins can manage users, roles, and global university event
          configuration.
        </p>
      </section>
    </div>
  )
}

