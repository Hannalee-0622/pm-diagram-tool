# Project Progress Map

**English / 한국어**

---

## Project Overview / 프로젝트 개요

**EN:**
Project Progress Map is a web application that generates interactive flow-chart diagrams based on user-provided keywords and date ranges. It uses OpenAI’s GPT API to plan out project tasks, structures them as nodes, and renders them with React Flow. Users can edit, connect, and annotate tasks in real time, then save or share their diagrams.

**KR:**
Project Progress Map는 사용자가 입력한 키워드와 기간을 바탕으로 OpenAI GPT API를 이용해 프로젝트 업무 계획을 생성하고, 이를 React Flow로 시각화하는 웹 애플리케이션입니다. 노드를 추가·수정·연결하며 실시간으로 다이어그램을 편집하고 저장하거나 공유할 수 있습니다.

---

## Features / 주요 기능

* **Automatic Diagram Generation / 자동 다이어그램 생성**

  * GPT API 호출로 업무 흐름을 계획하고 노드/엣지 스펙을 생성
* **Interactive Editing / 상호작용 편집**

  * 노드 추가·삭제·이동, 엣지 연결, 상태(진행중/완료) 변경
* **Comments & Metadata / 코멘트 & 메타데이터**

  * 각 노드에 코멘트 입력, 모델명·역할 등의 속성 표시
* **Bi-lingual UI / 한·영 인터페이스**

  * 한국어(`ko`)와 영어(`en`) 모드 지원
* **Persistent Storage / 영속화**

  * Django 백엔드 + SQLite/PostgreSQL로 다이어그램 스펙 저장
* **Frontend-Backend Unified Deployment / 통합 배포**

  * Docker, Fly.io, Netlify 등으로 프론트·백엔드 함께 배포 가능

---

## Prerequisites / 요구사항

* **Node.js** ≥ 18.x
* **npm** 또는 **yarn**
* **Python** ≥ 3.11
* **pip**, **virtualenv**
* **Docker** (optional, for containerized deployment)
* **Fly CLI** (optional, for Fly.io 배포)

---

## Installation / 설치

1. **Clone the repository / 저장소 복제**

   ```bash
   git clone https://github.com/your-username/pm-diagram-tool.git
   cd pm-diagram-tool
   ```

2. **Backend setup**

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate       # macOS/Linux
   # .venv\Scripts\activate        # Windows
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Frontend setup**

   ```bash
   cd ../frontend
   npm ci                          # or yarn install
   ```

---

## 🔧 Configuration / 설정

* 프로젝트 최상위 디렉터리에 `.env` 파일 생성:

  ```dotenv
  # OpenAI API
  OPENAI_API_KEY=sk-your_openai_key

  # Django
  SECRET_KEY=django-insecure-your_secret_key
  DEBUG=False
  ALLOWED_HOSTS=localhost,127.0.0.1,my-domain.com
  ```

* **Vite** API 프록시 설정 (`frontend/vite.config.js`):

  ```js
  export default defineConfig({
    base: "/",
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        }
      }
    }
  })
  ```

---

## Running Locally / 로컬 실행

1. **Django 서버 기동**

   ```bash
   cd backend
   source .venv/bin/activate
   python manage.py migrate
   python manage.py collectstatic --noinput
   python manage.py runserver
   ```

2. **React 개발 서버**

   ```bash
   cd frontend
   npm run dev                   # localhost:5173
   ```

3. 브라우저에서 [**http://localhost:5173**](http://localhost:5173) (또는 Django에서 서빙할 경우 [http://localhost:8000](http://localhost:8000)) 접속

---

## Build & Deployment / 빌드 & 배포

### Docker

```bash
docker build -t pm-diagram-tool:latest .
docker run --rm -p 8080:8080 \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  -e SECRET_KEY=$SECRET_KEY \
  pm-diagram-tool:latest
```

### Fly.io

```bash
flyctl launch               # app 생성
flyctl secrets set \
  OPENAI_API_KEY=$OPENAI_API_KEY \
  SECRET_KEY=$SECRET_KEY \
  DEBUG=False \
  ALLOWED_HOSTS="*"

flyctl deploy
```

---

## Directory Structure / 디렉토리 구조

```
pm-diagram-tool/
├─ backend/                  # Django project
│  ├─ backend/
│  ├─ api/
│  ├─ manage.py
│  └─ requirements.txt
├─ frontend/                 # React + Vite project
│  ├─ src/
│  ├─ public/
│  ├─ package.json
│  └─ vite.config.js
├─ .env.example
├─ Dockerfile
└─ README.md
```

---

## Environment Variables / 환경 변수

| 변수               | 설명                               |
| ---------------- | -------------------------------- |
| `OPENAI_API_KEY` | OpenAI API 키                     |
| `SECRET_KEY`     | Django `SECRET_KEY`              |
| `DEBUG`          | `True`/`False` (프로덕션에서는 `False`) |
| `ALLOWED_HOSTS`  | 콤마로 구분된 호스트 리스트                  |

---

## License

This project is licensed under the **MIT License**.
