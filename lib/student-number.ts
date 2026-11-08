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

// 중앙 B ID의 입학연도와 현재 E열 학번을 묶어 앱의 재사용 학번을 만든다.
// 같은 5자리 학번을 다음 기수가 쓰더라도 두 사람의 student_number가 겹치지 않는다.
export function currentBoundStudentNumber(platformUserId: string, uid: string | undefined):
  (ParsedStudentNumber & { studentNumber: string }) | null {
  const cohort = /^(\d{2})-\d{5}$/.exec(platformUserId)?.[1];
  const current = /^(?:(\d{2}|\d{4})-)?(\d{5})$/.exec(uid ?? "");
  if (!cohort || !current || (current[1] && current[1] !== cohort && current[1] !== `20${cohort}`)) return null;
  const parsed = parseSchoolStudentNumber(current[2]);
  if (!parsed || parsed.grade > 3) return null;
  return { ...parsed, studentNumber: `${cohort}-${current[2]}` };
}
