export const SITE_ROUTES = {
  HOME: '/',
  PRESENTATION: '/presentation',
  VISION: '/vision',
  MISSION: '/mission',
  LEADERSHIP: '/leadership',
  EXTENSIONS: '/extensions',
  GALLERY: '/galerie',
  EVENTS: '/evenements',
  CONTACT: '/contact',
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/utilisateurs',
  ROLES: '/admin/roles',
  EVENTS: '/admin/evenements',
  GALLERY: '/admin/galerie',
  EXTENSIONS: '/admin/extensions',
  PAGES: '/admin/pages',
  SERMONS: '/admin/enseignements',
  DEPARTMENTS: '/admin/departements',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: '/users',
  ROLES: '/roles',
  EXTENSIONS: '/extensions',
  EVENTS: '/events',
  SERMONS: '/sermons',
  GALLERY: '/gallery',
  TESTIMONIES: '/testimonies',
  DEPARTMENTS: '/departments',
} as const;
