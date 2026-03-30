import axios from "axios";

const crmApi = axios.create({
  baseURL: process.env.CRM_APP_URL || "http://localhost:3000",
  timeout: 10000,
});

export async function getContacts(query?: string) {
  try {
    const { data } = await crmApi.get(`/api/contacts`, {
      params: query ? { q: query } : {},
    });
    return data;
  } catch {
    return { contacts: [], error: "CRM service unavailable" };
  }
}

export async function getContact(id: string) {
  try {
    const { data } = await crmApi.get(`/api/contacts/${id}`);
    return data;
  } catch {
    return null;
  }
}

export async function logInteraction(
  contactId: string,
  interaction: {
    type: string;
    subject?: string;
    body?: string;
    metadata?: string;
  }
) {
  try {
    const { data } = await crmApi.post(
      `/api/contacts/${contactId}/interactions`,
      interaction
    );
    return data;
  } catch {
    return null;
  }
}
