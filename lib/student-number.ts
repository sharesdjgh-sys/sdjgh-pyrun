export interface ParsedStudentNumber {
  grade: number;
  classNumber: number;
  seatNumber: number;
}

// School student numbers use GCCNN: 1 digit grade, 2 digit class, 2 digit seat number.
export function parseSchoolStudentNumber(studentNumber: string): ParsedStudentNumber | null {
  const normalized = studentNumber.trim();
  if (!/^\d{5}$/.test(normalized)) return null;

  const grade = Number(normalized.slice(0, 1));
  const classNumber = Number(normalized.slice(1, 3));
  const seatNumber = Number(normalized.slice(3, 5));

  if (grade < 1 || classNumber < 1 || seatNumber < 1) return null;
  return { grade, classNumber, seatNumber };
}
