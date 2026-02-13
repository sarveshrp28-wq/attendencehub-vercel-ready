const phpUploadUrl = import.meta.env.VITE_PHP_UPLOAD_URL?.trim() || "";

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

export const uploadStudentPhoto = async (file) => {
  if (!file) {
    return { data: null, error: { message: "Please choose an image file." } };
  }

  if (!phpUploadUrl) {
    return {
      data: null,
      error: {
        message:
          "Photo upload is not configured. Set VITE_PHP_UPLOAD_URL in your .env file."
      }
    };
  }

  const formData = new FormData();
  formData.append("photo", file);

  try {
    const response = await fetch(phpUploadUrl, {
      method: "POST",
      body: formData
    });
    const payload = await parseJsonSafely(response);

    if (!response.ok) {
      return {
        data: null,
        error: {
          message:
            payload?.message ||
            `Photo upload failed with status ${response.status}.`
        }
      };
    }

    if (!payload?.url) {
      return {
        data: null,
        error: { message: "Upload succeeded but did not return a photo URL." }
      };
    }

    return { data: payload, error: null };
  } catch (_error) {
    return {
      data: null,
      error: {
        message:
          "Could not reach PHP upload API. Start PHP server and verify VITE_PHP_UPLOAD_URL."
      }
    };
  }
};
