import * as languages from './languages.json';

export const PAYMENT_METHODS = {
  VALUES: ['card', 'cash'],
  DEFAULT: 'card',
};

export const TASK_TYPES = {
  VALUES: [
    'manicure', 'hair', 'computer', 'phone', 'bike', 'automotive',
    'cleaning', 'renovation', 'electricity', 'plumping', 'translation',
    'paper work',
  ],
  DEFAULT: 'manicure',
};

export const TASK_STATUSES = {
  VALUES: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'NOT_DONE',
    'CANCELLED', 'REMOVED', 'PENDING_OWNER_REVIEW',
    'PENDING_WORKER_REVIEW', 'INVESTIGATE'],
  DEFAULT: 'OPEN',
  FINISHED_VALUES: ['DONE', 'NOT_DONE'],
  REVIEWABLE_VALUES: ['IN_PROGRESS', 'PENDING_WORKER_REVIEW', 'PENDING_OWNER_REVIEW'],
  isValidNext: (oldStatus: string, newStatus: string): boolean => {
    switch (oldStatus) {
      case 'OPEN':
        return ['ASSIGNED', 'CANCELLED'].includes(newStatus);
      case 'ASSIGNED':
        return ['IN_PROGRESS', 'CANCELLED'].includes(newStatus);
      case 'IN_PROGRESS':
        return ['PENDING_WORKER_REVIEW', 'PENDING_OWNER_REVIEW'].includes(newStatus);
      case 'PENDING_WORKER_REVIEW':
      case 'PENDING_OWNER_REVIEW':
        return ['DONE', 'NOT_DONE', 'INVESTIGATE'].includes(newStatus);
      default:
        return false;
    }
  },
};

export const TASK_CATEGORIES = {
  VALUES: ['beauty', 'repair', 'home', 'expat'],
  DEFAULT: 'beauty',
};

export const USER_SETTINGS_ROLES = {
  VALUES: ['WORKER', 'OWNER'],
  DEFAULT: 'OWNER',
};

export const LANGUAGES = {
  VALUES: Object.keys(languages).map(key => key.toUpperCase()),
};
