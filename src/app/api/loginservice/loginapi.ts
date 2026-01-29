"use server"

const BASEURL = process.env.NEXT_PUBLIC_BACK_API_URL;

export const loginAPI = async (email: string, password: string) => {
    const reqUrl = `${BASEURL}/api/members/login`;

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                                id: email, 
                                password : password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP error! status: ${response.status}`+ `, 에러 데이터: ${errorData}` );
        }
        
        const data = await response.json();
        console.log("[API result] Status:", data);
        return data;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};

export const logoutAPI = async () => {
    const reqUrl = `${BASEURL}/api/members/logout`;

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({  }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};

export const signinAPI = async (email: string, password: string) => {
    const reqUrl = `${BASEURL}/api/members/signin`;

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};

export const signoutAPI = async (email: string, password: string) => {
    const reqUrl = `${BASEURL}/api/members/signout`;

    try {
        const response = await fetch(reqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Login API error:", error);
        throw error;
    }
};