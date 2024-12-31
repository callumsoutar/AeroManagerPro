export type LessonType = 
  | "Effects of controls 1"
  | "Effects of controls 2"
  | "Straight and level"
  | "Climbing and descending"
  | "Medium, climbing and descending turns"
  | "Slow flight"
  | "Basic stalling 1"
  | "Basic Stalling 2"
  | "Pre-circuit Revision"
  | "Circuits 1"
  | "Circuits 2"
  | "Circuit considerations"
  | "Engine failure after take-off"
  | "Flapless landings"
  | "Crosswind circuits"
  | "Glide approach"
  | "Vacating and joining at aerodromes"
  | "Forced landing without power – pattern"
  | "Forced landing without power – considerations"
  | "Steep turns"
  | "Wing-drop stalling"
  | "Short-field take-off and landing"
  | "Low flying introduction"
  | "Low flying consolidation"
  | "Precautionary landings"
  | "Terrain and weather awareness"
  | "Basic mountain flying"
  | "Instrument flying"
  | "Compass use"
  | "Instrument flying introduction"
  | "Limited panel"
  | "Unusual attitudes"

export interface Lesson {
  id: string;
  type: LessonType;
  bookingId: string;
  memberId: string;
  date: string;
  instructorId: string;
  notes?: string;
  grade?: 1 | 2 | 3 | 4 | 5; // Optional grading system
}

// This array contains all possible lessons in order
export const ALL_LESSONS: LessonType[] = [
  "Effects of controls 1",
  "Effects of controls 2",
"Straight and level",
"Climbing and descending",
"Medium, climbing and descending turns",
"Slow flight",
"Basic stalling 1",
"Basic Stalling 2",
"Pre-circuit Revision",
"Circuits 1",
"Circuits 2",
"Circuit considerations",
"Engine failure after take-off",
"Flapless landings",
 "Crosswind circuits",
"Glide approach",
 "Vacating and joining at aerodromes",
"Forced landing without power – pattern",
 "Forced landing without power – considerations",
"Steep turns",
 "Wing-drop stalling",
 "Short-field take-off and landing",
 "Low flying introduction",
  "Low flying consolidation",
 "Precautionary landings",
 "Terrain and weather awareness",
 "Basic mountain flying",
 "Instrument flying",
"Compass use",
 "Instrument flying introduction",
 "Limited panel",
 "Unusual attitudes"
];

// Example completed lessons data
export const completedLessons: Lesson[] = [
  {
    id: "1",
    type: "Effects of controls 1",
    bookingId: "booking1",
    memberId: "1",
    date: "2024-03-15",
    instructorId: "inst1",
    grade: 4
  },
  // ... more completed lessons
]; 