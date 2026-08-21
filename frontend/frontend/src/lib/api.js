// API Helper client connecting to StackIt Backend

const API_BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('stackit_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('stackit_token', token);
  } else {
    localStorage.removeItem('stackit_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'API Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// API Methods
export const api = {
  // Auth
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/me'),

  // Questions
  getQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/questions${queryString ? '?' + queryString : ''}`);
  },
  getQuestionById: (id) => apiRequest(`/questions/${id}`),
  createQuestion: (questionData) => apiRequest('/questions', { method: 'POST', body: JSON.stringify(questionData) }),
  updateQuestion: (id, questionData) => apiRequest(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(questionData) }),
  deleteQuestion: (id) => apiRequest(`/questions/${id}`, { method: 'DELETE' }),

  // Answers
  postAnswer: (questionId, answerData) => apiRequest(`/questions/${questionId}/answers`, { method: 'POST', body: JSON.stringify(answerData) }),
  acceptAnswer: (answerId) => apiRequest(`/answers/${answerId}/accept`, { method: 'PATCH' }),
  deleteAnswer: (answerId) => apiRequest(`/answers/${answerId}`, { method: 'DELETE' }),

  // Votes
  voteAnswer: (answerId, vote_type) => apiRequest(`/answers/${answerId}/vote`, { method: 'POST', body: JSON.stringify({ vote_type }) }),
  removeVote: (answerId) => apiRequest(`/answers/${answerId}/vote`, { method: 'DELETE' }),

  // Comments
  postComment: (answerId, commentData) => apiRequest(`/answers/${answerId}/comments`, { method: 'POST', body: JSON.stringify(commentData) }),
  deleteComment: (commentId) => apiRequest(`/comments/${commentId}`, { method: 'DELETE' }),

  // Tags
  getTags: () => apiRequest('/tags'),

  // Notifications
  getNotifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/notifications${queryString ? '?' + queryString : ''}`);
  },
  getUnreadNotificationsCount: () => apiRequest('/notifications/unread-count'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),

  // Upload
  uploadImage: (formData) => apiRequest('/upload', { method: 'POST', body: formData }),
};
