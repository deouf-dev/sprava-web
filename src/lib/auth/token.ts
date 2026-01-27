function getToken(): string | null {
    if(typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('sprava_token');
}

function setToken(token: string): void {
    if(typeof window === 'undefined') {
        return;
    }
    localStorage.setItem('sprava_token', token);
}

function clearToken(): void {
    if(typeof window === 'undefined') {
        return;
    }
    localStorage.removeItem('sprava_token');
}

export {
    getToken,
    setToken,
    clearToken,
};