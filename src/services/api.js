const API_URL = "/api/records";

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorDetails = 'Unknown error';
        try {
            const errorData = await response.json();
            errorDetails = JSON.stringify(errorData);
        } catch (e) {
            errorDetails = await response.text();
        }
        throw new Error(`API Error (${response.status}): ${errorDetails}`);
    }
    return response.json();
};

export const api = {
    fetchRecords: async () => {
        const response = await fetch(API_URL);
        return handleResponse(response);
    },

    addRecord: async (record) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'add', record }),
        });
        await handleResponse(response);
        return true;
    },

    deleteRecord: async (id) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', id }),
        });
        await handleResponse(response);
        return true;
    }
};
