export type SourceType = "wikipedia";

export interface DayEvent {
  date: Date;
  event: string;
  details?: string;
  imageUrl?: string;
  country: string;
}
