import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSpring, animated } from 'react-spring';

const cardStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  padding: 24,
  margin: '24px auto',
  maxWidth: 500,
  border: '1px solid #e3e3e3'
};
const headingStyle = {
  color: '#1a4f8c',
  fontWeight: 700,
  marginBottom: 16
};
const labelStyle = {
  display: 'block',
  margin: '12px 0 6px',
  fontWeight: 500
};
const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #d0d0d0',
  marginBottom: 12
};
const buttonStyle = {
  background: 'linear-gradient(90deg,#1a4f8c,#3b82f6)',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 24px',
  fontWeight: 600,
  marginRight: 10,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(26,79,140,0.08)'
};
const logoStyle = {
  fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  fontWeight: 900,
  fontSize: 32,
  letterSpacing: 2,
  color: '#ff8c00',
  display: 'flex',
  alignItems: 'center',
  gap: 10
};
const badgeStyle = status => ({
  display: 'inline-block',
  padding: '6px 18px',
  borderRadius: 20,
  fontWeight: 700,
  color: '#fff',
  background: status === 'Approved' ? '#10b981' : status === 'Pending' ? '#f59e0b' : '#ef4444',
  marginBottom: 8
});

function App() {
  const [page, setPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!isAdmin && page !== 'home') {
    return <AdminLogin onLogin={() => { setIsAdmin(true); setPage('dashboard'); }} />;
  }

  return (
    <div>
      <Header onNav={setPage} onShowForm={() => setShowForm(true)} />
      {page === 'home' && <Home onShowForm={() => setShowForm(true)} onNav={setPage} />}
      {showForm && <UserVisaForm onClose={() => setShowForm(false)} />}
      {page === 'dashboard' && <Dashboard />}
      {page === 'notifications' && <Notifications />}
      {page === 'documents' && <UserApplications />}
    </div>
  );
}

function Header({ onNav, onShowForm }) {
  return (
    <header style={{ background: 'linear-gradient(90deg,#1a4f8c,#3b82f6)', color: '#fff', padding: '18px 0', boxShadow: '0 2px 8px rgba(26,79,140,0.08)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={logoStyle}><span role="img" aria-label="logo">🦘</span> Australia Job Visa Portal</div>
        <nav>
          <button style={buttonStyle} onClick={() => onNav('home')}>Home</button>
          <button style={buttonStyle} onClick={() => onShowForm()}>Apply Now</button>
          <button style={buttonStyle} onClick={() => onNav('dashboard')}>Admin</button>
          <button style={buttonStyle} onClick={() => onNav('documents')}>Applications</button>
        </nav>
      </div>
    </header>
  );
}

function Home({ onShowForm, onNav }) {
  const fade = useSpring({ opacity: 1, from: { opacity: 0 }, config: { duration: 700 } });
  return (
    <animated.div style={{ ...fade, background: 'linear-gradient(120deg,#e3f0ff 0%,#f8fafc 100%)', minHeight: '100vh', paddingTop: 60 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: 42, color: '#1a4f8c', fontWeight: 800, marginBottom: 18 }}>Welcome to Australia Job Visa Portal</h1>
        <p style={{ fontSize: 20, color: '#3b82f6', marginBottom: 32 }}>Fast, secure, and easy visa application for your dream job in Australia.</p>
        <button style={{ ...buttonStyle, fontSize: 22, padding: '18px 40px', marginBottom: 32 }} onClick={onShowForm}>Apply for Visa</button>
        <VisaStatusCard onNav={onNav} />
      </div>
    </animated.div>
  );
}

function VisaStatusCard({ onNav }) {
  // Example status and progress
  const status = 'Pending';
  const progress = 60;
  const progressSpring = useSpring({ width: `${progress}%`, from: { width: '0%' }, config: { duration: 800 } });
  return (
    <div style={{ margin: '40px auto', maxWidth: 500, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: 32 }}>
      <h2 style={{ color: '#1a4f8c', fontWeight: 700, marginBottom: 12 }}>Visa Status Check A1</h2>
      <span style={badgeStyle(status)}>{status}</span>
      <div style={{ background: '#e5e7eb', borderRadius: 8, height: 12, margin: '18px 0', overflow: 'hidden' }}>
        <animated.div style={{ ...progressSpring, background: '#3b82f6', height: '100%' }} />
      </div>
      <p style={{ color: '#333', marginBottom: 18 }}>Check your visa application status instantly with your User ID and Password.</p>
      <button style={buttonStyle} onClick={() => onNav('documents')}>Check Status</button>
      <div style={{ marginTop: 18, color: '#888', fontSize: 14 }}>
        <span role="img" aria-label="secure">🔒</span> Your data is protected and confidential.
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('alexxosef@gmail.com');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const requestOTP = async () => {
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3001/admin/login', { email });
      setStep(2);
      setMessage(res.data.message || 'OTP sent to your email.');
    } catch (err) {
      setMessage('Error sending OTP.');
    }
  };

  const verifyOTP = async () => {
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3001/admin/login', { email, otp });
      if (res.data.success) {
        onLogin();
      } else {
        setMessage(res.data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setMessage('Invalid or expired OTP.');
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>
      {step === 1 && (
        <div>
          <label>Email: <input value={email} onChange={e => setEmail(e.target.value)} disabled /></label>
          <button onClick={requestOTP}>Request OTP</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <label>OTP: <input value={otp} onChange={e => setOtp(e.target.value)} /></label>
          <button onClick={verifyOTP}>Login</button>
        </div>
      )}
      <div style={{ color: 'red', marginTop: 10 }}>{message}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2 style={headingStyle}>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <section style={{ ...cardStyle, flex: 1 }}>
          <h3 style={headingStyle}>Remote Device Control</h3>
          <DeviceControl />
        </section>
        <section style={{ ...cardStyle, flex: 1 }}>
          <h3 style={headingStyle}>Active Device Notifications</h3>
          <DeviceNotifications />
        </section>
      </div>
      <section style={{ ...cardStyle, marginTop: 32 }}>
        <h3 style={headingStyle}>User Application Details</h3>
        <UserApplications />
      </section>
    </div>
  );
}

function DeviceControl() {
  const [selectedUser, setSelectedUser] = useState('');
  const [command, setCommand] = useState('');
  const [status, setStatus] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket('ws://localhost:8081');
    ws.current.onmessage = (event) => {
      setStatus(event.data);
    };
    return () => {
      ws.current.close();
    };
  }, []);

  const sendCommand = () => {
    if (ws.current && selectedUser && command) {
      ws.current.send(JSON.stringify({ user: selectedUser, command }));
      setStatus('Command sent: ' + command);
    }
  };

  return (
    <div>
      <label>User Email: <input value={selectedUser} onChange={e => setSelectedUser(e.target.value)} placeholder="user@example.com" /></label>
      <label>Command: <input value={command} onChange={e => setCommand(e.target.value)} placeholder="e.g. lock, unlock, notify" /></label>
      <button onClick={sendCommand}>Send Command</button>
      <div>Status: {status}</div>
    </div>
  );
}

function DeviceNotifications() {
  const [notifications, setNotifications] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket('ws://localhost:8081');
    ws.current.onmessage = (event) => {
      setNotifications(prev => [...prev, event.data]);
    };
    return () => {
      ws.current.close();
    };
  }, []);

  return (
    <div>
      <ul>
        {notifications.map((note, idx) => <li key={idx}>{note}</li>)}
      </ul>
    </div>
  );
}

function UserApplications() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/admin/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <h3>User List</h3>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            <button onClick={() => setSelectedUser(user)}>{user.email}</button>
          </li>
        ))}
      </ul>
      {selectedUser && (
        <div style={{ marginTop: 20 }}>
          <h4>Details for {selectedUser.email}</h4>
          <p><strong>Application:</strong> {JSON.stringify(selectedUser.application)}</p>
          <p><strong>Documents:</strong></p>
          <ul>
            {selectedUser.documents && selectedUser.documents.map((doc, idx) => (
              <li key={idx}>
                {doc ? (
                  <a href={`http://localhost:3001/user/document/${doc}`} target="_blank" rel="noopener noreferrer">Download/View Document {idx+1}</a>
                ) : 'No document'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Notifications() {
  return (
    <div>
      <h2>Device Notifications</h2>
      {/* Add real-time notifications here */}
    </div>
  );
}

function Documents() {
  return (
    <div>
      <h2>User Documents & Applications</h2>
      {/* Add document/application viewing here */}
    </div>
  );
}

function UserVisaForm({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    passport: '',
    dob: '',
    education: '',
    occupation: '',
    experience: '',
    documents: [null, null, null]
  });
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (idx, file) => {
    const docs = [...form.documents];
    docs[idx] = file;
    setForm({ ...form, documents: docs });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(form).forEach(key => {
      if (key !== 'documents') data.append(key, form[key]);
    });
    form.documents.forEach((doc, idx) => {
      if (doc) data.append(`document${idx+1}`, doc);
    });
    try {
      const res = await axios.post('http://localhost:3001/user/apply', data);
      setMessage('Application submitted successfully! Please check your email for User ID & Password.');
      setUserId(res.data.userId);
      setUserPassword(res.data.password);
    } catch {
      setMessage('Error submitting application.');
    }
  };

  return (
    <div style={cardStyle}>
      <h2 style={headingStyle}>Australia Job Visa Application</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Full Name</label>
        <input name="name" style={inputStyle} value={form.name} onChange={handleChange} required />
        <label style={labelStyle}>Email</label>
        <input name="email" style={inputStyle} value={form.email} onChange={handleChange} required />
        <label style={labelStyle}>Phone</label>
        <input name="phone" style={inputStyle} value={form.phone} onChange={handleChange} required />
        <label style={labelStyle}>Passport Number</label>
        <input name="passport" style={inputStyle} value={form.passport} onChange={handleChange} required />
        <label style={labelStyle}>Date of Birth</label>
        <input name="dob" type="date" style={inputStyle} value={form.dob} onChange={handleChange} required />
        <label style={labelStyle}>Education</label>
        <input name="education" style={inputStyle} value={form.education} onChange={handleChange} required />
        <label style={labelStyle}>Occupation</label>
        <input name="occupation" style={inputStyle} value={form.occupation} onChange={handleChange} required />
        <label style={labelStyle}>Years of Experience</label>
        <input name="experience" style={inputStyle} value={form.experience} onChange={handleChange} required />
        <label style={labelStyle}>Document 1</label>
        <input type="file" style={inputStyle} onChange={e => handleFileChange(0, e.target.files[0])} required />
        <label style={labelStyle}>Document 2</label>
        <input type="file" style={inputStyle} onChange={e => handleFileChange(1, e.target.files[0])} required />
        <label style={labelStyle}>Document 3</label>
        <input type="file" style={inputStyle} onChange={e => handleFileChange(2, e.target.files[0])} required />
        <button type="submit" style={buttonStyle}>Submit Application</button>
        <button type="button" style={buttonStyle} onClick={onClose}>Close</button>
      </form>
      <div style={{ color: 'green', marginTop: 10 }}>{message}</div>
      {userId && (
        <div style={{ background: '#f3f3f3', padding: 10, marginTop: 10, borderRadius: 6 }}>
          <strong>Your User ID:</strong> {userId}<br />
          <strong>Your Password:</strong> {userPassword}<br />
          <span style={{ color: 'blue' }}>Please save these credentials to check your application status.</span>
        </div>
      )}
    </div>
  );
}

export default App;

