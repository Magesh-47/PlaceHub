import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import { toast } from 'react-toastify';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { FaUser } from 'react-icons/fa';
import { avatarGradientFor, badgeColorFor } from '../../utils/colors';
import { useTheme } from '../../context/ThemeContext';

const Field = ({ label, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
  </div>
);

const ReadOnly = ({ value }) => (
  <div
    className="form-control"
    style={{ background: 'var(--bg-body)', color: 'var(--text-main)', cursor: 'default' }}
  >
    {value || <span style={{ color: 'var(--text-muted)' }}>—</span>}
  </div>
);

const StudentProfile = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const loadAvatar = async (userId) => {
    try {
      const res = await api.get(`/files/profile-picture/${userId}`, { responseType: 'blob' });
      setAvatarUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return window.URL.createObjectURL(res.data);
      });
    } catch {
      setAvatarUrl(null);
    }
  };

  useEffect(() => {
    api.get('/student/profile')
      .then((r) => {
        setProfile(r.data);
        setFormData(r.data);
        if (r.data.hasProfilePicture) loadAvatar(r.data.userId);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Fetching profile…" />;
  if (!profile) return <p style={{ color: 'var(--text-muted)' }}>Profile not found.</p>;

  const ch = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const r = new FileReader();
    r.onloadend = () => setPreview(r.result);
    r.readAsDataURL(file);

    setUploadingPicture(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/student/profile/picture', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      await loadAvatar(res.data.userId);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setPreview(null);
      setUploadingPicture(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/student/profile', formData);
      setProfile(res.data);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch {
      toast.error('Update failed. Please try again.');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setPreview(null);
    setEditMode(false);
  };

  const initials = profile.fullName
    ? profile.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.username?.[0]?.toUpperCase();

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your academic and personal information"
        actions={
          editMode ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                <FiCheck size={13} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={handleCancel}>
                <FiX size={13} /> Cancel
              </button>
            </div>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}>
              <FiEdit2 size={13} /> Edit Profile
            </button>
          )
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Avatar card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div
            style={{
              width: 88, height: 88,
              borderRadius: '50%',
              background: (preview || avatarUrl) ? 'transparent' : avatarGradientFor(profile.username || profile.fullName),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              overflow: 'hidden',
              fontSize: '1.75rem', fontWeight: 800, color: '#fff',
              flexShrink: 0,
            }}
          >
            {preview || avatarUrl
              ? <img src={preview || avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>

          <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{profile.fullName}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>@{profile.username}</p>
          {profile.department ? (
            <span className="badge" style={badgeColorFor(profile.department, theme)}>{profile.department}</span>
          ) : (
            <span className="badge badge-neutral">Student</span>
          )}

          {editMode && (
            <div style={{ marginTop: '1.25rem' }}>
              <label className="form-label" style={{ textAlign: 'left' }}>Profile Picture</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                disabled={uploadingPicture}
              />
              {uploadingPicture && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Uploading…</p>
              )}
            </div>
          )}
        </div>

        {/* Details card */}
        <div className="card">
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            Personal Details
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Field label="Full Name">
              {editMode
                ? <input className="form-control" value={formData.fullName} onChange={ch('fullName')} />
                : <ReadOnly value={profile.fullName} />}
            </Field>

            <Field label="Username">
              <ReadOnly value={profile.username} />
            </Field>

            <Field label="Email">
              {editMode
                ? <input type="email" className="form-control" value={formData.email} onChange={ch('email')} />
                : <ReadOnly value={profile.email} />}
            </Field>

            <Field label="Phone">
              {editMode
                ? <input type="tel" className="form-control" value={formData.phone} onChange={ch('phone')} />
                : <ReadOnly value={profile.phone} />}
            </Field>

            <Field label="Department">
              {editMode
                ? <input className="form-control" value={formData.department} onChange={ch('department')} />
                : <ReadOnly value={profile.department} />}
            </Field>

            <Field label="Year of Study">
              {editMode
                ? <input type="number" className="form-control" value={formData.year} min="1" max="4" onChange={ch('year')} />
                : <ReadOnly value={profile.year ? `Year ${profile.year}` : null} />}
            </Field>

            <Field label="CGPA">
              {editMode
                ? <input type="number" step="0.01" className="form-control" value={formData.cgpa} min="0" max="10" onChange={ch('cgpa')} />
                : (
                  <div className="form-control" style={{ background: 'var(--bg-body)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: profile.cgpa >= 7 ? 'var(--success)' : profile.cgpa >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                      {profile.cgpa}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>/ 10.0</span>
                  </div>
                )}
            </Field>

            <Field label="Date of Birth">
              {editMode
                ? <input type="date" className="form-control" value={formData.dateOfBirth || ''} onChange={ch('dateOfBirth')} />
                : <ReadOnly value={profile.dateOfBirth} />}
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
