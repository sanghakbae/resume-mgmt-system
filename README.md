# Resume Management System

배상학 이력서를 한 곳에서 관리하는 Vite + React 기반 커리어 관리 시스템입니다.  
공개 보기, 편집 모드, 회사/수행 업무 관리, 방문 로그, 폰트 설정, 사진 보정이 모두 포함됩니다.

## 한눈에 보기

- 공개 이력서 화면과 편집 화면을 같은 데이터로 연결
- Google 로그인 기반 접근 제어
- `totoriverce@gmail.com`만 로그인 및 편집 가능
- 사진 업로드 후 실제 출력 경계 확인 및 위치 보정
- 회사 추가 / 수행 업무 추가를 좌우 분할로 관리
- 방문 로그를 테이블로 확인
- 전역 폰트 설정을 브라우저에 저장

## 주요 기능

### 이력서 편집

- 기본 정보 편집
  - 이름
  - 직무 / 역할
  - 소개
  - 사진
  - 학력
  - 경력
  - 전문분야
  - 자격 사항
  - 병역 사항
  - 산업 군
- 사진 업로드 후 좌우 / 상하 / 확대 슬라이더로 보정
- 사진 미리보기에서 실제 출력 경계를 표시
- 입력 내용은 작업공간에 자동 저장

### 회사 관리

- 회사 추가 / 수정 / 삭제
- 왼쪽 입력 폼, 오른쪽 등록된 회사 목록의 좌우 배치
- 회사 요약과 핵심 업무를 함께 관리

### 수행 업무 관리

- 수행 업무 추가 / 수정 / 삭제
- 프로젝트 URL 입력 시 링크 썸네일 카드 표시
- 태그 자동 추출은 실제 근거가 있을 때만 반영
- 공개 보기에서 회사별 대표 프로젝트 카드로 묶어 표시

### 공개 보기

- 공개 이력서 상단 프로필 카드
- 경력 대시보드
- 회사별 대표 프로젝트 목록
- 핵심 역량 분포
- 역할 변화 타임라인
- 대표 성과 하이라이트
- 방문 회수 표시

### 방문 로그

- 메뉴에서 `수행 업무 추가` 아래에 `방문 로그` 제공
- 브라우저 로컬 저장소 기준 방문 기록을 테이블로 확인
- 열 구성
  - 방문 시각
  - 모드
  - 사용자
  - 대상
  - IP 자리
- IP는 현재 서버 연동용 자리만 있고, 실제 값은 백엔드/프록시 연동 시 주입해야 함

### 설정

- `방문 로그` 아래에 `설정` 메뉴 제공
- 전역 폰트 선택 가능
  - KorPub 돋움체
  - Pretendard
  - Noto Sans KR
  - 맑은 고딕
  - Apple SD Gothic Neo
- 선택값은 브라우저에 저장

### 접근 제어

- Google 로그인 사용
- `totoriverce@gmail.com`만 로그인 및 편집 가능
- 다른 계정은 로그인 단계에서 중앙 메시지로 차단
- 편집/관리 권한은 단일 허용 계정으로 고정

## 로컬 실행

```bash
npm install
npm run dev
```

Vite 기본 실행만으로 충분합니다.  
필요하면 `--host` 또는 `--port`를 추가해서 별도 포트로 띄울 수 있습니다.

## 빌드

```bash
npm run build
```

## 환경 변수

`.env`를 만들어 아래 값을 설정합니다.

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_ENABLE_SUPABASE=false
VITE_PUBLIC_RESUME_MODE=false
VITE_ADMIN_EMAILS=allowed-admin@example.com
VITE_EDITOR_EMAILS=allowed-editor@example.com
```

### 변수 설명

- `VITE_GOOGLE_CLIENT_ID`
  - Google One Tap / OAuth 로그인에 사용
- `VITE_ENABLE_SUPABASE`
  - `true`일 때 Supabase 세션과 저장소를 사용
  - `false`일 때는 브라우저 로컬 작업공간을 사용
- `VITE_PUBLIC_RESUME_MODE`
  - `true`면 공개 보기 중심 모드
  - `false`면 일반 편집 모드
- `VITE_ADMIN_EMAILS`
  - 로컬 편집 모드에서 허용할 관리자 이메일 목록
- `VITE_EDITOR_EMAILS`
  - 공개 모드에서 편집을 허용할 이메일 목록

## 권한 동작

- 로컬 편집 모드
  - `totoriverce@gmail.com`만 로그인 및 편집 가능
- 공개 모드
  - `totoriverce@gmail.com`만 로그인 및 편집 가능
  - 그 외 계정은 로그인 자체가 차단됨
- 허용되지 않은 계정으로 로그인하면 중앙 메시지로 차단

## 현재 UI 구조

- 상단 헤더
  - 로그인 상태
  - 편집 / 공개 보기 전환
  - 샘플 복원
  - 로그아웃
- 왼쪽 사이드바
  - 대시보드
  - 기본 정보
  - 회사 추가
  - 수행 업무 추가
  - 방문 로그
  - 설정
- 오른쪽 본문
  - 선택한 섹션만 렌더링

## 프로젝트 구조

- `src/App.tsx`
  - 화면 라우팅, 로그인 처리, 권한 제어, 방문 로그, 폰트 설정
- `src/components/auth`
  - 로그인 화면과 Google 로그인 버튼
- `src/components/resume`
  - 프로필, 회사, 수행 업무, 공개 보기, 대시보드 UI
- `src/hooks`
  - Google Auth, 작업공간 저장 로직
- `src/lib`
  - 사진 보정, 요약 생성, 태그 추출, Supabase 연동
- `src/data/resume.ts`
  - 기본 이력서 데이터와 카드 메타정보
- `src/types/resume.ts`
  - 주요 타입 정의

## 참고

- PDF / HTML 내보내기 버튼은 현재 제거되어 있습니다.
- 인쇄 스타일은 남아 있지만, 전용 export 버튼은 없습니다.
- 이 프로젝트는 배상학 이력서를 기준 데이터로 사용합니다.
