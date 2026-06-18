# 파이썬 인터랙티브 학습 서비스 — 개발 명세서 (for Claude Design)

> 이 문서는 Claude Design이 UI/UX 디자인 작업을 하기 위해 필요한 모든 기술 정보를 담고 있습니다.

---

## 1. 프로젝트 개요

**서비스명**: 파이썬 인터랙티브 학습 서비스  
**대상 사용자**: 고등학교 1학년 여학생 (15~16세), 정보 교과 파이썬 수업 수강생  
**목적**: 텍스트 출력 중심의 파이썬 학습에서 벗어나, AI 로봇 캐릭터가 코드 실행에 반응하는 인터랙티브 웹 서비스

**핵심 경험**:
- 학생이 파이썬 코드를 작성하고 실행하면 → 오른쪽의 2D AI 로봇이 코드 개념에 맞게 애니메이션으로 반응
- Gemini 2.5 Flash AI가 로봇 말풍선으로 실시간 피드백 (성공 시 칭찬+설명, 오류 시 힌트)
- 개념을 처음 성공하면 뱃지 지급 + 축하 애니메이션 (게이미피케이션)

---

## 2. 기술 스택 및 디자인 제약

| 항목 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | Next.js 15 App Router | |
| 언어 | TypeScript | |
| 스타일링 | **Tailwind CSS v3** | 인라인 클래스 방식 |
| 아이콘 | **Lucide React 전용** | 이모지 절대 사용 금지 |
| 애니메이션 | **Framer Motion** | 로봇 캐릭터 애니메이션 |
| 폰트 | Geist Sans / Geist Mono (Next.js 기본) | |
| 배포 | Vercel | |

**디자인 필수 규칙**:
- 이모지(emoji) 사용 전면 금지 — Lucide 아이콘으로 대체
- Tailwind CSS 유틸리티 클래스만 사용 (별도 CSS 파일 최소화)
- 다크 테마 전용 (라이트 모드 없음)
- 한국어 UI (모든 텍스트는 한국어)

---

## 3. 현재 색상 팔레트 (globals.css 기준)

```css
/* CSS 변수 */
--background:   #0f1117   /* 최외곽 배경 */
--foreground:   #e2e8f0   /* 기본 텍스트 */
--panel-bg:     #1a1d27   /* 패널/카드 배경 */
--border-color: #2d3148   /* 테두리 */
--accent:       #4f8ef7   /* 강조색 (파랑) */
```

**Tailwind 색상 사용 현황**:
```
배경 계층:
  #0f1117  → 최외곽 배경 (bg-[#0f1117])
  #1a1d27  → 패널, 헤더, 툴바 배경 (bg-[#1a1d27])
  #131620  → 로봇 패널 배경 (bg-[#131620])
  #0d1117  → 코드 에디터, 실행결과 배경 (bg-[#0d1117])

테두리:
  #2d3148  → 모든 구분선 (border-[#2d3148])

텍스트 계층:
  text-white       → 강조 제목
  text-slate-200   → 주요 본문
  text-slate-300   → 일반 레이블
  text-slate-400   → 보조 설명
  text-slate-500   → 비활성/힌트
  text-slate-600   → 비활성 아이콘

강조색:
  blue-600   → 주 액션 버튼, 선택 상태, 로봇 몸통
  blue-500   → 호버 상태
  blue-400   → 로딩 스피너, 보조 강조
  green-600  → 실행 버튼
  green-500  → 실행 버튼 호버
  green-400  → 성공 출력 텍스트
  red-400    → 에러 출력 텍스트
  yellow-400 → 별 아이콘, 뱃지 축하 별
  yellow-500 → 변수 부유 텍스트
  purple-400 → 피드백 히스토리 아이콘
```

---

## 4. 파일 구조 (디자인 관련 파일만)

```
app/
├── globals.css             ← 전역 스타일 (Tailwind base + 커스텀 CSS)
├── layout.tsx              ← 루트 레이아웃
├── login/page.tsx          ← 로그인 페이지 (단독 화면)
├── register/page.tsx       ← 회원가입 페이지 (단독 화면)
├── learn/LearnClient.tsx   ← 메인 학습 화면 (가장 중요한 화면)
└── progress/ProgressClient.tsx  ← 성장 기록 화면

components/
├── layout/
│   └── Header.tsx          ← 상단 헤더 (모든 페이지 공통)
├── editor/
│   ├── CodeEditor.tsx      ← CodeMirror 에디터 래퍼
│   └── OutputPanel.tsx     ← 실행 결과 출력창
├── robot/
│   ├── RobotCharacter.tsx  ← SVG 로봇 캐릭터 (핵심)
│   ├── RobotSpeechBubble.tsx   ← AI 피드백 말풍선
│   ├── VariableFloat.tsx   ← 변수값 머리 위 부유
│   └── ClassCharacters.tsx ← 클래스 감지 시 전사/궁수 아이콘
└── badges/
    ├── BadgeCard.tsx        ← 뱃지 카드 (획득/미획득 상태)
    └── BadgeCelebration.tsx ← 뱃지 획득 축하 전체화면 오버레이
```

---

## 5. 페이지별 레이아웃 명세

### 5-1. 로그인 페이지 `/login`

**현재 구조**:
```
전체 화면 중앙 정렬 (min-h-screen flex items-center justify-center)
  └── max-w-sm 카드
      ├── 상단: 로봇 아이콘 (Bot, Lucide) + 서비스명 + 부제
      └── 카드 내부
          ├── 제목: "로그인"
          ├── 에러 메시지 박스 (조건부)
          ├── 아이디 입력 필드
          ├── 비밀번호 입력 필드
          ├── 로그인 버튼 (파란색, full width)
          └── 회원가입 링크
```

**컴포넌트 상태**:
- 로딩: 버튼 내 Loader2 스피너 애니메이션
- 에러: 빨간 배경 박스 (bg-red-500/10, border-red-500/30, text-red-400)

---

### 5-2. 회원가입 페이지 `/register`

로그인과 동일한 레이아웃. 필드: 닉네임(선택) + 아이디 + 비밀번호.

---

### 5-3. 메인 학습 화면 `/learn` (가장 중요)

**전체 레이아웃**: `h-screen flex flex-col`

```
┌────────────────────────── Header (h-14) ──────────────────────────┐
│  [Bot 아이콘] 파이썬 학습 서비스    [학생이름] [성장기록] [로그아웃] │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─── 단원 탭 바 (스크롤 가능) ──────────────────────────────────┐ │
│  │ 단원: [출력] [변수] [산술연산자] [비교연산자] ... (16개) │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──── 코드 에디터 (55%) ─────┐  ┌─── 로봇 패널 (45%) ───────────┐ │
│  │                            │  │                               │ │
│  │  CodeMirror Python 에디터  │  │  [말풍선 영역 min-h:70px]    │ │
│  │  (One Dark 테마)           │  │                               │ │
│  │  flex-1 overflow-hidden    │  │  [SVG 로봇 캐릭터 150px]      │ │
│  │                            │  │                               │ │
│  ├─────────────────────────── │  │  [전사/궁수 미니 캐릭터]       │ │
│  │  실행 결과 (h-28)          │  │                               │ │
│  │  green=성공 / red=에러     │  │                               │ │
│  ├─────────────────────────── │  ├─────────────────────────────  │ │
│  │  [실행▶] [예제] [초기화]   │  │  뱃지 미니 그리드 (8×2)       │ │
│  └────────────────────────────┘  └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

[뱃지 획득 축하 오버레이 - 조건부 전체화면]
```

**단원 탭 버튼**:
- 선택됨: `bg-blue-600 text-white`
- 미선택: `text-slate-400 hover:text-white hover:bg-white/5`
- 크기: `text-xs px-2 py-0.5 rounded`

**실행 버튼**: `bg-green-600` + Play 아이콘  
**예제 불러오기**: `bg-slate-700` + BookOpen 아이콘  
**초기화**: 텍스트만 (`text-slate-500`) + RefreshCw 아이콘

---

### 5-4. 성장 기록 페이지 `/progress`

**전체 구조**:
```
┌──── 뒤로가기 헤더 ────────────────────────────────────────────────┐
│  ← 학습으로 돌아가기                                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  max-w-3xl mx-auto px-4 py-8  (3개 섹션)                          │
│                                                                    │
│  ┌── 학습 진행률 ──────────────────────────────────────────────┐   │
│  │  [TrendingUp 아이콘] 학습 진행률                             │   │
│  │  N개 / 16개 개념 완료                        [N%]           │   │
│  │  ████████████░░░░ 프로그레스 바                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌── 획득한 뱃지 ──────────────────────────────────────────────┐   │
│  │  [★] 획득한 뱃지 (N/16)                                     │   │
│  │  ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐          │   │
│  │  │ 획득││ 획득││잠금 ││잠금 ││잠금 ││잠금 ││잠금 ││잠금 │    │   │
│  │  └────┘└────┘└────┘└────┘└────┘└────┘└────┘└────┘          │   │
│  │  (4열 모바일 / 8열 PC, 16개 총)                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌── AI 피드백 기록 ───────────────────────────────────────────┐   │
│  │  [MessageSquare 아이콘] AI 피드백 기록                       │   │
│  │  ┌─ 피드백 카드 ──────────────────────────────────────────┐ │   │
│  │  │ [성공/오류 배지]                        [날짜]          │ │   │
│  │  │ 코드 스니펫 (최대 100자, monospace)                     │ │   │
│  │  │ AI 피드백 텍스트                                        │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. 컴포넌트 명세

### 6-1. Header (`components/layout/Header.tsx`)

```tsx
// Props: 없음 (useSession으로 유저 정보 자체 로드)

// 구성 요소
- 좌: Bot 아이콘(16px) + "파이썬 학습 서비스" (font-bold text-sm)
- 우: 학생 이름(text-slate-400 text-sm) + 성장기록 링크(TrendingUp 아이콘) + 로그아웃(LogOut 아이콘)
- 높이: h-14
- 배경: bg-[#1a1d27] border-b border-[#2d3148]
```

---

### 6-2. RobotCharacter (`components/robot/RobotCharacter.tsx`)

```tsx
interface RobotCharacterProps {
  state: RobotState;  // "idle" | "talking" | "walking" | "jumping" | "headShake" | "celebrating" | "error"
  size?: number;      // 기본값 140px
}
```

**SVG 구조** (viewBox="0 0 100 140"):
```
안테나 (선 + 원, 깜빡임 애니메이션)
머리  (rect rx=8, 40×32px)
  └── 눈 두 개 (원, 동공)
  └── 입 (path, 웃음/찡그림)
목    (rect rx=3)
몸통  (rect rx=10, 52×42px)
  └── 스크린 (rect, 텍스트 라인 3개)
  └── 가슴 표시등 (원, 깜빡임)
왼팔  (rect rx=6 + 원)
오른팔 (rect rx=6 + 원)
왼다리 (rect rx=7 + 신발 rect)
오른다리 (rect rx=7 + 신발 rect)
```

**상태별 색상**:
- 기본: `bodyColor=#3b82f6(blue-500)`, `headColor=#2563eb(blue-600)`, `eyeColor=#93c5fd`
- 에러: `bodyColor=#ef4444(red-500)`, `headColor=#dc2626(red-600)`, `eyeColor=#fca5a5`

**8가지 애니메이션 상태** (Framer Motion):
- `idle`: y 진동 (breathing)
- `talking`: 머리 끄덕임 + 눈 깜빡임 + 스크린 텍스트 점멸
- `walking`: x 이동 + 다리 교차 회전 (steps prop에 따라 반복수 결정)
- `jumping`: y -50px 점프 + squash 스케일
- `headShake`: x 좌우 3회
- `celebrating`: 전신 rotate + scale + 눈 빠르게 깜빡임
- `error`: x 진동 (headShake) + 빨간 tint

---

### 6-3. RobotSpeechBubble (`components/robot/RobotSpeechBubble.tsx`)

```tsx
interface RobotSpeechBubbleProps {
  text: string;    // AI 피드백 텍스트
  visible: boolean;
}
```

- `AnimatePresence` + Framer Motion (scale 0.9 → 1 진입/퇴장)
- 타이프라이터 효과: 25ms/글자 속도
- CSS `.speech-bubble-tail::after` 로 아래쪽 말풍선 꼬리
- 스타일: `bg-slate-800 border-slate-600 rounded-2xl`, max-w-xs
- 커서: `w-1 h-3 bg-blue-400 animate-pulse` (타이핑 중)

---

### 6-4. VariableFloat (`components/robot/VariableFloat.tsx`)

```tsx
interface VariableFloatProps {
  varName?: string;   // 변수명
  varValue?: string;  // 변수값
  visible: boolean;
}
```

- 로봇 머리 위 `-top-10` 절대 위치
- y 부유 애니메이션 (1.5s 루프)
- 스타일: `bg-yellow-500/20 border-yellow-500/50 text-yellow-300 font-mono text-xs`

---

### 6-5. ClassCharacters (`components/robot/ClassCharacters.tsx`)

```tsx
interface ClassCharactersProps {
  characters: ("warrior" | "archer")[];
  visible: boolean;
}
```

- 클래스 정의 코드 감지 시 전사/궁수 미니 캐릭터 등장
- 전사: Sword 아이콘, `text-red-400`, `bg-red-500/20 border-red-500/40`
- 궁수: Zap 아이콘, `text-yellow-400`, `bg-yellow-500/20 border-yellow-500/40`
- 오른쪽에서 슬라이드인 (`x: 60 → 0`)

---

### 6-6. BadgeCard (`components/badges/BadgeCard.tsx`)

```tsx
interface BadgeCardProps {
  nameKo: string;     // "출력 마스터" 등
  iconName: string;   // Lucide 아이콘명
  colorClass: string; // "text-green-500" 등
  earned: boolean;    // 획득 여부
  size?: "sm" | "md"; // sm=학습화면, md=성장기록화면
}
```

- 획득: `bg-slate-800 border-slate-600` + 색상 아이콘
- 미획득: `bg-slate-900/50 border-slate-700/50 opacity-50` + Lock 아이콘 (gray)
- sm 크기: `w-8 h-8` 아이콘 영역, `p-2`
- md 크기: `w-10 h-10` 아이콘 영역, `p-3`

---

### 6-7. BadgeCelebration (`components/badges/BadgeCelebration.tsx`)

```tsx
interface BadgeCelebrationProps {
  badgeIds: number[];   // 새로 획득한 뱃지 ID 배열
  onClose: () => void;
}
```

- `fixed inset-0 z-50` 전체화면 오버레이
- `bg-black/60 backdrop-blur-sm`
- 카드: `bg-slate-800 border-slate-600 rounded-3xl`
- 별 아이콘 + 제목 + 뱃지 카드들 (scale spring 애니메이션)
- 4초 후 자동 닫힘

---

### 6-8. OutputPanel (`components/editor/OutputPanel.tsx`)

```tsx
interface OutputPanelProps {
  output: string;
  error: string;
  hasRun: boolean;
}
```

- 미실행: Terminal 아이콘 + "실행 버튼을 눌러보세요" (text-slate-600)
- 성공: `text-green-400` (monospace pre)
- 에러: `text-red-400` (monospace pre)
- 높이: `h-28`

---

## 7. 뱃지 16개 데이터

| ID | 개념 | 뱃지명 | Lucide 아이콘 | Tailwind 색상 |
|---|---|---|---|---|
| 1 | 출력 | 출력 마스터 | Terminal | text-green-500 |
| 2 | 변수 | 변수 마스터 | Variable | text-blue-500 |
| 3 | 산술 연산자 | 연산 마스터 | Calculator | text-yellow-500 |
| 4 | 비교 연산자 | 비교 마스터 | Scale | text-orange-500 |
| 5 | 할당 연산자 | 할당 마스터 | Equal | text-amber-500 |
| 6 | 논리 연산자 | 논리 마스터 | GitBranch | text-red-500 |
| 7 | 숫자형 | 숫자 마스터 | Hash | text-teal-500 |
| 8 | 문자형 | 문자 마스터 | Type | text-cyan-500 |
| 9 | 리스트 | 리스트 마스터 | List | text-sky-500 |
| 10 | 불리언 | 논리값 마스터 | ToggleLeft | text-violet-500 |
| 11 | 조건문 | 조건 마스터 | GitMerge | text-pink-500 |
| 12 | for 반복문 | for 마스터 | RotateCcw | text-emerald-500 |
| 13 | while 반복문 | while 마스터 | RefreshCw | text-lime-500 |
| 14 | 함수 | 함수 마스터 | FunctionSquare | text-indigo-500 |
| 15 | 클래스 | 클래스 마스터 | Boxes | text-purple-500 |
| 16 | 모듈 | 모듈 마스터 | Package | text-orange-600 |

---

## 8. 로봇 애니메이션 트리거 조건

코드 실행 시 `lib/python-parser.ts`가 코드를 분석하여 개념을 감지하고, 아래 우선순위에 따라 주 애니메이션을 결정합니다.

| 우선순위 | 개념 | 로봇 반응 | 추가 UI |
|---|---|---|---|
| 1 | class 정의 | celebrating | ClassCharacters 등장 |
| 2 | def 함수 | jumping | — |
| 3 | for 반복문 | walking | 걸음 수 = range(N), 최대 10 |
| 4 | if 조건문 | jumping | — |
| 5 | while 반복문 | walking | 4걸음 고정 |
| 6 | print | talking | 말풍선에 stdout 표시 |
| 7 | 변수 할당 | talking | VariableFloat (변수명=값) |
| — | 오류 발생 | error | 빨간 tint + headShake |

---

## 9. 상태 흐름

```
[학생이 코드 입력]
       ↓
[실행 버튼 클릭]
       ↓
[Pyodide로 브라우저에서 Python 실행] → stdout/stderr 캡처
       ↓
[python-parser.ts로 개념 감지]
       ↓
[POST /api/feedback] → Gemini 2.5 Flash API 호출
       ↓
    성공 여부?
   ↙          ↘
성공             오류
로봇 애니메이션    error 상태
칭찬 말풍선        힌트 말풍선
뱃지 체크         —
  ↓
신규 개념?
  ↓ 예
축하 애니메이션 + BadgeCelebration 오버레이
```

---

## 10. API 엔드포인트 요약

| 메서드 | 경로 | 역할 | 인증 |
|---|---|---|---|
| POST | `/api/auth/register` | 회원가입 | 없음 |
| POST/GET | `/api/auth/[...nextauth]` | 로그인/로그아웃 | — |
| POST | `/api/feedback` | 실행결과 → Gemini 피드백 + 뱃지 | 필요 |
| GET | `/api/badges` | 내 뱃지 목록 | 필요 |
| GET | `/api/progress` | 학습 진행률 + 피드백 이력 | 필요 |
| GET | `/api/examples?conceptId=N` | 개념별 예제 코드 | 없음 |

---

## 11. DB 테이블 요약

```sql
users               id, username, password_hash, role, display_name
concepts            id, name_ko, name_en, order_index, description  (시드 16행)
badges              id, concept_id, name_ko, icon_name, color_class (시드 16행)
user_concept_clears id, user_id, concept_id, cleared_at             (최초 1회만)
feedback_history    id, user_id, concept_ids[], code_submitted, output_text, ai_feedback, is_success, created_at
```

---

## 12. 디자인 시 주의사항

1. **로봇 SVG**: `RobotCharacter.tsx`의 인라인 SVG를 교체하거나 개선할 수 있습니다. 단, `state` prop에 따라 Framer Motion variants가 각 `<motion.g>` 요소에 적용되므로 SVG 그룹 구조(`head`, `body`, `left-arm`, `right-arm`, `left-leg`, `right-leg`, `antenna`)를 유지해야 합니다.

2. **말풍선 꼬리**: `globals.css`의 `.speech-bubble-tail::after`로 CSS로 구현되어 있습니다. 디자인 변경 시 이 클래스도 함께 수정하세요.

3. **CodeMirror 에디터**: `CodeEditor.tsx` 내 `EditorView.theme()`으로 커스텀 스타일 적용 중. 에디터 배경/폰트 변경은 이 객체를 수정합니다.

4. **단원 탭 스크롤**: 16개 단원 탭이 가로 스크롤됩니다. 모바일에서 스크롤 가능하도록 `overflow-x-auto`가 적용되어 있습니다.

5. **반응형**: 현재 태블릿(가로 화면) 이상을 주 타겟으로 합니다. 교실에서 가로 화면으로 사용하는 시나리오가 메인입니다.

6. **Pyodide 로딩**: 첫 진입 시 10~30초 로딩이 필요합니다. 로봇 패널 위에 로딩 오버레이가 표시됩니다. 이 UX를 개선하는 디자인을 권장합니다.

---

## 13. 수정 가능한 디자인 항목

디자인 에이전트가 자유롭게 개선할 수 있는 항목들:

- [ ] 전체 색상 팔레트 개선 (다크 테마 유지 필수)
- [ ] 로봇 SVG 캐릭터 리디자인 (구조는 유지, 비주얼 개선)
- [ ] 말풍선 스타일 (현재 단순 사각형)
- [ ] 뱃지 카드 디자인
- [ ] 축하 오버레이 (BadgeCelebration) 파티클/이펙트
- [ ] 진행률 바 스타일
- [ ] 버튼 스타일 통일
- [ ] 헤더 디자인
- [ ] 단원 탭 선택 스타일
- [ ] 피드백 히스토리 카드 스타일
- [ ] 로딩 화면 디자인 (Pyodide 로딩 중)
- [ ] 전반적인 레이아웃 여백/폰트 크기 조정
