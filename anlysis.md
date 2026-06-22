# 코드베이스 분석

분석 기준일: 2026-06-22  
대상: 현재 워크스페이스의 애플리케이션 코드 및 설정 파일

## 1. 요약

이 프로젝트는 고등학교 초급 학습자가 브라우저에서 Python 코드를 실행하고, 코드의 결과를 캐릭터 애니메이션으로 확인하며, AI 피드백과 개념별 뱃지를 받는 학습 서비스다.

- 프런트엔드/서버: Next.js 15 App Router, React 19, TypeScript
- Python 실행: 브라우저에서 Pyodide 0.27.0을 CDN으로 로드
- 에디터: CodeMirror 6
- 애니메이션: React 상태 + Framer Motion + SVG
- 인증: Auth.js(NextAuth v5 beta) Credentials/JWT
- 데이터베이스: Neon PostgreSQL + Drizzle ORM
- AI 피드백: Google Gemini 2.5 Flash
- 스타일: Tailwind CSS와 인라인 스타일 혼용

현재 프로덕션 빌드는 성공한다. 핵심 사용자 흐름도 연결되어 있으나, 학습 완료 판정의 신뢰성, 무한 루프 차단, 개념 탐지 정확도, 자동화된 테스트/린트 부재는 출시 전에 우선 보완할 필요가 있다.

## 2. 주요 사용자 흐름

```text
회원가입/로그인
    ↓
/learn에서 예제 선택 또는 Python 코드 작성
    ↓
Pyodide가 브라우저 메인 스레드에서 코드 실행
    ├─ stdout/stderr 수집
    └─ JS의 robot 모듈 호출 → 전역 animationQueue에 명령 축적
    ↓
RobotStage가 명령을 순차 애니메이션으로 재생
    ↓
/api/feedback으로 코드와 실행 결과 전송
    ├─ 정규식으로 학습 개념 재탐지
    ├─ Gemini 피드백 생성
    ├─ 성공한 개념 및 신규 뱃지 저장
    └─ 피드백 이력 저장
    ↓
/progress에서 진행률, 뱃지, 최근 피드백 조회
```

실행과 시각화는 클라이언트에서 이루어지고, 인증·AI 호출·학습 이력 영속화는 서버에서 이루어지는 구조다.

## 3. 디렉터리와 모듈 역할

| 경로 | 역할 |
|---|---|
| `app/` | App Router 페이지, 레이아웃, API Route Handler |
| `app/learn/LearnClient.tsx` | 코드 편집·실행·개념 판정·피드백·애니메이션을 조율하는 핵심 화면 |
| `app/progress/ProgressClient.tsx` | 진행률, 뱃지, 피드백 이력 UI |
| `components/editor/` | CodeMirror 에디터와 출력 패널 |
| `components/robot/` | 캐릭터, 무대, 말풍선, 도형 및 모션 표현 |
| `components/badges/` | 뱃지 카드와 획득 연출 |
| `hooks/usePyodide.ts` | Pyodide 로딩, `robot` JS 모듈 등록, Python 실행과 출력 캡처 |
| `lib/python-parser.ts` | 16개 Python 개념을 정규식으로 탐지 |
| `lib/robot-api.ts` | Python에서 호출할 수 있는 캐릭터 명령 API와 입력 검증 |
| `lib/animation-queue.ts` | 실행 중 수집한 캐릭터 명령 큐 |
| `lib/curriculum.ts` | 16개 개념 예제 및 뱃지 메타데이터 |
| `lib/auth.ts` | Credentials 로그인, JWT/session 확장 |
| `lib/gemini.ts` | Gemini 프롬프트 구성과 fallback 피드백 |
| `lib/db/` | Drizzle 스키마, Neon 연결, 초기 데이터 seed |
| `types/` | 도메인 및 UI 공용 타입 |
| `ref/`, `design/` | 기획 문서, 디자인 산출물 및 참고 이미지 |

`LearnClient`가 실행 파이프라인 대부분을 담당해 응집된 흐름을 읽기는 쉽지만, 화면 상태·실행·피드백·커리큘럼·애니메이션 조율이 한 컴포넌트에 집중되어 있다.

## 4. 라우트와 API

### 페이지

| 라우트 | 설명 | 보호 방식 |
|---|---|---|
| `/` | 세션 유무에 따라 `/learn` 또는 `/login`으로 이동 | 서버에서 세션 확인 |
| `/login` | Credentials 로그인 | 공개 |
| `/register` | 학생 계정 생성 | 공개 |
| `/learn` | Python 학습/실행 화면 | 미들웨어 + 서버 페이지 확인 |
| `/progress` | 진행률/뱃지/피드백 이력 | 미들웨어 + 서버 페이지 확인 |

### API

| 메서드/경로 | 설명 | 인증 |
|---|---|---|
| `POST /api/auth/register` | 사용자 생성 및 bcrypt 해시 저장 | 불필요 |
| `GET/POST /api/auth/[...nextauth]` | Auth.js 인증 처리 | Auth.js |
| `POST /api/feedback` | 개념 탐지, AI 피드백, 완료/뱃지/이력 저장 | 필요 |
| `GET /api/progress` | 완료 개념과 최근 피드백 50개 조회 | 필요 |
| `GET /api/badges` | 전체 뱃지와 사용자 획득 여부 조회 | 필요 |
| `GET /api/examples?conceptId=` | 정적 커리큘럼 예제 조회 | 불필요 |

## 5. 데이터 모델

- `users`: 사용자명, 비밀번호 해시, 역할, 표시 이름
- `concepts`: 16개 개념의 한/영문 이름, 순서, 설명
- `badges`: 개념과 1:1로 연결되는 뱃지
- `user_concept_clears`: 사용자-개념 완료 관계. 복합 unique index로 중복 방지
- `feedback_history`: 제출 코드, 출력, AI 피드백, 성공 여부, 탐지 개념 배열

`lib/db/seed.ts`가 개념과 뱃지 기준 데이터를 삽입한다. `db:push` 중심이며 저장소에는 버전 관리되는 migration 파일이 현재 없다.

## 6. 잘 구성된 부분

- 클라이언트가 보낸 개념 ID를 그대로 쓰지 않고 서버에서 코드를 다시 파싱한다.
- 사용자별 개념 완료에 unique index와 `onConflictDoNothing()`을 사용해 중복 획득을 방지한다.
- 비밀번호를 bcrypt로 해시하고 JWT에 필요한 최소 사용자 정보를 담는다.
- `robot` API가 이동 거리, 크기, 감정, 도형 등의 허용 범위를 검증한다.
- 애니메이션 큐를 최대 200개로 제한하고, 새 실행 시 이전 애니메이션을 execution ID로 중단한다.
- AI 호출 실패 시 학습 흐름을 유지할 fallback 메시지가 있다.
- 페이지와 API 양쪽에서 인증을 확인하며, DB 조회는 로그인 사용자 ID로 제한한다.
- TypeScript strict 모드이며 현재 프로덕션 타입 검사와 빌드를 통과한다.

## 7. 핵심 위험과 개선 우선순위

### P0 — 학습 완료 판정이 클라이언트 실행 결과를 신뢰함

`/api/feedback`은 개념 ID는 서버에서 다시 계산하지만 `isSuccess`, `stdout`, `stderr`는 요청 값을 신뢰한다. 로그인 사용자는 API를 직접 호출해 실행하지 않은 코드를 성공으로 제출하고 뱃지를 획득할 수 있다.

권장 방향:

1. 평가용 문제라면 서버의 격리된 실행 환경에서 코드를 재실행하고 테스트 케이스로 성공을 판정한다.
2. 자유 실습형이라 서버 실행이 과도하다면 “실행 성공”과 “검증된 학습 완료”를 별도 상태로 모델링한다.
3. 요청 스키마 검증, 코드 크기 제한, 사용자별 rate limit을 함께 적용한다.

### P0 — Python 무한 루프가 브라우저 UI를 멈출 수 있음

Pyodide 실행이 메인 스레드에서 수행된다. `while True` 또는 매우 큰 계산은 React UI와 중단 버튼까지 정지시킨다. `time.sleep`을 무효화해도 CPU 무한 루프는 막지 못한다.

권장 방향은 Pyodide를 Web Worker로 옮기고, 실행별 제한 시간을 둔 뒤 초과 시 worker를 종료·재생성하는 것이다. 패키지 로딩 허용 범위도 제한하는 편이 안전하고 예측 가능하다.

### P1 — 정규식 기반 개념 탐지의 오탐/누락

현재 파서는 Python AST가 아니라 원문 정규식으로 판정한다.

- 주석과 문자열 내부의 키워드도 개념으로 탐지할 수 있다.
- 모든 예제가 `import robot`을 포함하므로 모듈 개념이 거의 항상 함께 완료된다.
- `[]` 같은 패턴은 실제 리스트 문맥인지 구분하지 못한다.
- 연산자 정규식은 단항 연산, 복합 표현, 줄 경계에서 누락 가능성이 있다.
- 코드가 문법적으로 실패해도 탐지 결과 자체는 생성된다.

Pyodide의 Python `ast` 모듈로 AST를 생성하고 노드 유형에 따라 개념을 판정하는 방식이 적합하다. 교육용 내장 모듈인 `robot` import는 모듈 학습 판정에서 제외해야 한다.

### P1 — 입력 검증, 비용 및 남용 방어 부족

회원가입과 피드백 API에 런타임 스키마 검증이 없고 문자열 길이 상한도 충분하지 않다. 큰 코드/출력 전송은 DB 저장량과 Gemini 비용을 증가시킨다. 회원가입, 로그인, 피드백 API에 rate limit이나 계정 잠금 정책도 없다.

권장 조치:

- Zod 등으로 요청 구조와 타입을 검증
- 코드, stdout, stderr, 표시 이름의 최대 길이 지정
- AI에 보내는 출력 절단 및 프롬프트 경계 명확화
- IP/사용자 기준 rate limit과 사용량 관측 추가
- 비밀번호 최소 길이 강화 및 UI/API 규칙 통일

현재 회원가입 UI는 아이디 4자·비밀번호 6자 이상으로 안내하지만 API는 각각 3자·4자 이상을 허용한다.

### P1 — 자동 검증 체계 부재

테스트 파일과 테스트 스크립트가 없다. 특히 다음은 회귀 가능성이 높아 단위/통합 테스트가 필요하다.

- 16개 개념 판정의 positive/negative fixture
- `robot` API 경계값과 큐 제한
- 인증되지 않은 API 요청 차단
- 중복 완료 처리와 뱃지 획득
- Gemini 실패 시 fallback
- 실행 중 새 실행/리셋 시 애니메이션 취소

`npm run lint`는 ESLint 설정 파일이 없어 대화형 설정 프롬프트에서 중단된다. 또한 `next lint`는 폐기 예정이므로 ESLint flat config를 추가하고 스크립트를 `eslint .`로 바꾸는 것이 좋다.

### P2 — 오류 처리와 관측성

- `/api/progress`와 `/api/badges`는 DB 오류를 명시적으로 처리하지 않는다.
- 진행 화면의 병렬 fetch는 HTTP 상태를 확인하지 않아 오류가 빈 데이터처럼 보일 수 있다.
- 서버 로그는 `console.error` 위주이며 요청 ID, 사용자 범위, 지연 시간, AI/DB 오류 지표가 없다.
- 클라이언트는 Pyodide 로딩 오류 상태를 받지만 학습 화면에서 이를 충분히 노출하지 않는다.

공통 API 오류 형식, 화면 재시도 상태, 구조화 로그와 최소 운영 지표를 추가하는 것이 필요하다.

### P2 — 데이터 및 설정 유지보수성

- 총 개념 수 `16`이 API와 UI 여러 곳에 하드코딩되어 있다.
- 개념/뱃지 정보가 DB seed와 `lib/curriculum.ts`에 중복된다.
- 외래 키에 삭제 정책이 없어 사용자/개념 삭제 시 운영 절차가 불명확하다.
- migration 이력이 없어 환경 간 스키마 변경을 재현하고 검토하기 어렵다.
- `NEXTAUTH_SECRET` 등 필수 환경 변수 검증이 시작 시점에 없다.

개념 수는 DB 또는 단일 커리큘럼 정의에서 계산하고, 환경 변수는 서버 시작 시 검증하며, Drizzle migration을 저장소에서 관리하는 편이 좋다.

### P2 — 프런트엔드 구조와 접근성

- `LearnClient`와 일부 페이지가 큰 컴포넌트이며 인라인 스타일이 많아 변경 비용이 높다.
- Tailwind, 전역 CSS, 인라인 스타일이 혼용되어 디자인 토큰 관리가 어렵다.
- hover 효과를 DOM style 직접 변경으로 구현한 부분은 키보드 focus 상태와 일관되지 않다.
- 고정된 `100vh`, 넓은 가로 레이아웃, 진행 화면 8열 뱃지 그리드는 작은 화면 대응을 별도 검증해야 한다.

실행 컨트롤러 hook, 피드백 hook, 학습 단원 선택기, 작업 영역을 분리하고 공통 스타일/반응형 규칙을 정리하는 것이 적절하다.

### P3 — 외부 CDN 의존성

Pyodide와 Pretendard가 런타임 CDN에 의존한다. 네트워크 차단, CDN 장애, 학교망 정책, COEP/CORP 헤더 호환성에 따라 학습 화면이 동작하지 않을 수 있다. 버전은 Pyodide URL에 고정되어 있지만 무결성 검증과 자체 호스팅 전략은 없다.

핵심 자산은 자체 호스팅 또는 검증된 fallback을 고려하고, 실제 배포 도메인에서 cross-origin isolation과 외부 폰트/패키지 로딩을 확인해야 한다.

## 8. 빌드 및 품질 확인 결과

| 항목 | 결과 |
|---|---|
| `npm run build` | 성공 |
| TypeScript 검사 | Next.js 빌드 과정에서 성공 |
| 정적 페이지 생성 | 13개 생성 성공 |
| `npm run lint` | 실패: ESLint 설정이 없어 대화형 초기 설정 요청 |
| 자동 테스트 | 스크립트 및 테스트 파일 없음 |

빌드 시 확인된 주요 번들 크기는 `/learn` 자체 22.7 kB, 해당 경로의 First Load JS 174 kB, 공통 First Load JS 103 kB, Middleware 161 kB다. Pyodide 런타임은 CDN에서 별도로 로드되므로 이 수치에 포함되지 않는다.

## 9. 실행에 필요한 설정

코드상 최소 필요 환경 변수:

```dotenv
NEON_DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
AUTH_SECRET=...
```

Auth.js 배포 환경에 따라 호스트 관련 설정도 확인해야 한다. 기본 준비 순서는 다음과 같다.

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

DB seed가 실행되지 않으면 개념명 조회, 뱃지 매핑, 진행 화면 데이터가 정상적으로 구성되지 않는다.

## 10. 권장 개선 순서

1. Pyodide를 Web Worker로 격리하고 실행 timeout/강제 종료 구현
2. 학습 완료의 신뢰 모델 결정 후 서버 검증 또는 “자유 실행/검증 완료” 분리
3. 정규식 파서를 AST 기반으로 교체하고 `import robot` 오탐 제거
4. API 스키마 검증, 크기 제한, rate limit, AI 입력 절단 추가
5. 개념 탐지·robot API·인증/진행 API 테스트 작성
6. ESLint flat config와 CI에 build/lint/test 단계 추가
7. 커리큘럼 단일 소스화, 하드코딩된 `16` 제거, migration 도입
8. 오류 UI·관측성·반응형·접근성 개선

## 11. 종합 평가

프로토타입으로서 “코드 작성 → 즉시 실행 → 캐릭터 반응 → AI 피드백 → 성장 기록”의 제품 핵심 루프가 구현되어 있고, 빌드 가능한 상태다. 가장 큰 기술적 과제는 기능 추가보다 실행 격리와 학습 판정의 신뢰성이다. 두 문제를 먼저 해결한 뒤 탐지 정확도와 테스트 체계를 보강하면 실제 수업 환경에서 안정적으로 확장할 수 있는 기반이 된다.
