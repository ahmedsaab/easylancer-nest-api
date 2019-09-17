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
    'CANCELLED', 'REMOVED', 'PENDING_REVIEW', 'INVESTIGATE'],
  DEFAULT: 'OPEN',
  FINISHED_VALUES: ['DONE', 'NOT_DONE'],
  REVIEWABLE_VALUES: ['IN_PROGRESS', 'PENDING_REVIEW'],
  isValidNext: (oldStatus: string, newStatus: string): boolean => {
    switch (oldStatus) {
      case 'OPEN':
        return ['ASSIGNED', 'CANCELLED'].includes(newStatus);
      case 'ASSIGNED':
        return ['IN_PROGRESS', 'CANCELLED'].includes(newStatus);
      case 'IN_PROGRESS':
        return ['PENDING_REVIEW'].includes(newStatus);
      case 'PENDING_REVIEW':
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

// TODO: Create interface UserSummary
export const WORKER_USER_SUMMARY_PROP =
  'firstName lastName likes dislikes ratings imageUrl badges tags isApproved';

// TODO: Create interface UserSummary
export const GENERAL_USER_SUMMARY_PROP =
  'firstName lastName likes dislikes imageUrl badges isApproved';

// TODO: Create interface TaskSummary
export const TASK_SUMMARY_PROP =
  'status creatorUser';
