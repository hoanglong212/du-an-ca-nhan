# Deploy Huong Dan

## Cach nhanh nhat (Render)

Du an da co san file `render.yaml` o thu muc goc.

1. Day code len GitHub.
2. Vao Render -> `New` -> `Blueprint`.
3. Chon repo nay, Render se doc `render.yaml` va tao:
   - `hoanglong-api` (backend)
   - `hoanglong-web` (frontend static)
4. Dat bien moi truong cho backend (`hoanglong-api`):
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `ADMIN_TOKEN_SECRET`
   - `CORS_ORIGIN` = URL frontend Render (vi du: `https://hoanglong-web.onrender.com`)
5. Dat bien moi truong cho frontend (`hoanglong-web`):
   - `VITE_API_BASE_URL` = URL backend Render (vi du: `https://hoanglong-api.onrender.com`)
6. Redeploy ca 2 service.

## Luu y quan trong

- Backend da dung `PORT` tu Render, khong hard-code 5000.
- Frontend da dung `VITE_API_BASE_URL`, khong hard-code localhost.
- Neu login admin that bai tren production, kiem tra:
  - backend da restart sau khi set env
  - token secret da co
  - user admin ton tai trong bang `users`.

## Tao/Cap nhat admin user

Neu can tao nhanh admin user trong DB:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'nguyenhoanglong26022006@gmail.com';
```

Neu chua co user, them moi user truoc roi cap nhat role.
