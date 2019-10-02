interface ProfileRating {
  likes: number;
  dislikes: number;
  value: number;
  count: number;
}

export interface UserRatings {
  creator: ProfileRating;
  worker: ProfileRating;
}
