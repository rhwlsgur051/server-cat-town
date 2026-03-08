# server-cat-town

NestJS + Prisma + MySQL 기반 Cat Town API 서버입니다.

## 사전 요구사항

- **Node.js** 18+
- **MySQL** 8.x (또는 MariaDB)
- **npm** 또는 **yarn**

---

## 새 PC / DB 없이 처음 세팅할 때

### 1. MySQL에 DB 생성

MySQL에 접속해서 **스키마(데이터베이스)만** 만들어 두면 됩니다.

```bash
# MySQL CLI 접속 (비밀번호 입력 후)
mysql -u root -p
```

접속 후:

```sql
CREATE DATABASE cat_town CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

- DB 이름을 바꾸려면 `.env`의 `DATABASE_NAME`과 위 `cat_town`을 같이 바꾸면 됩니다.

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 아래처럼 채웁니다.

```env
# Application
PORT=8080
NODE_ENV=development
LOG_LEVEL=debug

# Database (MySQL 접속 정보)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=여기에_비밀번호
DATABASE_NAME=cat_town

# Supabase (이미지 스토리지 등)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_BUCKET=cat-town-images
SUPABASE_CAT_AVATAR_FOLDER=cat-avatar
SUPABASE_USER_AVATAR_FOLDER=user-avatar
SUPABASE_FEED_IMAGES_FOLDER=feed-images
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
# CORS
ALLOWED_ORIGINS=*

- `DATABASE_USER` / `DATABASE_PASSWORD` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL`는 실제 정보로 수정하세요.
- 비밀번호에 `@`, `#`, `%` 등 특수문자가 있으면 [Prisma 문서](https://www.prisma.io/docs/orm/reference/connection-urls)대로 URL 인코딩이 필요할 수 있습니다.

### 3. 패키지 설치

```bash
npm install
```

### 4. DB 테이블 생성 (스키마 반영)

아무것도 없는 DB에 `prisma/schema.prisma` 내용을 그대로 반영하려면 **둘 중 하나**만 하면 됩니다.

**방법 A – 마이그레이션 없이 스키마만 맞추기 (추천: 처음 세팅 시)**

```bash
npx prisma db push
```

- 테이블·컬럼이 없으면 만들고, 있으면 스키마에 맞게 맞춥니다.
- 마이그레이션 파일은 만들지 않습니다.

**방법 B – 마이그레이션 히스토리까지 관리**

```bash
npx prisma migrate dev --name init
```

- `prisma/migrations` 폴더에 마이그레이션이 생성되고, 그걸 적용해 테이블이 만들어집니다.

### 5. Prisma Client 생성

```bash
npm run prisma:generate
```

또는:

```bash
npx prisma generate
```

### 6. (선택) 시드 데이터 넣기

`prisma/seed.ts`가 있다면:

```bash
npm run prisma:seed
```

### 7. 서버 실행

```bash
npm run start:dev
```

기본적으로 `http://localhost:8080`에서 동작합니다.

---

## 자주 쓰는 명령어 요약

| 목적 | 명령어 |
|------|--------|
| DB 스키마를 코드와 맞추기 (마이그레이션 없이) | `npx prisma db push` |
| 마이그레이션 적용/생성 | `npx prisma migrate dev` |
| Prisma Client 재생성 | `npm run prisma:generate` |
| DB GUI 보기 | `npm run prisma:studio` |
| 개발 서버 실행 | `npm run start:dev` |

---

## 트러블슈팅

- **"Unknown database 'cat_town'"**  
  → 1단계에서 `CREATE DATABASE cat_town;` 을 실행했는지 확인하세요.

- **"Access denied for user"**  
  → `.env`의 `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_URL`이 MySQL 계정 정보와 같은지 확인하세요.

- **`prisma migrate` / `prisma db push` 실패**  
  → `DATABASE_URL`이 `.env`에 있고, 형식이 `mysql://USER:PASSWORD@HOST:PORT/DATABASE` 인지 확인하세요.

---

## 라이선스

This project is licensed under the GNU AGPL v3.  
See the LICENSE file for details.
