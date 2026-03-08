const API_URL = "https://script.google.com/macros/s/AKfycbz0mwvKktQLDoCIy-cz6jgv35qhBPMhZ7VDnEFJnDzBFf0qxgLNPowmTq667XRJfhNd/exec";

export const api = {
    fetchRecords: async () => {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    },

    addRecord: async (record) => {
        // GAS requires text/plain for CORS reasons in some cases, or simple POST
        // We use no-cors mode or simple POST. 
        // Standard fetch with JSON body to GAS Web App usually requires handling redirects.
        // However, for simple usage:
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for GAS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'add', record }),
        });
        // In no-cors mode, we can't read the response, so we assume success if no error thrown
        return true;
    },

    deleteRecord: async (id) => {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', id }),
        });
        return true;
    }
};
