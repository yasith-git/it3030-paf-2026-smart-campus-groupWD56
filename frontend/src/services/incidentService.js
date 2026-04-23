import axios from 'axios';

const API_BASE = 'http://localhost:8080';
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true
});

function handleError(error) {
    if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please login from the login page and try again.');
    }
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    throw new Error('Request failed. Please try again.');
}

export function saveTicketApiCredentials(username, password) {
    return { username, password };
}

export function getTicketApiCredentials() {
    return { username: '', password: '' };
}

export async function getResources() {
    try {
        const response = await api.get('/api/resources');
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function createTicket(payload) {
    try {
        const response = await api.post('/api/v1/tickets', payload);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function getMyTickets(params = {}) {
    try {
        const response = await api.get('/api/v1/tickets/my', { params });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function getTicketById(ticketId) {
    try {
        const response = await api.get(`/api/v1/tickets/${ticketId}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateTicket(ticketId, payload) {
    try {
        const response = await api.put(`/api/v1/tickets/${ticketId}`, payload);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteTicket(ticketId) {
    try {
        await api.delete(`/api/v1/tickets/${ticketId}`);
    } catch (error) {
        handleError(error);
    }
}

export async function getAllTickets(params = {}) {
    try {
        const response = await api.get('/api/v1/tickets', { params });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function getAssignableUsers() {
    try {
        const response = await api.get('/api/v1/tickets/assignees');
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function assignTicket(ticketId, technicianId) {
    try {
        const response = await api.patch(`/api/v1/tickets/${ticketId}/assign`, { technicianId });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateTicketStatus(ticketId, payload) {
    try {
        const response = await api.patch(`/api/v1/tickets/${ticketId}/status`, payload);
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function addTicketComment(ticketId, message) {
    try {
        const response = await api.post(`/api/v1/tickets/${ticketId}/comments`, { message });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function updateTicketComment(ticketId, commentId, message) {
    try {
        const response = await api.patch(`/api/v1/tickets/${ticketId}/comments/${commentId}`, { message });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteTicketComment(ticketId, commentId) {
    try {
        await api.delete(`/api/v1/tickets/${ticketId}/comments/${commentId}`);
    } catch (error) {
        handleError(error);
    }
}

export async function uploadTicketAttachments(ticketId, files) {
    try {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files', file));

        const response = await api.post(
            `/api/v1/tickets/${ticketId}/attachments`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export async function deleteTicketAttachment(ticketId, attachmentId) {
    try {
        await api.delete(`/api/v1/tickets/${ticketId}/attachments/${attachmentId}`);
    } catch (error) {
        handleError(error);
    }
}

export async function downloadTicketAttachment(ticketId, attachmentId) {
    try {
        const response = await api.get(
            `/api/v1/tickets/${ticketId}/attachments/${attachmentId}`,
            {
                responseType: 'blob'
            }
        );
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

