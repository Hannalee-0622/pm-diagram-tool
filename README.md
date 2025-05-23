# Project Progress Map

**English / 한국어**

---

## Project Overview / 프로젝트 개요

**EN:**
Project Progress Map is a web application that generates interactive flow-chart diagrams based on user-provided keywords and date ranges. It uses OpenAI’s GPT API to plan out project tasks, structures them as nodes, and renders them with React Flow. Users can edit, connect, and annotate tasks in real time, then save or share their diagrams.

**KR:**
Project Progress Map는 사용자가 입력한 키워드와 기간을 바탕으로 OpenAI GPT API를 이용해 프로젝트 업무 계획을 생성하고, 이를 React Flow로 시각화하는 웹 애플리케이션입니다. 노드를 추가·수정·연결하며 실시간으로 다이어그램을 편집하고 저장하거나 공유할 수 있습니다.

---

## 주요 기능 (Features)

* **자동 다이어그램 생성 / AI‑Powered Diagram Generation**
  입력된 키워드와 기간에 따라 AI가 역할(Role)과 업무(Task) 스펙을 생성합니다.
  Generates a JSON spec of roles and tasks based on the provided keyword and date range.

* **REST API 통신 / REST API Integration**
  백엔드와 통신하여 생성된 다이어그램 스펙을 저장하고 불러옵니다.
  Uses REST endpoints to save and fetch diagram specs in JSON format.

* **시각적 편집 / Interactive Visual Editing**
  React Flow 기반의 드래그 & 드롭, 엣지 추가/삭제, Dagre 레이아웃 자동 조정 기능 지원.
  Provides an interactive React Flow canvas with drag-and-drop nodes, edge management, and auto-layout via Dagre.

* **노드 상태 관리 / Node State Management**
  진행 중(In‑Progress) 및 완료(Complete) 상태를 색상과 아이콘으로 시각화하며, 각 노드에서 상태 변경, 수정, 삭제, 코멘트 입력이 가능합니다.
  Visually distinguishes node states (In‑Progress, Complete) with color and icons; supports editing, deleting, and commenting on nodes.

* **다국어 지원 / Multilingual Support**
  UI 문구(버튼, 에러 메시지 등)를 한국어(ko)와 영어(en)로 표시하여 다양한 사용자 환경을 제공합니다.
  Switches UI labels (buttons, alerts, messages) between Korean and English based on user selection.

* **링크 복사 및 공유 / Link Copy & Sharing**
  현재 다이어그램 페이지 URL을 클립보드에 복사하여 간편하게 공유할 수 있습니다.
  Copies the current diagram page URL to the clipboard for easy sharing.

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
