export function getStudentCallName(name: string | null | undefined) {
  const trimmedName = name?.trim() || "";
  if (!trimmedName || trimmedName === "학생") return "학생";
  return /^[가-힣]{3}$/.test(trimmedName) ? trimmedName.slice(1) : trimmedName;
}

export function getStudentAddress(name: string | null | undefined) {
  const callName = getStudentCallName(name);
  return callName === "학생" ? "학생" : `${callName} 학생`;
}
