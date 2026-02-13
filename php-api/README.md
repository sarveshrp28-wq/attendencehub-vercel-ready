# PHP API

This folder contains lightweight PHP endpoints used by the React app.

## Endpoint
- `POST /send-parent-alert.php`
  - Accepts JSON payload for student + parent + message
  - Stores alert records in `php-api/data/parent-alerts.json`
  - Attempts parent email delivery if `parent_email` is provided
- `GET /get-parent-alerts.php`
  - Returns recent parent alerts
  - Supports query params: `student_id`, `parent_email`, `limit`

## Local Run
From project root:

```bash
npm run php:serve
```

Default URL:
- `http://localhost:8000/send-parent-alert.php`
- `http://localhost:8000/get-parent-alerts.php`

Set this in frontend `.env`:
- `VITE_PHP_PARENT_ALERT_URL=http://localhost:8000/send-parent-alert.php`
- `VITE_PHP_PARENT_ALERTS_HISTORY_URL=http://localhost:8000/get-parent-alerts.php`
