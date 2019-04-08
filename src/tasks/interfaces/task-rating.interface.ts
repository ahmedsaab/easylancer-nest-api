export interface TaskRating {
  criteria: Criteria;
  description: string;
  like: boolean;
}

interface Criteria {
  measure1: number;
  measure2: number;
}
