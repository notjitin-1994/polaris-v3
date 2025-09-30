import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/services/supabase';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { toCapitalCase } from '@/lib/textUtils';
import { RichTextEditor } from '@/components/RichTextEditor';

type Appearance = 'system' | 'light' | 'dark';

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-white/95">{title}</h2>
        {description && <p className="mt-1 text-xs text-white/60">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-white/70">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-white/50">{hint}</span>}
    </label>
  );
}

export function SettingsContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [appearance, setAppearance] = useState<Appearance>('system');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [username, setUsername] = useState<string>('');
  const [legalName, setLegalName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [linkedin, setLinkedin] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [consentMarketing, setConsentMarketing] = useState<boolean>(false);
  const [consentResearch, setConsentResearch] = useState<boolean>(false);

  // Privacy/sharing preferences
  const [shareJobTitle, setShareJobTitle] = useState<boolean>(true);
  const [shareCompany, setShareCompany] = useState<boolean>(true);
  const [shareLocation, setShareLocation] = useState<boolean>(true);
  const [shareWebsite, setShareWebsite] = useState<boolean>(true);
  const [shareBio, setShareBio] = useState<boolean>(true);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<string>('');
  const [profileError, setProfileError] = useState<string>('');
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [usernameAvailable, setUsernameAvailable] = useState<
    'unknown' | 'available' | 'taken' | 'error'
  >('unknown');
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    getSupabase()
      .auth.getUser()
      .then(({ data: { user: current } }) => {
        if (!mounted) return;
        setUser(current ?? null);
        const meta: any = current?.user_metadata ?? {};
        setUsername(meta.username ?? meta.handle ?? '');
        setLegalName(meta.legal_name ?? '');
        setOrganization(meta.organization ?? '');
        setJobTitle(meta.job_title ?? '');
        setCountry(meta.country ?? '');
        setTimezone(meta.timezone ?? '');
        setPhone(meta.phone ?? '');
        setLanguage(meta.language ?? '');
        setWebsite(meta.website ?? '');
        setLinkedin(meta.linkedin ?? '');
        setBio(meta.bio ?? '');
        setConsentMarketing(Boolean(meta.consent_marketing));
        setConsentResearch(Boolean(meta.consent_research));

        // Load privacy preferences
        setShareJobTitle(meta.share_job_title !== false); // Default to true
        setShareCompany(meta.share_company !== false);
        setShareLocation(meta.share_location !== false);
        setShareWebsite(meta.share_website !== false);
        setShareBio(meta.share_bio !== false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function saveAppearance(next: Appearance) {
    setAppearance(next);
    try {
      localStorage.setItem('settings:appearance', next);
    } catch {}
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('settings:appearance') as Appearance | null;
      if (stored) setAppearance(stored);
    } catch {}
  }, []);

  // Handle click outside menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAvatarMenu(false);
      }
    }

    if (showAvatarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAvatarMenu]);

  function getAvatarUrl(u: User | null): string | null {
    const meta: any = u?.user_metadata ?? {};
    const identities: any[] = (u as any)?.identities ?? [];
    const identityData = identities.find((i) => i?.identity_data)?.identity_data ?? {};
    return (
      meta.avatar_url ||
      meta.avatarURL ||
      meta.avatar ||
      meta.picture ||
      identityData.avatar_url ||
      identityData.picture ||
      null
    );
  }

  async function onUploadAvatar(file: File) {
    if (!user) return;
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const bucket = 'public-assets';
      const path = `avatars/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await getSupabase()
        .storage.from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: pub } = getSupabase().storage.from(bucket).getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      const { error: updateError, data } = await getSupabase().auth.updateUser({
        data: { avatar_url: publicUrl, avatar_path: path },
      });
      if (updateError) throw updateError;
      setUser(data.user);
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert(`Failed to upload avatar: ${err?.message || 'Unknown error'}`);
    }
  }

  async function onRemoveAvatar() {
    if (!user) return;
    try {
      const meta: any = user.user_metadata || {};
      const path: string | undefined = meta.avatar_path;
      if (path) {
        await getSupabase().storage.from('public-assets').remove([path]);
      }
      const { error, data } = await getSupabase().auth.updateUser({
        data: { avatar_url: '', avatar_path: '' },
      });
      if (error) throw error;
      setUser(data.user);
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert(`Failed to remove avatar: ${err?.message || 'Unknown error'}`);
    }
  }

  function sanitizeUsername(input: string): string {
    return (input || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);
  }

  function isReservedUsername(input: string): boolean {
    const reserved = new Set([
      'settings',
      'portal',
      'admin',
      'api',
      'www',
      'mail',
      'support',
      'help',
    ]);
    return reserved.has(input);
  }

  async function checkUsernameAvailability(next: string) {
    const trimmed = sanitizeUsername(next);
    if (!trimmed) {
      setUsernameAvailable('unknown');
      return;
    }
    if (isReservedUsername(trimmed)) {
      setUsernameAvailable('taken');
      return;
    }
    if (trimmed === username.toLowerCase()) {
      // unchanged from current value
      setUsernameAvailable('available');
      return;
    }
    try {
      setCheckingUsername(true);
      // Try checking against profiles table if it exists
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmed)
        .maybeSingle();
      if (error) {
        // If the table doesn't exist or RLS blocks, fall back to unknown
        setUsernameAvailable('unknown');
        return;
      }
      const takenByOther = Boolean(data && data.id && data.id !== user?.id);
      setUsernameAvailable(takenByOther ? 'taken' : 'available');
    } catch {
      setUsernameAvailable('error');
    } finally {
      setCheckingUsername(false);
    }
  }

  function validatePhoneOptional(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed = parsePhoneNumberFromString(trimmed);
      if (parsed && parsed.isValid()) return null;
      return 'Invalid phone number';
    } catch {
      return 'Invalid phone number';
    }
  }

  async function onSaveProfile() {
    setProfileError('');
    setProfileMessage('');
    const phoneError = validatePhoneOptional(phone);
    if (phoneError) {
      setProfileError(phoneError);
      return;
    }

    const sanitizedUsername = sanitizeUsername(username);
    if (sanitizedUsername && usernameAvailable === 'taken') {
      setProfileError('This username is already taken.');
      return;
    }

    setProfileSaving(true);
    try {
      // First update profiles table if username is provided
      if (sanitizedUsername && user) {
        const supabase = getSupabase();
        const profileData = {
          id: user.id,
          username: sanitizedUsername,
          full_name: legalName || (user.user_metadata?.name as string) || '',
          job_title: jobTitle,
          company: organization,
          website,
          country,
          timezone,
          bio,
          share_job_title: shareJobTitle,
          share_company: shareCompany,
          share_location: shareLocation,
          share_website: shareWebsite,
          share_bio: shareBio,
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });
        if (profileError && (profileError as any).code === '23505') {
          setProfileError('This username is already taken.');
          return;
        }
      }

      // Update auth metadata
      const { error } = await getSupabase().auth.updateUser({
        data: {
          username: sanitizedUsername,
          legal_name: legalName,
          organization,
          job_title: jobTitle,
          country,
          timezone,
          phone,
          language,
          website,
          linkedin,
          bio,
          share_job_title: shareJobTitle,
          share_company: shareCompany,
          share_location: shareLocation,
          share_website: shareWebsite,
          share_bio: shareBio,
          consent_marketing: consentMarketing,
          consent_research: consentResearch,
        },
      });
      if (error) throw error;
      setProfileMessage('Saved');
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to save');
    } finally {
      setProfileSaving(false);
    }
  }

  async function onDisableAccount() {
    if (!user) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      'Disable your account? You will be signed out and access will be limited until re-enabled.'
    );
    if (!ok) return;
    try {
      const { error } = await getSupabase().auth.updateUser({
        data: { account_disabled: true, account_disabled_at: new Date().toISOString() },
      });
      if (error) throw error;
    } catch (err: any) {
      // eslint-disable-next-line no-alert
      alert(`Failed to disable account: ${err?.message || 'Unknown error'}`);
      return;
    }
    try {
      await getSupabase().auth.signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  async function onDeleteAccount() {
    if (!user) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      'Permanently delete your account and associated data? This cannot be undone.'
    );
    if (!ok) return;
    try {
      await getSupabase().auth.updateUser({
        data: { delete_requested: true, delete_requested_at: new Date().toISOString() },
      });
    } catch {}
    try {
      await getSupabase().functions.invoke('delete-user', { body: { userId: user.id } });
    } catch {}
    try {
      await getSupabase().auth.signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <SectionCard title="Avatar" description="Your profile picture.">
        <div className="flex items-center gap-6">
          {/* Interactive Avatar Container */}
          <div className="group relative">
            <div className="group-hover:ring-primary-400/50 h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-white/5 transition-all duration-200 group-hover:ring-2">
              {getAvatarUrl(user) ? (
                <img
                  src={getAvatarUrl(user) as string}
                  alt="User avatar"
                  className="h-full w-full object-cover transition-all duration-200 group-hover:brightness-75"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="from-primary-400/20 to-secondary-400/20 flex h-full w-full items-center justify-center bg-gradient-to-br transition-all duration-200 group-hover:brightness-110">
                  <span className="text-lg font-semibold text-white/80">
                    {(user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Hover Overlay for Photo Viewing */}
              {getAvatarUrl(user) && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              )}

              {/* Click to view photo */}
              {getAvatarUrl(user) && (
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="focus:ring-primary-400 absolute inset-0 h-full w-full rounded-full focus:ring-2 focus:outline-none"
                  aria-label="View avatar"
                />
              )}
            </div>

            {/* Floating Action Button */}
            <div className="absolute -right-1 -bottom-1">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Menu button clicked, current state:', showAvatarMenu);
                    setShowAvatarMenu(!showAvatarMenu);
                  }}
                  className="bg-secondary-500 hover:bg-secondary-600 flex h-7 w-7 transform items-center justify-center rounded-full border-2 border-[rgb(var(--bg))] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  title="Photo options"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>

                {/* Avatar Menu */}
                {showAvatarMenu && (
                  <div className="absolute right-0 bottom-8 z-[9999] min-w-[140px] rounded-lg border border-white/10 bg-[rgb(var(--bg))] p-1 shadow-xl backdrop-blur-xl">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Change photo button clicked');
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Change photo onClick triggered');
                        setShowAvatarMenu(false);

                        // Trigger file input
                        if (fileInputRef.current) {
                          console.log('Triggering file input');
                          fileInputRef.current.click();
                        } else {
                          console.log('File input ref not found');
                        }
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {getAvatarUrl(user) ? 'Change Photo' : 'Upload Photo'}
                    </button>

                    {getAvatarUrl(user) && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Remove photo button clicked');
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Remove photo onClick triggered');
                          setShowAvatarMenu(false);

                          // Call remove function
                          console.log('Calling onRemoveAvatar');
                          onRemoveAvatar();
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text Instructions */}
          <div className="flex-1 text-sm text-white/70">
            {getAvatarUrl(user) ? (
              <p className="mb-2">Click on your photo to view it</p>
            ) : (
              <p className="mb-2">Use the + button to add a photo</p>
            )}
            <p className="text-xs text-white/50">
              Recommended: Square image, at least 200×200 pixels
            </p>
            <p className="mt-1 text-xs text-white/40">
              Use the <span className="text-secondary-400">+</span> button for photo options
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadAvatar(file);
              e.currentTarget.value = '';
            }}
          />
        </div>
      </SectionCard>

      <SectionCard title="Profile" description="Your basic account information.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="Your name"
              defaultValue={toCapitalCase(
                (user?.user_metadata?.name as string) ||
                  (user?.user_metadata?.full_name as string) ||
                  ''
              )}
              readOnly
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="you@example.com"
              defaultValue={user?.email ?? ''}
              readOnly
            />
          </Field>
          <Field
            label="Username (optional)"
            hint="Public and unique. Only letters, numbers, and underscores."
          >
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white/60 select-none">
                @
              </span>
              <input
                type="text"
                className="focus:ring-primary-400 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
                placeholder="username"
                value={username}
                onChange={(e) => {
                  const v = sanitizeUsername(e.target.value);
                  setUsername(v);
                  if (v) checkUsernameAvailability(v);
                  else setUsernameAvailable('unknown');
                }}
              />
              <span className="min-w-[80px] text-center text-xs">
                {checkingUsername ? (
                  'Checking...'
                ) : username ? (
                  usernameAvailable === 'available' ? (
                    <span className="text-green-400">Available</span>
                  ) : usernameAvailable === 'taken' ? (
                    <span className="text-red-400">Taken</span>
                  ) : usernameAvailable === 'error' ? (
                    <span className="text-yellow-400">Error</span>
                  ) : null
                ) : null}
              </span>
            </div>
          </Field>
          <Field
            label="Full legal name (optional)"
            hint="Used for invoicing/compliance; not public."
          >
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="Your legal name"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </Field>
          <Field label="Organization (optional)">
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="Company / School"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </Field>
          <Field label="Job title (optional)">
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="Role"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </Field>
          <Field label="Country / Region (optional)">
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Field>
          <Field label="Timezone (optional)">
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="e.g., America/Los_Angeles"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </Field>
          <Field label="Phone (optional)" hint="Stored for support/security; not public.">
            <input
              type="tel"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="+1 415 555 2671"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="Preferred language (optional)">
            <input
              type="text"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="e.g., en-US"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </Field>
          <Field label="Website (optional)">
            <input
              type="url"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Field>
          <Field label="LinkedIn (optional)">
            <input
              type="url"
              className="focus:ring-primary-400 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none focus:ring-2"
              placeholder="https://linkedin.com/in/yourname"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Professional Bio (optional)"
              hint="Tell others about yourself with rich formatting. Support for bold, italic, lists, and links."
            >
              <RichTextEditor
                value={bio}
                onChange={setBio}
                placeholder="Write a professional bio about yourself. You can use formatting options to highlight your experience, skills, and achievements..."
                maxWords={300}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/5"
              />
              Receive product updates and marketing (optional)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={consentResearch}
                onChange={(e) => setConsentResearch(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/5"
              />
              Participate in research (optional)
            </label>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={profileSaving}
            className="btn-ghost px-4 py-2 text-sm text-white/90 disabled:opacity-60"
          >
            {profileSaving ? 'Saving…' : 'Save changes'}
          </button>
          {profileMessage && <span className="text-primary-500 text-xs">{profileMessage}</span>}
          {profileError && <span className="text-xs text-red-400">{profileError}</span>}
        </div>
      </SectionCard>

      <SectionCard
        title="Public Profile Privacy"
        description="Control what information is visible on your public profile."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div>
                <div className="text-sm font-medium text-white/90">Job Title</div>
                <div className="text-xs text-white/60">Show your professional role</div>
              </div>
              <input
                type="checkbox"
                checked={shareJobTitle}
                onChange={(e) => setShareJobTitle(e.target.checked)}
                className="text-primary-400 focus:ring-primary-400 h-4 w-4 rounded border-white/10 bg-white/5"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div>
                <div className="text-sm font-medium text-white/90">Company</div>
                <div className="text-xs text-white/60">Show your organization</div>
              </div>
              <input
                type="checkbox"
                checked={shareCompany}
                onChange={(e) => setShareCompany(e.target.checked)}
                className="text-primary-400 focus:ring-primary-400 h-4 w-4 rounded border-white/10 bg-white/5"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div>
                <div className="text-sm font-medium text-white/90">Location</div>
                <div className="text-xs text-white/60">Show your city and country</div>
              </div>
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
                className="text-primary-400 focus:ring-primary-400 h-4 w-4 rounded border-white/10 bg-white/5"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
              <div>
                <div className="text-sm font-medium text-white/90">Website</div>
                <div className="text-xs text-white/60">Show your personal website</div>
              </div>
              <input
                type="checkbox"
                checked={shareWebsite}
                onChange={(e) => setShareWebsite(e.target.checked)}
                className="text-primary-400 focus:ring-primary-400 h-4 w-4 rounded border-white/10 bg-white/5"
              />
            </label>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
            <div>
              <div className="text-sm font-medium text-white/90">Professional Bio</div>
              <div className="text-xs text-white/60">Show your bio and achievements</div>
            </div>
            <input
              type="checkbox"
              checked={shareBio}
              onChange={(e) => setShareBio(e.target.checked)}
              className="text-primary-400 focus:ring-primary-400 h-4 w-4 rounded border-white/10 bg-white/5"
            />
          </label>

          <div className="bg-primary-400/10 border-primary-400/20 mt-4 rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <svg
                className="text-primary-400 mt-0.5 h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-primary-300 text-xs font-medium">Privacy Notice</p>
                <p className="mt-1 text-xs text-white/70">
                  Your name and avatar are always visible on your public profile. These settings
                  control additional information visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Appearance" description="Choose how Smartslate looks to you.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(['system', 'light', 'dark'] as Appearance[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => saveAppearance(mode)}
              className={`relative rounded-xl border ${appearance === mode ? 'border-primary-400/40 bg-primary-400/5' : 'border-white/10 bg-white/5'} pressable p-3 text-left transition`}
              aria-pressed={appearance === mode}
            >
              <div className="text-sm font-medium text-white/90 capitalize">{mode}</div>
              <div className="mt-1 text-[11px] text-white/60">
                {mode === 'system'
                  ? 'Match your system setting'
                  : mode === 'light'
                    ? 'Bright theme'
                    : 'Dim theme'}
              </div>
              {appearance === mode && (
                <span className="bg-primary-400/80 absolute top-2 right-2 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full">
                  <span className="sr-only">Selected</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="General" description="Common preferences and defaults.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/90">Enable shortcuts</div>
              <div className="text-xs text-white/60">Use keyboard shortcuts where available</div>
            </div>
            <input
              type="checkbox"
              className="text-primary-400 h-5 w-5 rounded-md border-white/10 bg-white/5"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/90">Show advanced options</div>
              <div className="text-xs text-white/60">Reveal experimental controls</div>
            </div>
            <input
              type="checkbox"
              className="text-primary-400 h-5 w-5 rounded-md border-white/10 bg-white/5"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Account" description="Manage account status and data.">
        <div className="space-y-3">
          <button
            type="button"
            onClick={onDisableAccount}
            className="btn-ghost w-full px-4 py-2 text-sm text-white/90 hover:text-white sm:w-auto"
          >
            Disable account
          </button>
          <div className="text-[11px] text-white/60">
            You can re-enable later by contacting support or signing in if allowed.
          </div>
          <div className="my-2 h-px bg-white/10" />
          <button
            type="button"
            onClick={onDeleteAccount}
            className="btn-ghost w-full px-4 py-2 text-sm text-red-300 hover:text-red-200 sm:w-auto"
          >
            Delete account permanently
          </button>
          <div className="text-[11px] text-white/60">
            This will sign you out and request permanent deletion of your data.
          </div>
        </div>
      </SectionCard>

      {/* Avatar Modal */}
      {showAvatarModal && getAvatarUrl(user) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-h-[80vh] max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative rounded-2xl border border-white/10 bg-[rgb(var(--bg))] p-6 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center">
                <h3 className="mb-4 text-lg font-semibold text-white/95">Profile Photo</h3>
                <div className="mx-auto h-64 w-64 overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={getAvatarUrl(user) as string}
                    alt="Profile photo"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-6 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAvatarModal(false);
                    }}
                    className="bg-secondary-500 hover:bg-secondary-600 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRemoveAvatar();
                      setShowAvatarModal(false);
                    }}
                    className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
