import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useLocation, useNavigate, useParams, useOutlet } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/services/supabase';
import { redirectTo, getBaseUrl } from '@/utils/domainUtils';
import HeaderSwirlBackground from '@/components/HeaderSwirlBackground';

import { paths, portalUserPath, publicProfilePath } from '@/routes/paths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getCapitalizedFirstName } from '@/lib/textUtils';
// import type { PolarisSummary } from '@/services/polarisSummaryService'

type NavItem =
  | string
  | {
      label: string;
      href?: string;
      tagText?: string;
      tagTone?: 'success' | 'preview' | 'soon' | 'info';
    };

type NavSectionProps = {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

function NavSection({ title, items, defaultOpen = true }: NavSectionProps) {
  const sectionKey = `portal:nav:${title.replace(/\s+/g, '-').toLowerCase()}`;
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultOpen;
    try {
      const stored = localStorage.getItem(sectionKey);
      return stored ? stored === '1' : defaultOpen;
    } catch {}
    return defaultOpen;
  });

  useEffect(() => {
    try {
      localStorage.setItem(sectionKey, open ? '1' : '0');
    } catch {}
  }, [open, sectionKey]);

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-primary-500 pressable flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/5"
        aria-expanded={open}
        aria-controls={`section-${title.replace(/\s+/g, '-')}`}
      >
        <span>{title}</span>
        <span
          className={`text-primary-500/70 inline-block text-xs transition-transform ${open ? 'rotate-90' : ''}`}
        >
          ▶
        </span>
      </button>
      <div
        id={`section-${title.replace(/\s+/g, '-')}`}
        className={`${open ? 'block' : 'hidden'} mt-1 pl-2`}
      >
        <ul className="list-none space-y-0.5">
          {items.map((item) => {
            const { label, tagText, tagTone, href } =
              typeof item === 'string' ? { label: item } : item;
            return (
              <li key={label}>
                <a
                  href={href || '#'}
                  className="hover:text-primary-500 focus-visible:text-primary-500 active:text-primary-500 hover:bg-primary-500/5 pressable flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-white/75 transition"
                >
                  <span className="truncate">{label}</span>
                  {tagText && (
                    <span
                      className={`ml-3 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                        tagTone === 'success'
                          ? 'border-green-500/30 bg-green-500/15 text-green-100'
                          : tagTone === 'preview'
                            ? 'border-primary-400/30 text-primary-500 bg-primary-400/10'
                            : 'border-white/10 bg-white/5 text-white/60'
                      }`}
                    >
                      {tagText}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function resolveUserAvatarUrl(user: User | null): string | null {
  const meta: any = user?.user_metadata ?? {};
  const identities: any[] = (user as any)?.identities ?? [];
  const identityData = identities.find((i) => i?.identity_data)?.identity_data ?? {};
  if (meta.noAvatar === true) return null;
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

function getUserInitial(user: User | null): string {
  const rawName =
    (user?.user_metadata?.first_name as string) ||
    (user?.user_metadata?.name as string) ||
    (user?.user_metadata?.full_name as string) ||
    (user?.email as string) ||
    'U';
  return rawName.toString().trim().charAt(0).toUpperCase();
}

function UserAvatar({
  user,
  sizeClass,
  textClass = 'text-sm font-semibold text-white/90',
}: {
  user: User | null;
  sizeClass: string;
  textClass?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const url = resolveUserAvatarUrl(user);
  const showImg = Boolean(url) && !imgError;
  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClass} overflow-hidden rounded-full border border-white/10 bg-white/5`}
    >
      {showImg ? (
        <img
          src={url as string}
          alt="User avatar"
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={textClass}>{getUserInitial(user)}</span>
      )}
    </span>
  );
}

type WorkspaceActionCardProps = {
  href: string;
  label: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
};

function WorkspaceActionCard({ href, label, description, icon: Icon }: WorkspaceActionCardProps) {
  function onMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const target = e.currentTarget as HTMLAnchorElement;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--x', `${x}px`);
    target.style.setProperty('--y', `${y}px`);
  }

  return (
    <a
      href={href}
      aria-label={label}
      onMouseMove={onMouseMove}
      className="group focus-visible:ring-primary-400 pressable elevate animate-fade-in-up relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2"
    >
      <div className="interactive-spotlight" aria-hidden="true" />
      <div className="relative grid h-full grid-cols-[auto,1fr,auto] items-center gap-4 p-5 sm:p-6">
        <span className="group-hover:text-primary-400 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/85 transition-colors">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-base font-semibold text-white/95">{label}</div>
          {description && (
            <p className="mt-0.5 line-clamp-3 text-xs text-white/60">{description}</p>
          )}
        </div>
        <span className="group-hover:text-primary-400 translate-x-1 text-white/70 opacity-0 transition will-change-transform group-hover:translate-x-0 group-hover:opacity-100">
          <IconArrowRight className="h-5 w-5" />
        </span>
      </div>
    </a>
  );
}

function Brand() {
  return (
    <a href={getBaseUrl()} className="inline-flex items-center gap-2" aria-label="Smartslate">
      <img src="/images/logos/logo.png" alt="Smartslate" className="logo-glow h-6 w-auto" />
    </a>
  );
}

function SidebarToggleIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9 5v14" />
    </svg>
  );
}

function IconBookOpen({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5.5c-2.8-1.9-6.3-1.9-9 0v12c2.7-1.9 6.2-1.9 9 0" />
      <path d="M12 5.5c2.8-1.9 6.3-1.9 9 0v12c-2.7-1.9-6.2-1.9-9 0" />
      <path d="M12 5.5v12" />
    </svg>
  );
}

function IconChart({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 20.5h17" />
      <path d="M6.5 16.5v-4" />
      <path d="M11.5 16.5v-7" />
      <path d="M16.5 16.5v-2" />
      <path d="M5 11l3-3 3 3 5-5 3 3" />
    </svg>
  );
}

function IconArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </svg>
  );
}

function IconChecklist({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 8.5h6" />
      <path d="M8 12h6" />
      <path d="M8 15.5h6" />
      <path d="M6.5 9.5l1 1 2-2" />
      <path d="M6.5 13l1 1 2-2" />
    </svg>
  );
}

function IconLogout({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function IconSun({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8" />
    </svg>
  );
}

function IconSparkle({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3l2.2 4.5L19 9.8l-4.3 2.3L12 17l-2.7-4.9L5 9.8l4.8-2.3L12 3z" />
    </svg>
  );
}

// Eye icon to match the collapsed rail in the reference design
function IconEye({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Removed unused IconShareNodes to satisfy noUnusedLocals

function SettingsIconImg({ className = '' }: { className?: string }) {
  return (
    <img
      src="https://oyjslszrygcajdpwgxbe.supabase.co/storage/v1/object/public/public-assets/gear.png"
      alt="Settings"
      className={`select-none ${className}`}
      style={{ objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function PortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSettings = location.pathname.endsWith('/settings');
  const isStarmaps = location.pathname.endsWith('/starmaps');
  const isPortalRoot = location.pathname === '/';
  const { user: userParam } = useParams();
  const outlet = useOutlet();
  const viewingProfile = Boolean(userParam);
  // Recent starmaps section removed; keep state unused to avoid fetches
  // const [recentSummaries, setRecentSummaries] = useState<PolarisSummary[]>([])
  // Profile form state
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  const [jobTitle, setJobTitle] = useState<string>('');

  // Check if we're on the Polaris subdomain (handles prod and preview hosts)
  const isPolarisSubdomain =
    typeof window !== 'undefined' &&
    (() => {
      const host = window.location.hostname.toLowerCase();
      return (
        host === 'polaris.smartslate.io' ||
        host.startsWith('polaris.') ||
        host.startsWith('polaris-') ||
        host.split('.').some((part) => part === 'polaris')
      );
    })();
  const [company, setCompany] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  const [bio, setBio] = useState<string>('');

  const [toast, setToast] = useState<{
    id: number;
    kind: 'success' | 'error';
    message: string;
  } | null>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  useDocumentTitle(
    isSettings
      ? 'Smartslate | Settings'
      : viewingProfile
        ? 'Smartslate | My Profile'
        : 'Smartslate | Portal'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('portal:sidebarCollapsed');
    return stored ? stored === '1' : true;
  });
  const [user, setUser] = useState<User | null>(null);
  const [profileMenu, setProfileMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    align: 'center' | 'left' | 'right';
  }>({ open: false, x: 0, y: 0, align: 'center' });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    try {
      localStorage.setItem('portal:sidebarCollapsed', sidebarCollapsed ? '1' : '0');
    } catch {}
  }, [sidebarCollapsed]);

  // Track viewport to derive isMobile
  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getSupabase()
      .auth.getUser()
      .then(({ data: { user: currentUser } }) => {
        if (isMounted) {
          setUser(currentUser ?? null);
          // Removed recent summaries loading
        }
      });
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange(async (_event) => {
      if (isMounted) {
        // Always fetch the freshest user metadata on any auth change
        const {
          data: { user: nextUser },
        } = await getSupabase().auth.getUser();
        setUser(nextUser ?? null);
        // Recent summaries removed
      }
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Removed recent summaries reload hook

  // Recent summaries loader removed

  // profile menu opener removed; profile page navigation is used instead

  function closeProfileMenu() {
    setProfileMenu((p) => ({ ...p, open: false }));
  }

  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') closeProfileMenu();
    }
    if (profileMenu.open) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [profileMenu.open]);

  // Clamp menu within viewport when opened or on resize
  useEffect(() => {
    if (!profileMenu.open) return;
    const menu = menuRef.current;
    const margin = 8;
    const vw = window.innerWidth;

    function computeAlign() {
      const menuWidth = menu?.offsetWidth ?? 180;
      const tooLeft = profileMenu.x - menuWidth / 2 < margin;
      const tooRight = profileMenu.x + menuWidth / 2 > vw - margin;
      const newAlign: 'center' | 'left' | 'right' = tooLeft
        ? 'left'
        : tooRight
          ? 'right'
          : 'center';
      if (newAlign !== profileMenu.align) setProfileMenu((p) => ({ ...p, align: newAlign }));
    }

    computeAlign();
    const onResize = () => computeAlign();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [profileMenu.open, profileMenu.x, profileMenu.align]);

  async function onLogout() {
    try {
      await getSupabase().auth.signOut();
    } finally {
      if (typeof window !== 'undefined') {
        redirectTo();
      } else {
        navigate('/login', { replace: true });
      }
    }
  }

  function getFirstName(): string {
    const rawName =
      (user?.user_metadata?.first_name as string) ||
      (user?.user_metadata?.name as string) ||
      (user?.user_metadata?.full_name as string) ||
      (user?.email as string) ||
      'User';
    return rawName.toString().trim().split(' ')[0];
  }

  function getUsernameFromMeta(): string {
    const meta: any = user?.user_metadata ?? {};
    return sanitizeUsername((meta.username as string) || (meta.handle as string) || '');
  }

  function sanitizeUsername(input: string): string {
    return (input || '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);
  }

  async function loadProfileFromServer(currentUser: User | null) {
    if (!currentUser) return;
    const supabase = getSupabase();
    // Try load from 'profiles' table
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
      if (!error && data) {
        setUsername((data.username as string) || getUsernameFromMeta() || getFirstName());
        setDisplayName(
          (data.full_name as string) ||
            (currentUser.user_metadata?.full_name as string) ||
            (currentUser.user_metadata?.name as string) ||
            getFirstName()
        );

        setJobTitle((data.job_title as string) || '');
        setCompany((data.company as string) || '');
        setWebsite((data.website as string) || '');
        setCity((data.location as string) || '');
        setCountry((data.country as string) || '');

        setBio((data.bio as string) || '');

        return;
      }
    } catch {}

    // Fallback to auth metadata
    const meta: any = currentUser.user_metadata ?? {};
    setUsername((meta.username as string) || (meta.handle as string) || getFirstName());
    setDisplayName((meta.full_name as string) || (meta.name as string) || getFirstName());

    setJobTitle((meta.job_title as string) || '');
    setCompany((meta.organization as string) || (meta.company as string) || '');
    setWebsite((meta.website as string) || '');
    setCity((meta.location as string) || '');
    setCountry((meta.country as string) || '');

    setBio((meta.bio as string) || '');
  }

  useEffect(() => {
    if (!user) return;
    loadProfileFromServer(user);
  }, [user]);

  useEffect(() => {
    if (!viewingProfile) return;
    const param = decodeURIComponent((userParam as string) || '');
    if (username && param && param !== username) {
      navigate(portalUserPath(username), { replace: true });
    }
  }, [username, viewingProfile, userParam, navigate]);

  function goToProfile() {
    closeProfileMenu();
    redirectTo('/notjitin');
  }

  const collapsedQuickItems = [
    { title: 'Ignite', icon: IconEye },
    { title: 'Strategic Skills Architecture', icon: IconChecklist },
    { title: 'Solara', icon: IconSun },
  ];

  const solaraItems: NavItem[] = [
    { label: 'Polaris', tagText: '2.5 Preview', tagTone: 'preview' },
    {
      label: 'Constellation',
      href:
        typeof window !== 'undefined'
          ? `${window.location.protocol}//constellation.smartslate.io`
          : 'https://constellation.smartslate.io',
      tagText: 'V2: Preview',
      tagTone: 'preview',
    },
    { label: 'Nova', tagText: isMobile ? 'Visit on Desktop' : 'Coming Soon', tagTone: 'info' },
    { label: 'Orbit', tagText: isMobile ? 'Visit on Desktop' : 'Coming Soon', tagTone: 'info' },
    { label: 'Spectrum', tagText: isMobile ? 'Visit on Desktop' : 'Coming Soon', tagTone: 'info' },
  ];

  // Persisted open state for the Solara section (desktop), matching the arrow behavior
  const [solaraOpen, setSolaraOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem('portal:nav:solara');
      return stored ? stored === '1' : true;
    } catch {}
    return true;
  });
  useEffect(() => {
    try {
      localStorage.setItem('portal:nav:solara', solaraOpen ? '1' : '0');
    } catch {}
  }, [solaraOpen]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <div className="flex h-full">
        <aside
          className={`hidden md:flex ${sidebarCollapsed ? 'md:w-16 lg:w-16' : 'md:w-72 lg:w-80'} flex-col border-r border-[#141620] bg-[#0D1B2A] transition-[width] duration-300 ease-in-out`}
        >
          <div
            className={`px-3 ${sidebarCollapsed ? 'py-2' : 'px-4 py-4'} flex items-center border-b border-[#141620] ${sidebarCollapsed ? 'justify-center' : 'justify-between'} sticky top-0 z-10 gap-2`}
          >
            {!sidebarCollapsed && <Brand />}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="pressable flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <SidebarToggleIcon className="h-5 w-5" />
            </button>
          </div>
          {sidebarCollapsed ? (
            <div className="flex flex-1 flex-col items-center gap-3 py-4">
              {collapsedQuickItems.map(({ title, icon: Icon }) => (
                <button
                  key={title}
                  type="button"
                  title={title}
                  aria-label={title}
                  className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-transform duration-200 hover:scale-[1.04] hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          ) : (
            <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
              <NavSection title="Ignite" items={['Explore Learning', 'My Learning']} />
              <NavSection
                title="Strategic Skills Architecture"
                items={['Explore Partnership', 'My Architecture']}
              />
              <div className="select-none">
                <button
                  type="button"
                  onClick={() => setSolaraOpen((v) => !v)}
                  className="text-primary-400 pressable flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-white/5"
                  aria-expanded={solaraOpen}
                  aria-controls="section-solara"
                >
                  <span className="font-semibold !text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    Solara
                  </span>
                  <span
                    className={`text-primary-400/80 inline-block text-xs transition-transform ${solaraOpen ? 'rotate-90' : ''}`}
                  >
                    ▶
                  </span>
                </button>
                <div id="section-solara" className={`${solaraOpen ? 'block' : 'hidden'} mt-1 pl-2`}>
                  <ul className="list-none space-y-0.5">
                    <li>
                      <a
                        href={
                          typeof window !== 'undefined'
                            ? `${window.location.protocol}//polaris.smartslate.io`
                            : 'https://polaris.smartslate.io'
                        }
                        aria-current={isPolarisSubdomain ? 'page' : undefined}
                        className={`pressable flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${
                          isPolarisSubdomain
                            ? 'text-primary-300 bg-primary-400/10 ring-primary-400/30 ring-1 ring-inset'
                            : 'hover:text-primary-400 focus-visible:text-primary-400 active:text-primary-400 text-white/75 hover:bg-white/5'
                        }`}
                      >
                        <span className="truncate">Polaris</span>
                        <span className="border-primary-400/30 text-primary-300 bg-primary-400/10 ml-3 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium">
                          2.5 Preview
                        </span>
                      </a>
                    </li>
                    {/* Removed "Polaris Jobs" entry per request */}
                    {solaraItems.slice(1).map((item) => (
                      <li key={typeof item === 'string' ? item : item.label}>
                        <a
                          href={typeof item !== 'string' && item.href ? item.href : '#'}
                          className="hover:text-primary-400 pressable flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-white/75 transition hover:bg-white/5"
                        >
                          <span className="truncate">
                            {typeof item === 'string' ? item : item.label}
                          </span>
                          {typeof item !== 'string' && item.tagText && (
                            <span
                              className={`ml-3 inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${item.tagTone === 'preview' ? 'border-primary-400/30 text-primary-300 bg-primary-400/10' : 'border-white/15 bg-white/5 text-white/60'}`}
                            >
                              {item.tagText}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recent Starmaps Section removed */}
            </nav>
          )}

          <div className="mt-auto w-full">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-2 px-0 py-3">
                <button
                  type="button"
                  title="Subscribe to Polaris"
                  onClick={() => navigate('/pricing')}
                  className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
                >
                  <IconSparkle className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  title={`${getCapitalizedFirstName((user?.user_metadata?.first_name as string) || (user?.user_metadata?.name as string) || (user?.user_metadata?.full_name as string) || 'Your')}'s Profile`}
                  onClick={goToProfile}
                  className="pressable flex h-10 w-10 items-center justify-center rounded-full text-white/85 hover:text-white"
                >
                  <UserAvatar user={user} sizeClass="w-6 h-6" textClass="text-sm font-semibold" />
                </button>
                <button
                  type="button"
                  title="Settings"
                  onClick={() => redirectTo('/settings')}
                  className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
                >
                  <SettingsIconImg className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  title="Logout from Polaris"
                  aria-label="Logout from Polaris"
                  onClick={onLogout}
                  className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
                >
                  <IconLogout className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-3 py-3">
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="pressable inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 transition hover:bg-white/5"
                  title="Subscribe to Polaris"
                >
                  <IconSparkle className="h-5 w-5" />
                  <span>Subscribe to Polaris</span>
                </button>
                <button
                  type="button"
                  onClick={goToProfile}
                  className="pressable flex w-full items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/5"
                  title={`${getCapitalizedFirstName((user?.user_metadata?.first_name as string) || (user?.user_metadata?.name as string) || (user?.user_metadata?.full_name as string) || 'Your')}'s Profile`}
                >
                  <UserAvatar user={user} sizeClass="w-5 h-5" />
                  <span className="text-sm font-medium text-white/90">
                    {(() => {
                      const rawName =
                        (user?.user_metadata?.first_name as string) ||
                        (user?.user_metadata?.name as string) ||
                        (user?.user_metadata?.full_name as string) ||
                        (user?.email as string) ||
                        'Your';
                      const first = rawName.toString().trim().split(' ')[0];
                      return user && first && first !== 'Your'
                        ? `${first}'s Profile`
                        : 'Your Profile';
                    })()}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => redirectTo('/settings')}
                  className="pressable inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5"
                  title="Settings"
                >
                  <SettingsIconImg className="h-5 w-5" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="pressable inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/90 transition hover:bg-white/5"
                  title="Logout from Polaris"
                >
                  <IconLogout className="h-5 w-5" />
                  <span>Logout from Polaris</span>
                </button>
              </div>
            )}
            <div
              className={`border-t border-[#1a2438] text-xs text-white/50 ${sidebarCollapsed ? 'flex items-center justify-center px-0 py-2' : 'px-4 py-3'}`}
            >
              {sidebarCollapsed ? '❤️' : 'Made with ❤️ for better education'}
            </div>
          </div>
        </aside>

        <main className="h-full min-w-0 flex-1 overflow-y-auto">
          <header className="relative sticky top-0 z-40 mb-12 overflow-hidden border-b border-[#141620] bg-[rgb(var(--bg))]/80 backdrop-blur-xl md:mb-0">
            <HeaderSwirlBackground />
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-3 sm:py-4">
              {!isPortalRoot && (
                <div
                  aria-hidden="true"
                  className="from-primary-400/10 pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-br via-fuchsia-400/5 to-transparent blur-2xl"
                />
              )}
              <div className="animate-fade-in-up relative">
                <div className="flex items-center gap-2 md:hidden">
                  <Brand />
                  <div className="ml-auto inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(true)}
                      aria-label="Open menu"
                      className="pressable inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/85 hover:text-white"
                    >
                      <SidebarToggleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {isSettings ? (
                  <>
                    <h1 className="animate-fade-in-up mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                      Settings
                    </h1>
                    <p className="animate-fade-in-up animate-delay-150 mt-2 max-w-3xl text-sm text-white/70 sm:text-base">
                      Manage your account, settings, and preferences.
                    </p>
                  </>
                ) : isStarmaps ? (
                  <>
                    <h1 className="animate-fade-in-up mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                      Discovery Starmaps
                    </h1>
                    <p className="animate-fade-in-up animate-delay-150 mt-2 max-w-3xl text-sm text-white/70 sm:text-base">
                      View and manage all your Polaris discovery starmaps.
                    </p>
                  </>
                ) : viewingProfile ? (
                  <>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div>
                        <h1 className="animate-fade-in-up text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                          <span className="text-primary-600">{getFirstName()}</span>
                          <span>'s Profile</span>
                        </h1>
                        <p className="animate-fade-in-up animate-delay-150 mt-2 max-w-3xl text-sm text-white/70 sm:text-base">
                          Your professional profile showcases your achievements and expertise. Share
                          your unique profile with colleagues and potential collaborators:{' '}
                          <span className="text-primary-400 font-medium">
                            {window.location.origin}
                            {publicProfilePath(username || 'your-username')}
                          </span>
                        </p>
                      </div>
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={onLogout}
                          className="pressable rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
                          title="Logout"
                          aria-label="Logout"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="animate-fade-in-up mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                      <span className="block">Illuminating the Path of Discovery:</span>
                      <span className="text-brand-accent block">Polaris</span>
                    </h1>
                  </>
                )}
              </div>
            </div>
          </header>

          {outlet ? (
            <div className="mx-auto max-w-7xl px-4 py-6">{outlet}</div>
          ) : viewingProfile ? (
            <section className="animate-fade-in-up mx-auto max-w-4xl px-4 py-6">
              {/* Clean Material Profile Card */}
              <div
                ref={profileCardRef}
                className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row">
                  {/* Simple Avatar Section */}
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="relative">
                      <UserAvatar
                        user={user}
                        sizeClass="w-24 h-24"
                        textClass="text-2xl font-semibold"
                      />
                      <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-2 border-white bg-green-400" />
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="min-w-0 flex-1">
                    {/* Header */}
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
                          {displayName || getFirstName()}
                        </h2>
                        <div className="flex items-center gap-2 text-white/60">
                          <span>@{username || 'user'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(paths.portal)}
                          className="rounded-lg border border-white/20 p-2 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                          title="Back to Portal"
                          aria-label="Back to Portal"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div className="mb-4 space-y-3">
                      {(jobTitle || company) && (
                        <div className="flex flex-wrap gap-2 text-sm">
                          {jobTitle && <span className="text-white/90">{jobTitle}</span>}
                          {jobTitle && company && <span className="text-white/40">at</span>}
                          {company && (
                            <span className="text-primary-400 font-medium">{company}</span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                        {(city || country) && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{[city, country].filter(Boolean).join(', ')}</span>
                          </div>
                        )}

                        {website && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                              />
                            </svg>
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:underline"
                            >
                              {website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        title="LinkedIn"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </button>
                      <button
                        className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        title="Twitter"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </button>
                      <button
                        className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        title="Email"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </button>

                      <div className="mx-2 h-6 w-px bg-white/20" />

                      <button
                        onClick={() => {
                          const publicProfileUrl = `${window.location.origin}/${userParam || 'user'}`;
                          window.open(publicProfileUrl, '_blank');
                        }}
                        className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
                      >
                        View Public Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {bio && (
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h3 className="mb-2 text-sm font-medium text-white/80">About</h3>
                    <div
                      className="prose prose-invert prose-sm max-w-none leading-relaxed text-white/70"
                      dangerouslySetInnerHTML={{ __html: bio }}
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Portfolio Sections */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Certificates Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="bg-primary-500/20 border-primary-500/30 flex h-10 w-10 items-center justify-center rounded-lg border">
                      <svg
                        className="text-primary-400 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white/95">Certificates</h3>
                      <p className="text-sm text-white/60">
                        Professional certifications and achievements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center px-4 py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <svg
                          className="h-8 w-8 text-white/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-white/60">Certificates will be displayed here</p>
                      <p className="mt-1 text-xs text-white/40">Coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/20">
                      <svg
                        className="h-5 w-5 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white/95">Achievements</h3>
                      <p className="text-sm text-white/60">Awards, recognitions, and accolades</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center px-4 py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <svg
                          className="h-8 w-8 text-white/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-white/60">Achievements will be displayed here</p>
                      <p className="mt-1 text-xs text-white/40">Coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white/95">Skills & Expertise</h3>
                      <p className="text-sm text-white/60">Professional skills and competencies</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center px-4 py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <svg
                          className="h-8 w-8 text-white/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-white/60">Skills will be displayed here</p>
                      <p className="mt-1 text-xs text-white/40">Coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Projects Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/20">
                      <svg
                        className="h-5 w-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white/95">Projects & Portfolio</h3>
                      <p className="text-sm text-white/60">Notable projects and work samples</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center px-4 py-12">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <svg
                          className="h-8 w-8 text-white/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-white/60">Projects will be displayed here</p>
                      <p className="mt-1 text-xs text-white/40">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mx-auto max-w-7xl px-4 py-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="animate-fade-in-up h-40 sm:h-44 md:h-48">
                  <WorkspaceActionCard
                    href="/discover"
                    label="Create Starmap"
                    description="Build comprehensive L&D strategies with AI-powered insights and beautiful visualizations."
                    icon={IconSparkle}
                  />
                </div>
                <div className="animate-fade-in-up animate-delay-75 h-40 sm:h-44 md:h-48">
                  <WorkspaceActionCard
                    href="/starmaps"
                    label="My Starmaps"
                    description="View and manage all your discovery starmaps in one place."
                    icon={IconBookOpen}
                  />
                </div>
                <div className="animate-fade-in-up animate-delay-150 h-40 sm:h-44 md:h-48">
                  <WorkspaceActionCard
                    href="/polaris/jobs"
                    label="Jobs Dashboard"
                    description="Monitor and track your asynchronous report generation jobs."
                    icon={IconChart}
                  />
                </div>
              </div>
            </section>
          )}
          {toast && (
            <div className="animate-fade-in-up fixed right-4 bottom-4 z-[60]">
              <div
                className={`rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl ${toast.kind === 'success' ? 'border-green-500/30 bg-green-500/15 text-green-100' : 'border-red-500/30 bg-red-500/15 text-red-100'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm">{toast.message}</span>
                  <button
                    type="button"
                    className="ml-2 text-white/80 hover:text-white"
                    aria-label="Dismiss"
                    onClick={() => setToast(null)}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
          {profileMenu.open && (
            <div
              className="animate-fade-in fixed inset-0 z-50"
              onClick={closeProfileMenu}
              aria-hidden="true"
            >
              <div
                ref={menuRef}
                className="animate-scale-in absolute z-50 min-w-[160px] rounded-lg border border-white/10 bg-[rgb(var(--bg))]/95 p-1 text-sm shadow-2xl backdrop-blur-xl"
                style={{
                  top: `${profileMenu.y}px`,
                  ...(profileMenu.align === 'center'
                    ? { left: `${profileMenu.x}px`, transform: 'translateX(-50%)' }
                    : profileMenu.align === 'left'
                      ? { left: '8px' }
                      : { right: '8px' }),
                }}
                role="menu"
                aria-orientation="vertical"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-md px-3 py-2 text-left text-white/90 hover:bg-white/5"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
              <div
                className="animate-fade-in absolute inset-0 bg-black/50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="animate-slide-in-right absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-[#141620] bg-[#0D1B2A] p-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 px-1 py-2">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:text-white"
                  >
                    <span className="text-lg">×</span>
                  </button>
                  <Brand />
                </div>
                <nav className="mt-3 flex-1 space-y-3 overflow-y-auto pb-6">
                  <NavSection
                    title="Ignite"
                    items={['Explore Learning', 'My Learning']}
                    defaultOpen
                  />
                  <NavSection
                    title="Strategic Skills Architecture"
                    items={['Explore Partnership', 'My Architecture']}
                    defaultOpen
                  />
                  <NavSection title="Solara" items={solaraItems} defaultOpen />

                  {/* Recent Starmaps Section for Mobile removed */}
                </nav>
                <div className="mt-auto">
                  {/* Mobile subscribe button above bottom actions */}
                  <div className="px-1 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/pricing');
                      }}
                      className="pressable inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5"
                      title="Subscribe to Polaris"
                    >
                      <IconSparkle className="h-5 w-5" />
                      <span>Subscribe to Polaris</span>
                    </button>
                  </div>
                  <div className="border-t border-white/10 px-1 py-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={goToProfile}
                        title={`${getCapitalizedFirstName((user?.user_metadata?.first_name as string) || (user?.user_metadata?.name as string) || (user?.user_metadata?.full_name as string) || 'Your')}'s Profile`}
                        className="pressable flex h-10 w-10 items-center justify-center rounded-full text-white/85 hover:text-white"
                      >
                        <UserAvatar
                          user={user}
                          sizeClass="w-10 h-10"
                          textClass="text-sm font-semibold"
                        />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Settings"
                          onClick={() => redirectTo('/settings')}
                          className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
                        >
                          <SettingsIconImg className="h-10 w-10" />
                        </button>
                        <button
                          type="button"
                          title="Logout from Polaris"
                          onClick={onLogout}
                          className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
                        >
                          <IconLogout className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
