export function requireEnv(name: "NEON_DATABASE_URL" | "GEMINI_API_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`필수 환경 변수 ${name}이 설정되지 않았습니다.`);
  return value;
}
