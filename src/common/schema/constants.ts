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
  VALUES: ['open', 'assigned', 'in-progress', 'done', 'not-done',
    'cancelled', 'removed', 'pending-review', 'investigate'],
  DEFAULT: 'open',
  FINISHED_VALUES: ['done', 'not-done'],
  REVIEWABLE_VALUES: ['in-progress', 'pending-review'],
  isValidNext: (oldStatus: string, newStatus: string): boolean => {
    switch (oldStatus) {
      case 'open':
        return ['assigned', 'cancelled'].includes(newStatus);
      case 'assigned':
        return ['in-progress', 'cancelled'].includes(newStatus);
      case 'in-progress':
        return ['pending-review'].includes(newStatus);
      case 'pending-review':
        return ['done', 'not-done', 'investigate'].includes(newStatus);
      default:
        return false;
    }
  },
};

export const TASK_CATEGORIES = {
  VALUES: ['beauty', 'repair', 'home', 'expat'],
  DEFAULT: 'beauty',
};

// TODO: Create interface UserSummary
export const WORKER_USER_SUMMARY_PROP =
  'firstName lastName likes dislikes imageUrl badges tags isApproved';

// TODO: Create interface UserSummary
export const GENERAL_USER_SUMMARY_PROP =
  'firstName lastName likes dislikes imageUrl badges isApproved';

// TODO: Create interface TaskSummary
export const TASK_SUMMARY_PROP =
  'status creatorUser';
