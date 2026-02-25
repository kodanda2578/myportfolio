import React, { useState, useEffect } from 'react';
import {
  initDb, loginUser, getProjects, getStudentProjects,
  createProject, updateProjectAdmin, addMilestone, toggleMilestone
} from './api';
import { ShieldCheck, User, LogOut, Plus, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    initDb();
    const loggedIn = localStorage.getItem('fsad_auth');
    if (loggedIn) setUser(JSON.parse(loggedIn));
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('fsad_auth', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fsad_auth');
  };

  return (
    <div className="app-container">
      {user ? (
        <>
          <nav className="navbar">
            <div className="nav-brand">NexusPortfolios</div>
            <div className="nav-user">
              <span>{user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn-outline btn-sm" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </nav>
          <main className="main-content">
            {user.role === 'admin' ?
              <AdminDashboard user={user} /> :
              <StudentDashboard user={user} />
            }
          </main>
        </>
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('student1@school.edu');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const u = loginUser(email, password);
    if (u) onLogin(u);
    else setError('Invalid credentials');
  }

  return (
    <div className="auth-container">
      <div className="glass-panel auth-form">
        <h2>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1rem' }}>Sign in to manage portfolios</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Email ID</label>
            <input
              type="email"
              className="form-control"
              value={email} onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password} onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            Login
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <p>Admin Login: admin@school.edu / password</p>
          <p>Student Login: student1@school.edu / password</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  if (status === 'Approved') return <span className="badge badge-approved"><CheckCircle size={14} style={{ marginRight: '4px' }} /> Approved</span>;
  if (status === 'Rejected') return <span className="badge badge-rejected"><XCircle size={14} style={{ marginRight: '4px' }} /> Rejected</span>;
  return <span className="badge badge-pending"><Clock size={14} style={{ marginRight: '4px' }} /> Pending Review</span>;
};

const StudentDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  // New Project Form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Milestone Form
  const [mTitle, setMTitle] = useState('');

  useEffect(() => { refreshProjects(); }, []);

  const refreshProjects = () => {
    setProjects(getStudentProjects(user.id));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    createProject({ title, description: desc, studentId: user.id, studentName: user.name, milestones: [] });
    refreshProjects();
    setModalOpen(false);
    setTitle(''); setDesc('');
  };

  const addM = (e) => {
    e.preventDefault();
    if (mTitle.trim()) {
      const updated = addMilestone(viewProject.id, mTitle);
      setViewProject(updated);
      setMTitle('');
      refreshProjects();
    }
  };

  const toggleM = (mId) => {
    const updated = toggleMilestone(viewProject.id, mId);
    setViewProject(updated);
    refreshProjects();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage and track your portfolio submissions.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="grid">
        {projects.map(p => (
          <div className="card" key={p.id}>
            <div>
              <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{p.title}</h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="card-desc">{p.description}</p>
            <div className="card-footer">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {p.milestones.filter(m => m.completed).length} / {p.milestones.length} Milestones
              </span>
              <button className="btn-outline btn-sm" onClick={() => setViewProject(p)}>Manage Object</button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects submitted yet.</p>}
      </div>

      {/* Create Project Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit New Project</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Project Title</label>
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" value={desc} onChange={e => setDesc(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Portfolio</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View/Manage Project Modal */}
      {viewProject && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem' }}>{viewProject.title}</h3>
                <StatusBadge status={viewProject.status} />
              </div>
              <button className="close-btn" onClick={() => setViewProject(null)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)' }}>Project Details</h4>
                <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{viewProject.description}</p>

                {viewProject.feedback && (
                  <div className="feedback-box" style={{ marginTop: '2rem' }}>
                    <h4><MessageSquare size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Admin Feedback</h4>
                    <p style={{ fontSize: '0.95rem' }}>{viewProject.feedback}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Milestones Tracking</h4>
                <div className="milestones-list">
                  {viewProject.milestones.map(m => (
                    <div className={`milestone-item ${m.completed ? 'completed' : ''}`} key={m.id}>
                      <div className="milestone-dot" onClick={() => toggleM(m.id)} style={{ cursor: 'pointer' }}></div>
                      <div className="milestone-content" onClick={() => toggleM(m.id)} style={{ cursor: 'pointer' }}>
                        <h4 style={{ fontSize: '1rem', margin: 0 }}>{m.title}</h4>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={addM} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input type="text" className="form-control" value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="Add a milestone..." style={{ flex: 1, padding: '0.6rem' }} />
                    <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1rem' }}><Plus size={16} /></button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [reviewPanel, setReviewPanel] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { refreshProjects(); }, []);

  const refreshProjects = () => {
    setProjects(getProjects());
  };

  const openReview = (p) => {
    setReviewPanel(p);
    setFeedback(p.feedback || '');
    setStatus(p.status);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProjectAdmin(reviewPanel.id, status, feedback);
    setReviewPanel(null);
    refreshProjects();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Review portfolios, manage submissions, and provide feedback.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>{projects.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submissions</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1, color: 'var(--warning)' }}>
                {projects.filter(p => p.status === 'Pending').length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Action</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Project Title</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} /> {p.studentName}
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{p.title}</td>
                <td>
                  {p.milestones.length > 0 ?
                    `${p.milestones.filter(m => m.completed).length} / ${p.milestones.length} Milestones` :
                    'No Milestones'}
                </td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  <button className="btn-outline btn-sm" onClick={() => openReview(p)}>Review</button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {reviewPanel && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.5rem' }}>Review Portfolio</h3>
              <button className="close-btn" onClick={() => setReviewPanel(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Student: {reviewPanel.studentName}</div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-primary)' }}>{reviewPanel.title}</h2>
                <p style={{ lineHeight: 1.6 }}>{reviewPanel.description}</p>

                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Milestones Tracker:</h4>
                  {reviewPanel.milestones.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No milestones recorded.</p> : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {reviewPanel.milestones.map(m => (
                        <div key={m.id} style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          background: m.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${m.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: m.completed ? 'var(--success)' : 'white'
                        }}>
                          {m.completed && <CheckCircle size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                          {m.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                <div className="form-group">
                  <label>Evaluation Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} style={{ appearance: 'none', background: 'rgba(0,0,0,0.5)' }}>
                    <option value="Pending">Pending Review</option>
                    <option value="Approved">Approve Portfolio</option>
                    <option value="Rejected">Request Revisions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mentor Feedback</label>
                  <textarea className="form-control" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide constructive feedback..." required></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn-outline" onClick={() => setReviewPanel(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">Submit Evaluation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
