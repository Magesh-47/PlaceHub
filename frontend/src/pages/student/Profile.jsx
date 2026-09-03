import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import PageHeader from '../../components/PageHeader';
import { toast } from 'react-toastify';
import { FiEdit2, FiCheck, FiX, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaUser, FaGithub, FaLinkedin, FaGlobe, FaLink } from 'react-icons/fa';
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

const EMPTY_EDUCATION = { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', gradeOrScore: '' };

const EducationSection = ({ education, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(education.length ? education.map((e) => ({ ...e })) : [{ ...EMPTY_EDUCATION }]);
    setEditing(true);
  };

  const updateEntry = (index, field, value) => {
    setDraft((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (index) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addEntry = () => setDraft((prev) => [...prev, { ...EMPTY_EDUCATION }]);

  const handleSave = async () => {
    setSaving(true);
    const cleaned = draft.filter((e) => e.institution.trim() || e.degree.trim());
    const ok = await onSave(cleaned);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Education</p>
        {editing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              <FiCheck size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
              <FiX size={13} /> Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={startEditing}>
            <FiEdit2 size={13} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {draft.map((entry, i) => (
            <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative' }}>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="icon-btn danger"
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                title="Remove entry"
              >
                <FiTrash2 size={14} />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem', paddingRight: '2.5rem' }}>
                <Field label="Institution">
                  <input className="form-control" value={entry.institution} onChange={(e) => updateEntry(i, 'institution', e.target.value)} />
                </Field>
                <Field label="Degree">
                  <input className="form-control" value={entry.degree} onChange={(e) => updateEntry(i, 'degree', e.target.value)} placeholder="e.g. B.Tech, 12th Grade" />
                </Field>
                <Field label="Field of Study">
                  <input className="form-control" value={entry.fieldOfStudy || ''} onChange={(e) => updateEntry(i, 'fieldOfStudy', e.target.value)} placeholder="e.g. Computer Science" />
                </Field>
                <Field label="Grade / Score">
                  <input className="form-control" value={entry.gradeOrScore || ''} onChange={(e) => updateEntry(i, 'gradeOrScore', e.target.value)} placeholder="e.g. 8.5 CGPA, 92%" />
                </Field>
                <Field label="Start Year">
                  <input type="number" className="form-control" value={entry.startYear || ''} onChange={(e) => updateEntry(i, 'startYear', e.target.value)} placeholder="2019" />
                </Field>
                <Field label="End Year">
                  <input type="number" className="form-control" value={entry.endYear || ''} onChange={(e) => updateEntry(i, 'endYear', e.target.value)} placeholder="Leave blank if ongoing" />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addEntry} style={{ alignSelf: 'flex-start' }}>
            <FiPlus size={13} /> Add Education
          </button>
        </div>
      ) : education.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No education added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {education.map((entry, i) => (
            <div
              key={entry.id ?? i}
              style={{ paddingBottom: '0.875rem', borderBottom: i < education.length - 1 ? '1px solid var(--border-color)' : 'none' }}
            >
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {entry.degree}{entry.fieldOfStudy ? ` in ${entry.fieldOfStudy}` : ''}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{entry.institution}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {entry.startYear || '—'} – {entry.endYear || 'Present'}
                {entry.gradeOrScore ? ` · ${entry.gradeOrScore}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EMPTY_EXPERIENCE = { companyName: '', role: '', startDate: '', endDate: '', description: '' };

const formatMonthYear = (iso) => {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const ExperienceSection = ({ experience, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(experience.length ? experience.map((e) => ({ ...e })) : [{ ...EMPTY_EXPERIENCE }]);
    setEditing(true);
  };

  const updateEntry = (index, field, value) => {
    setDraft((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (index) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addEntry = () => setDraft((prev) => [...prev, { ...EMPTY_EXPERIENCE }]);

  const handleSave = async () => {
    setSaving(true);
    const cleaned = draft.filter((e) => e.companyName.trim() || e.role.trim());
    const ok = await onSave(cleaned);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Experience</p>
        {editing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              <FiCheck size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
              <FiX size={13} /> Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={startEditing}>
            <FiEdit2 size={13} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {draft.map((entry, i) => (
            <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative' }}>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="icon-btn danger"
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                title="Remove entry"
              >
                <FiTrash2 size={14} />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem', paddingRight: '2.5rem' }}>
                <Field label="Company">
                  <input className="form-control" value={entry.companyName} onChange={(e) => updateEntry(i, 'companyName', e.target.value)} />
                </Field>
                <Field label="Role">
                  <input className="form-control" value={entry.role} onChange={(e) => updateEntry(i, 'role', e.target.value)} placeholder="e.g. Software Engineering Intern" />
                </Field>
                <Field label="Start Date">
                  <input type="date" className="form-control" value={entry.startDate || ''} onChange={(e) => updateEntry(i, 'startDate', e.target.value)} />
                </Field>
                <Field label="End Date">
                  <input type="date" className="form-control" value={entry.endDate || ''} onChange={(e) => updateEntry(i, 'endDate', e.target.value)} placeholder="Leave blank if current" />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Description">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={entry.description || ''}
                      onChange={(e) => updateEntry(i, 'description', e.target.value)}
                      placeholder="What did you work on?"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addEntry} style={{ alignSelf: 'flex-start' }}>
            <FiPlus size={13} /> Add Experience
          </button>
        </div>
      ) : experience.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No experience added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {experience.map((entry, i) => (
            <div
              key={entry.id ?? i}
              style={{ paddingBottom: '0.875rem', borderBottom: i < experience.length - 1 ? '1px solid var(--border-color)' : 'none' }}
            >
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{entry.role}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{entry.companyName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatMonthYear(entry.startDate) || '—'} – {formatMonthYear(entry.endDate) || 'Present'}
              </p>
              {entry.description && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '0.375rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                  {entry.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SkillsSection = ({ skills, onSave }) => {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft([...skills]);
    setInput('');
    setEditing(true);
  };

  const addSkill = () => {
    const value = input.trim();
    if (value && !draft.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setDraft((prev) => [...prev, value]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill) => setDraft((prev) => prev.filter((s) => s !== skill));

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(input.trim() ? [...draft, input.trim()] : draft);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Skills</p>
        {editing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              <FiCheck size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
              <FiX size={13} /> Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={startEditing}>
            <FiEdit2 size={13} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: draft.length ? '0.875rem' : 0 }}>
            {draft.map((skill) => (
              <span key={skill} className="badge" style={badgeColorFor(skill, theme)}>
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  style={{ background: 'none', border: 'none', padding: 0, marginLeft: '0.25rem', cursor: 'pointer', display: 'inline-flex', color: 'inherit' }}
                  title={`Remove ${skill}`}
                >
                  <FiX size={11} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter…"
            />
            <button type="button" className="btn btn-outline btn-sm" onClick={addSkill}>
              <FiPlus size={13} /> Add
            </button>
          </div>
        </div>
      ) : skills.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No skills added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.map((skill) => (
            <span key={skill} className="badge" style={badgeColorFor(skill, theme)}>{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const EMPTY_CERTIFICATION = { name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialUrl: '' };

const CertificationSection = ({ certifications, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(certifications.length ? certifications.map((c) => ({ ...c })) : [{ ...EMPTY_CERTIFICATION }]);
    setEditing(true);
  };

  const updateEntry = (index, field, value) => {
    setDraft((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const removeEntry = (index) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addEntry = () => setDraft((prev) => [...prev, { ...EMPTY_CERTIFICATION }]);

  const handleSave = async () => {
    setSaving(true);
    const cleaned = draft.filter((c) => c.name.trim() || c.issuingOrganization.trim());
    const ok = await onSave(cleaned);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Certifications</p>
        {editing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              <FiCheck size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
              <FiX size={13} /> Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={startEditing}>
            <FiEdit2 size={13} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {draft.map((entry, i) => (
            <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative' }}>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="icon-btn danger"
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                title="Remove entry"
              >
                <FiTrash2 size={14} />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem', paddingRight: '2.5rem' }}>
                <Field label="Certification Name">
                  <input className="form-control" value={entry.name} onChange={(e) => updateEntry(i, 'name', e.target.value)} placeholder="e.g. AWS Certified Developer" />
                </Field>
                <Field label="Issuing Organization">
                  <input className="form-control" value={entry.issuingOrganization} onChange={(e) => updateEntry(i, 'issuingOrganization', e.target.value)} placeholder="e.g. Amazon Web Services" />
                </Field>
                <Field label="Issue Date">
                  <input type="date" className="form-control" value={entry.issueDate || ''} onChange={(e) => updateEntry(i, 'issueDate', e.target.value)} />
                </Field>
                <Field label="Expiry Date">
                  <input type="date" className="form-control" value={entry.expiryDate || ''} onChange={(e) => updateEntry(i, 'expiryDate', e.target.value)} placeholder="Leave blank if it doesn't expire" />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Credential URL">
                    <input type="url" className="form-control" value={entry.credentialUrl || ''} onChange={(e) => updateEntry(i, 'credentialUrl', e.target.value)} placeholder="https://…" />
                  </Field>
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addEntry} style={{ alignSelf: 'flex-start' }}>
            <FiPlus size={13} /> Add Certification
          </button>
        </div>
      ) : certifications.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No certifications added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {certifications.map((entry, i) => (
            <div
              key={entry.id ?? i}
              style={{ paddingBottom: '0.875rem', borderBottom: i < certifications.length - 1 ? '1px solid var(--border-color)' : 'none' }}
            >
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {entry.credentialUrl
                  ? <a href={entry.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>{entry.name}</a>
                  : entry.name}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{entry.issuingOrganization}</p>
              {(entry.issueDate || entry.expiryDate) && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {entry.issueDate ? `Issued ${formatMonthYear(entry.issueDate)}` : ''}
                  {entry.expiryDate ? ` · Expires ${formatMonthYear(entry.expiryDate)}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LINK_SUGGESTIONS = ['Portfolio', 'GitHub', 'LinkedIn'];
const EMPTY_LINK = { label: '', url: '' };

const linkIconFor = (label) => {
  const key = (label || '').toLowerCase();
  if (key.includes('github')) return <FaGithub size={13} />;
  if (key.includes('linkedin')) return <FaLinkedin size={13} />;
  if (key.includes('portfolio') || key.includes('website')) return <FaGlobe size={13} />;
  return <FaLink size={13} />;
};

const LinksSection = ({ links, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(links.length ? links.map((l) => ({ ...l })) : [{ ...EMPTY_LINK }]);
    setEditing(true);
  };

  const updateEntry = (index, field, value) => {
    setDraft((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const removeEntry = (index) => setDraft((prev) => prev.filter((_, i) => i !== index));
  const addEntry = () => setDraft((prev) => [...prev, { ...EMPTY_LINK }]);

  const handleSave = async () => {
    setSaving(true);
    const cleaned = draft.filter((l) => l.label.trim() && l.url.trim());
    const ok = await onSave(cleaned);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div className="card" style={{ marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Links</p>
        {editing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
              <FiCheck size={13} /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>
              <FiX size={13} /> Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={startEditing}>
            <FiEdit2 size={13} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <datalist id="link-label-suggestions">
            {LINK_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
          {draft.map((entry, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <input
                className="form-control"
                style={{ maxWidth: '10rem' }}
                list="link-label-suggestions"
                value={entry.label}
                onChange={(e) => updateEntry(i, 'label', e.target.value)}
                placeholder="Label"
              />
              <input
                type="url"
                className="form-control"
                value={entry.url}
                onChange={(e) => updateEntry(i, 'url', e.target.value)}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="icon-btn danger"
                title="Remove link"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addEntry} style={{ alignSelf: 'flex-start' }}>
            <FiPlus size={13} /> Add Link
          </button>
        </div>
      ) : links.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No links added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
          {links.map((entry, i) => (
            <a
              key={entry.id ?? i}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ textDecoration: 'none' }}
            >
              {linkIconFor(entry.label)} {entry.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const StudentProfile = () => {
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [details, setDetails] = useState({ summary: '' });
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
    Promise.all([api.get('/student/profile'), api.get('/student/profile/details')])
      .then(([profileRes, detailsRes]) => {
        setProfile(profileRes.data);
        setDetails(detailsRes.data);
        setFormData({ ...profileRes.data, summary: detailsRes.data.summary || '' });
        if (profileRes.data.hasProfilePicture) loadAvatar(profileRes.data.userId);
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
      const [profileRes, detailsRes] = await Promise.all([
        api.put('/student/profile', formData),
        api.put('/student/profile/summary', { summary: formData.summary }),
      ]);
      setProfile(profileRes.data);
      setDetails(detailsRes.data);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch {
      toast.error('Update failed. Please try again.');
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setFormData({ ...profile, summary: details.summary || '' });
    setPreview(null);
    setEditMode(false);
  };

  const handleSaveEducation = async (entries) => {
    try {
      const payload = entries.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy || null,
        startYear: e.startYear ? parseInt(e.startYear, 10) : null,
        endYear: e.endYear ? parseInt(e.endYear, 10) : null,
        gradeOrScore: e.gradeOrScore || null,
      }));
      const res = await api.put('/student/profile/education', { education: payload });
      setDetails(res.data);
      toast.success('Education updated');
      return true;
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Unknown error';
      toast.error('Failed to update education: ' + msg);
      return false;
    }
  };

  const handleSaveExperience = async (entries) => {
    try {
      const payload = entries.map((e) => ({
        companyName: e.companyName,
        role: e.role,
        startDate: e.startDate || null,
        endDate: e.endDate || null,
        description: e.description || null,
      }));
      const res = await api.put('/student/profile/experience', { experience: payload });
      setDetails(res.data);
      toast.success('Experience updated');
      return true;
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Unknown error';
      toast.error('Failed to update experience: ' + msg);
      return false;
    }
  };

  const handleSaveSkills = async (skills) => {
    try {
      const res = await api.put('/student/profile/skills', { skills });
      setDetails(res.data);
      toast.success('Skills updated');
      return true;
    } catch (err) {
      toast.error('Failed to update skills: ' + (err.response?.data?.message || err.message));
      return false;
    }
  };

  const handleSaveCertifications = async (entries) => {
    try {
      const payload = entries.map((c) => ({
        name: c.name,
        issuingOrganization: c.issuingOrganization,
        issueDate: c.issueDate || null,
        expiryDate: c.expiryDate || null,
        credentialUrl: c.credentialUrl || null,
      }));
      const res = await api.put('/student/profile/certifications', { certifications: payload });
      setDetails(res.data);
      toast.success('Certifications updated');
      return true;
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Unknown error';
      toast.error('Failed to update certifications: ' + msg);
      return false;
    }
  };

  const handleSaveLinks = async (entries) => {
    try {
      const payload = entries.map((l) => ({ label: l.label, url: l.url }));
      const res = await api.put('/student/profile/links', { links: payload });
      setDetails(res.data);
      toast.success('Links updated');
      return true;
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Unknown error';
      toast.error('Failed to update links: ' + msg);
      return false;
    }
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'stretch' }}>
        {/* Avatar card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              width: 160, height: 160,
              borderRadius: '50%',
              background: (preview || avatarUrl) ? 'transparent' : avatarGradientFor(profile.username || profile.fullName),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              overflow: 'hidden',
              fontSize: '3rem', fontWeight: 800, color: '#fff',
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

      {/* Professional Summary */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          Professional Summary
        </p>

        {editMode ? (
          <textarea
            className="form-control"
            rows={4}
            maxLength={2000}
            placeholder="A short summary of your background, interests, and what you're looking for…"
            value={formData.summary || ''}
            onChange={ch('summary')}
          />
        ) : details.summary ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {details.summary}
          </p>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            No summary added yet. Click "Edit Profile" to introduce yourself to recruiters.
          </p>
        )}
      </div>

      <EducationSection education={details.education || []} onSave={handleSaveEducation} />

      <ExperienceSection experience={details.experience || []} onSave={handleSaveExperience} />

      <SkillsSection skills={details.skills || []} onSave={handleSaveSkills} />

      <CertificationSection certifications={details.certifications || []} onSave={handleSaveCertifications} />

      <LinksSection links={details.links || []} onSave={handleSaveLinks} />
    </div>
  );
};

export default StudentProfile;
