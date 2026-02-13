const parentAlertUrl = import.meta.env.VITE_PHP_PARENT_ALERT_URL?.trim() || "";
const parentAlertHistoryUrl =
  import.meta.env.VITE_PHP_PARENT_ALERTS_HISTORY_URL?.trim() || "";

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

export const sendParentAlert = async (payload) => {
  if (!parentAlertUrl) {
    return {
      data: null,
      error: {
        message:
          "Parent alert API is not configured. Set VITE_PHP_PARENT_ALERT_URL in .env."
      }
    };
  }

  try {
    const response = await fetch(parentAlertUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await parseJsonSafely(response);
    if (!response.ok) {
      return {
        data: null,
        error: { message: data?.message || `Failed with status ${response.status}.` }
      };
    }
    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: {
        message:
          "Could not reach PHP parent alert API. Verify PHP server and URL."
      }
    };
  }
};

export const getParentAlerts = async ({ studentId, parentEmail, limit = 20 } = {}) => {
  if (!parentAlertHistoryUrl) {
    return {
      data: null,
      error: {
        message:
          "Parent alert history API is not configured. Set VITE_PHP_PARENT_ALERTS_HISTORY_URL in .env."
      }
    };
  }

  const query = new URLSearchParams();
  if (studentId) query.set("student_id", studentId);
  if (parentEmail) query.set("parent_email", parentEmail);
  query.set("limit", String(limit));

  try {
    const response = await fetch(`${parentAlertHistoryUrl}?${query.toString()}`);
    const data = await parseJsonSafely(response);
    if (!response.ok) {
      return {
        data: null,
        error: { message: data?.message || `Failed with status ${response.status}.` }
      };
    }
    return { data, error: null };
  } catch (_error) {
    return {
      data: null,
      error: {
        message:
          "Could not reach PHP parent alert history API. Verify PHP server and URL."
      }
    };
  }
};
