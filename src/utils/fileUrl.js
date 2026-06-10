const API_BASE_URL = "http://localhost:5000";

export const getFileUrl = (filePath) => {
  if (!filePath) return "#";

  if (filePath.startsWith("http")) {
    return filePath;
  }

  const cleanPath = filePath.replace(/\\/g, "/").replace(/^\/+/, "");

  return `${API_BASE_URL}/${cleanPath}`;
};