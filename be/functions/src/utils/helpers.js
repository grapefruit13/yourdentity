const formatResponse = (success, data = null, error = null, message = null, status = null) => {
  const response = {success};

  if (data) response.data = data;
  if (error) response.error = error;
  if (message) response.message = message;
  if (status) response.status = status;

  return response;
};

const successResponse = (status = 200, data = null, message = null) => {
  const response = {status};
  if (data !== null) response.data = data;
  if (message) response.message = message;
  return response;
};

const validateMissionStatus = (status) => {
  const validStatuses = ["ONGOING", "COMPLETED", "EXPIRED", "RETRY"];
  return validStatuses.includes(status);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  formatResponse,
  successResponse,
  validateMissionStatus,
  isValidEmail,
  generateId,
};
