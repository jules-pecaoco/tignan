import React, { useState, useEffect } from 'react';
import { signUpRescuer } from '../lib/auth.ts';
import type { OrgType } from '../lib/auth.ts';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight, Shield, LogIn, Building2, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: 'government', label: 'Government DRRMO' },
  { value: 'ngo', label: 'NGO / Red Cross' },
  { value: 'volunteer', label: 'Volunteer Brigade' },
  { value: 'private', label: 'Private Service' },
];

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrgType>('government');
  const [idNumber, setIdNumber] = useState('');
  const [callsign, setCallsign] = useState('');
  const [idImage, setIdImage] = useState<File | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => setGpsError(true)
      );
    } else {
      setGpsError(true);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!idImage) {
      setError('Accreditation document is required.');
      return;
    }
    if (!coords) {
      setError('GPS location is required.');
      return;
    }
    if (!orgName.trim()) {
      setError('Organization name is required.');
      return;
    }

    setLoading(true);
    const result = await signUpRescuer({
      email,
      password,
      full_name: fullName,
      phone,
      address,
      org_name: orgName,
      org_type: orgType,
      id_number: idNumber,
      callsign,
      gps_lat: coords.lat,
      gps_lng: coords.lng,
      id_image: idImage!,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/pending');
    }
  };

  return (
    <div className="auth-split">
      {/* ── Left Hero Panel ── */}
      <div className="auth-hero">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={28} className="text-accent" />
            <span className="font-mono text-xl tracking-[0.25em] font-black text-primary uppercase">
              TIGNAN
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            SOS Response Network
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-black text-primary leading-tight tracking-tight mb-4">
              Register Your
              <br />
              <span className="text-accent">Organization</span>
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-[320px]">
              Join the Tignan SOS network as a registered rescue organization.
              Once verified by an administrator, your team will receive real-time
              emergency alerts and dispatch coordination.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-mono text-accent text-xs font-bold">01</span>
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Submit Application</p>
                <p className="text-[11px] text-muted mt-0.5">Fill in your organization details and upload accreditation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-mono text-muted text-xs font-bold">02</span>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Admin Verification</p>
                <p className="text-[11px] text-muted/60 mt-0.5">Your documents will be reviewed and verified</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-mono text-muted text-xs font-bold">03</span>
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Go Operational</p>
                <p className="text-[11px] text-muted/60 mt-0.5">Access the operations dashboard and respond to alerts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[11px] text-muted font-mono font-bold uppercase tracking-widest no-underline hover:text-primary transition-colors"
          >
            <LogIn size={14} />
            Already registered? Sign in
          </Link>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <form onSubmit={handleRegister} className="max-w-[640px] w-full mx-auto space-y-6">
          {/* ── Organization Information ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-accent" />
              <h2 className="section-label mb-0">Organization Information</h2>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="input-field"
              />
              <div className="form-grid">
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value as OrgType)}
                  required
                  className="select-field"
                >
                  {ORG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Callsign (e.g. UNIT-01)"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* ── Contact Person ── */}
          <div>
            <h2 className="section-label">Contact Person</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input-field"
              />
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Office Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* ── Account Credentials ── */}
          <div>
            <h2 className="section-label">Account Credentials</h2>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
              <div className="form-grid">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* ── Verification ── */}
          <div>
            <h2 className="section-label">Verification</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Accreditation / Registration Number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
                className="input-field"
              />

              {/* File Upload */}
              <div className="bg-card border border-border rounded-lg p-4 transition-colors hover:border-accent/40">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                    {idImage ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : (
                      <Upload size={18} className="text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">
                      {idImage ? idImage.name : 'Accreditation Document'}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 truncate">
                      {idImage
                        ? `${(idImage.size / 1024).toFixed(1)} KB — Click to replace`
                        : 'Upload proof of accreditation (image)'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdImage(e.target.files?.[0] || null)}
                    required
                    className="hidden"
                  />
                </label>
              </div>

              {/* GPS Status */}
              <div
                className={`p-3.5 rounded-lg border flex items-center gap-3 transition-all ${
                  coords
                    ? 'bg-success/10 border-success/30'
                    : gpsError
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-card border-border'
                }`}
              >
                <div className="relative">
                  <MapPin size={18} className={coords ? 'text-success' : gpsError ? 'text-accent' : 'text-muted'} />
                  {!coords && !gpsError && (
                    <span className="absolute inset-0 rounded-full bg-muted/30 animate-pulse-ring" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[11px] text-primary font-bold uppercase tracking-wider">
                    {coords ? 'GPS Acquired' : gpsError ? 'GPS Denied' : 'Acquiring Location...'}
                  </p>
                  {coords && (
                    <p className="font-mono text-[9px] text-muted mt-0.5">
                      {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                {coords && <CheckCircle2 size={16} className="text-success" />}
                {gpsError && <AlertTriangle size={16} className="text-accent" />}
              </div>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <button
            type="submit"
            disabled={loading || !coords}
            className={`w-full p-4 rounded-lg font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer ${
              loading || !coords
                ? 'bg-muted/20 text-muted cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                SUBMIT APPLICATION
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* ── Error Message ── */}
          {error && (
            <div className="flex items-start gap-3 bg-accent/10 text-accent p-4 rounded-lg text-[13px] border border-accent/20">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
