export const PAYMENT_METHODS = {
  VALUES: ['card', 'cash'],
  DEFAULT: 'card',
};

export const TASK_TYPES = {
  VALUES: ['type1', 'type2', 'type3', 'type4'],
  DEFAULT: 'type1',
};

export const TASK_STATUSES = {
  VALUES: ['open', 'accepted', 'in-progress', 'done', 'not-done', 'cancelled', 'removed'],
  DEFAULT: 'open',
  FINISHED_VALUES: ['done', 'not-done'],
  REVIEWABLE_VALUES: ['in-progress'],
  isValidNext: (oldStatus: string, newStatus: string): boolean => {
    switch (oldStatus) {
      case 'open':
        return ['accepted', 'cancelled'].includes(newStatus);
      case 'accepted':
        return ['in-progress', 'cancelled'].includes(newStatus);
      case 'in-progress':
        return ['done', 'not-done'].includes(newStatus);
      default:
        return false;
    }
  },
};

export const TASK_CATEGORIES = {
  VALUES: ['category1', 'category2', 'category3', 'category4'],
  DEFAULT: 'category1',
};

// TODO: Create interface UserSummary
export const USER_SUMMARY_PROP =
  'firstName lastName likes dislikes imageUrl badges isApproved';

// TODO: Create interface TaskSummary
export const TASK_SUMMARY_PROP =
  'status creatorUser';
