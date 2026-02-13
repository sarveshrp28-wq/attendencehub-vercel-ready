# PHP API

This folder contains lightweight PHP endpoints used by the React app.

## Endpoint
- `POST /upload-student-photo.php`
  - Accepts multipart form field: `photo`
  - Allowed formats: JPG, PNG, WEBP
  - Max size: 5 MB
  - Response includes `url` for storing in `students.student_photo_url`

## Local Run
From project root:

```bash
npm run php:serve
```

Default URL:
- `http://localhost:8000/upload-student-photo.php`

Set this in frontend `.env`:
- `VITE_PHP_UPLOAD_URL=http://localhost:8000/upload-student-photo.php`
