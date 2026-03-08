const API_URL = "/api/records";

export const api = {
    fetchRecords: async () => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },

    addRecord: async (record) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'add', record }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
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
        if (!response.ok) throw new Error('Network response was not ok');
        return true;
    }
};
