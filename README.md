# Whipped F4 🧁✨

**Whipped F4**는 친환경 원료들을 사용한 폼클렌징을 구매할 수 있는 사이트이며, 개인에 맞게 성분 조합을 바꿀 수 있는 DIY 상품도 판매합니다.

---
## 🚀 기능
- 제품 목록 보기
- 장바구니에 제품 추가 및 제거
- 주문 및 결제 기능

---

## 사용된 기술 🛠️
- **프론트엔드**: React 
- **백엔드**: Node.js, Express
- **데이터베이스**: PostgreSql
- **버전 관리**: Git, GitHub
- **배포**: AWS EC2

---

## 설치 방법 ⚙️

### 설치 단계
1. **레포지토리 클론**:
    ```bash
    git clone https://github.com/hyeyeon-34/whipped_f4.git
    cd whipped_f4
    ```

2. **필수 패키지 설치**:
    ```bash
    npm install

3. **애플리케이션 실행**:
    ```bash
    npm run dev
    ```

4. **애플리케이션 접속**:
   - 브라우저에서 `http://localhost:3000`으로 접속하세요.

---

## 에러 및 문제 해결 

### 🚨 Uncaught SyntaxError: Unexpected token <
- 문제: 페이지를 새로고침할 때 404 에러가 발생하며, Uncaught SyntaxError: Unexpected token < 에러가 표시됩니다. 이 에러는 JavaScript 파일을 로드할 때 HTML 파일이 반환되어 < 기호를 JavaScript 문법으로 인식하지 못하는 경우 발생합니다.
- 해결 방법: index.html에 <base href='/' /> 태그를 추가하여 브라우저가 모든 상대 경로를 루트 디렉토리를 기준으로 해석하도록 설정했습니다.

### 🌐 404 에러 발생
- 문제: 페이지를 새로고침할 때 404 에러가 발생합니다. 이는 서버가 JavaScript 파일 대신 HTML 파일을 반환하는 경우 발생할 수 있습니다.
- 해결 방법: Nginx 또는 다른 웹 서버 설정에서 모든 경로 요청에 대해 index.html을 반환하도록 설정하여 클라이언트 사이드 라우팅이 제대로 작동하도록 합니다.

---

## 폴더 구조 📂

```bash
whipped_f4/
├── public/                 # 공개된 파일 및 리소스
├── src/
│   ├── components/         # 재사용 가능한 컴포넌트들 (예: Header, ProductCard)
│   ├── redux/              # Redux 슬라이스와 스토어 설정
│   ├── services/           # API 서비스 호출 (예: Axios 설정)
│   ├── App.js              # 메인 앱 컴포넌트
│   └── index.js            # React 진입점
├── package.json            # 프로젝트 메타데이터 및 스크립트
└── README.md               # 현재 문서


