/**
 * ApiService class for communicating with Google Apps Script (GAS) backend.
 * Provides methods for user authentication, book management, and category management.
 */
class ApiService {
    constructor() {
        this.GAS_URL = 'https://script.google.com/macros/s/1UgiyvgMgCpQjWDoN6Zhc4Y2KmW4_WyRgEdvjCMLyko-VE_MhcTtNFpgC/exec';
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000;
        this.loadingCount = 0;
    }

    /**
     * Shows a loading spinner overlay.
     */
    showLoading() {
        this.loadingCount++;
        let spinner = document.getElementById('api-loading-spinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'api-loading-spinner';
            spinner.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.5); z-index: 9999;
                display: flex; justify-content: center; align-items: center;
            `;
            
            const loader = document.createElement('div');
            loader.style.cssText = `
                border: 4px solid #f3f3f3; border-top: 4px solid #2e7d32;
                border-radius: 50%; width: 40px; height: 40px;
                animation: api-spin 1s linear infinite;
            `;
            
            const style = document.createElement('style');
            style.textContent = '@keyframes api-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
            
            spinner.appendChild(loader);
            document.body.appendChild(spinner);
        }
        spinner.style.display = 'flex';
    }

    /**
     * Hides the loading spinner overlay.
     */
    hideLoading() {
        if (this.loadingCount > 0) this.loadingCount--;
        if (this.loadingCount === 0) {
            const spinner = document.getElementById('api-loading-spinner');
            if (spinner) spinner.style.display = 'none';
        }
    }

    /**
     * Shows a toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - 'info', 'success', 'error', 'warning'.
     * @param {number} duration - Duration in milliseconds.
     */
    showToast(message, type = 'info', duration = 4000) {
        let container = document.getElementById('api-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'api-toast-container';
            container.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; z-index: 10000;
                display: flex; flex-direction: column; gap: 10px;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const colors = {
            success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
            error: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
            warning: { bg: '#fff8e1', border: '#ffc107', text: '#f57f17' },
            info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' }
        };
        const style = colors[type] || colors.info;

        toast.style.cssText = `
            background: ${style.bg}; border-left: 4px solid ${style.border}; color: ${style.text};
            padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: sans-serif; font-size: 14px; font-weight: 500;
            transform: translateX(120%); transition: transform 0.3s ease-out;
        `;
        toast.textContent = message;

        container.appendChild(toast);

        // Slide in
        setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 10);

        // Slide out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => { toast.remove(); }, 300);
        }, duration);
    }

    /**
     * Shows an error toast notification.
     * @param {string} message - The error message.
     */
    showToastError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Shows a success toast notification.
     * @param {string} message - The success message.
     */
    showToastSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Core request method with exponential backoff retry.
     * @param {string} action - The action parameter for GAS.
     * @param {Object} params - Additional parameters.
     * @param {string} method - 'GET' or 'POST'.
     * @param {number} retries - Number of retries remaining.
     * @returns {Promise<any>}
     */
    async request(action, params = {}, method = 'GET', retries = this.MAX_RETRIES) {
        this.showLoading();
        
        let url = new URL(this.GAS_URL);
        let fetchOptions = {
            method: method,
            mode: 'cors'
        };

        if (method === 'GET') {
            url.searchParams.append('action', action);
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    url.searchParams.append(key, params[key]);
                }
            }
        } else if (method === 'POST') {
            const formData = new FormData();
            formData.append('action', action);
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    formData.append(key, typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key]);
                }
            }
            fetchOptions.body = formData;
        }

        try {
            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
            }

            this.hideLoading();
            return data;
            
        } catch (error) {
            if (retries > 0) {
                this.hideLoading();
                const delay = this.RETRY_DELAY * Math.pow(2, this.MAX_RETRIES - retries);
                await new Promise(res => setTimeout(res, delay));
                return this.request(action, params, method, retries - 1);
            } else {
                this.hideLoading();
                const errorMessage = error.message.includes('fetch') ? 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ โปรดลองอีกครั้ง' : error.message;
                this.showToastError(errorMessage);
                throw error;
            }
        }
    }

    /**
     * Logs in the user.
     * @param {string} username - User identity.
     * @param {string} password - User password.
     * @returns {Promise<Object>}
     */
    async login(username, password) {
        const result = await this.request('login', { username, password }, 'POST');
        if (result.token) {
            this.setToken(result.token);
        }
        if (result.user) {
            this.setCurrentUser(result.user);
        }
        return result;
    }

    /**
     * Registers a new user.
     * @param {string} username - Username.
     * @param {string} password - Password.
     * @param {string} email - Email.
     * @param {string} name - Display name.
     * @returns {Promise<Object>}
     */
    async register(username, password, email, name) {
        return this.request('register', { username, password, email, name }, 'POST');
    }

    /**
     * Logs out the current user.
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await this.request('logout', { token }, 'POST').catch(() => {});
            }
        } finally {
            this.clearToken();
            sessionStorage.removeItem('lumina_current_user');
        }
    }

    /**
     * Gets the auth token.
     * @returns {string|null}
     */
    getToken() {
        return sessionStorage.getItem('lumina_token');
    }

    /**
     * Sets the auth token.
     * @param {string} token 
     */
    setToken(token) {
        sessionStorage.setItem('lumina_token', token);
    }

    /**
     * Clears the auth token.
     */
    clearToken() {
        sessionStorage.removeItem('lumina_token');
    }

    /**
     * Gets the current user details.
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userJson = sessionStorage.getItem('lumina_current_user');
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Sets the current user details.
     * @param {Object} user 
     */
    setCurrentUser(user) {
        const safeUser = {
            username: user.username,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            email: user.email
        };
        sessionStorage.setItem('lumina_current_user', JSON.stringify(safeUser));
    }

    /**
     * Checks if user is logged in.
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!this.getToken();
    }

    /**
     * Checks if user is admin.
     * @returns {boolean}
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }

    /**
     * Gets books.
     * @param {string} searchQuery 
     * @param {string} categoryId 
     * @returns {Promise<Object>}
     */
    async getBooks(searchQuery = '', categoryId = '') {
        return this.request('getBooks', { searchQuery, categoryId }, 'GET');
    }

    /**
     * Gets book by ID.
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async getBookById(bookId) {
        return this.request('getBookById', { bookId }, 'GET');
    }

    /**
     * Creates a new book.
     * @param {Object} bookData 
     * @returns {Promise<Object>}
     */
    async createBook(bookData) {
        const token = this.getToken();
        if (!token) throw new Error('กรุณาเข้าสู่ระบบก่อน');
        return this.request('createBook', { token, bookData }, 'POST');
    }

    /**
     * Updates an existing book.
     * @param {string} bookId 
     * @param {Object} bookData 
     * @returns {Promise<Object>}
     */
    async updateBook(bookId, bookData) {
        const token = this.getToken();
        return this.request('updateBook', { token, bookId, bookData }, 'POST');
    }

    /**
     * Deletes a book.
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async deleteBook(bookId) {
        const token = this.getToken();
        return this.request('deleteBook', { token, bookId }, 'POST');
    }

    /**
     * Increments view count (reading history).
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async incrementViewCount(bookId) {
        const token = this.getToken();
        if (!token) return; // Don't track guests
        return this.request('addReadingHistory', { token, bookId }, 'POST').catch(() => {});
    }

    /**
     * Gets categories.
     * @returns {Promise<Object>}
     */
    async getCategories() {
        return this.request('getCategories', {}, 'GET');
    }

    /**
     * Creates a category.
     * @param {string} name 
     * @returns {Promise<Object>}
     */
    async createCategory(name) {
        const token = this.getToken();
        return this.request('createCategory', { token, name }, 'POST');
    }

    /**
     * Deletes a category.
     * @param {string} categoryId 
     * @returns {Promise<Object>}
     */
    async deleteCategory(categoryId) {
        const token = this.getToken();
        return this.request('deleteCategory', { token, categoryId }, 'POST');
    }

    /**
     * Uploads a file.
     * @param {File} file 
     * @param {string} folderType 
     * @returns {Promise<Object>}
     */
    async uploadFile(file, folderType) {
        this.validateFileClient(file, folderType);
        
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });

        const token = this.getToken();
        return this.request('uploadFile', {
            token,
            fileName: file.name,
            mimeType: file.type,
            base64Data: base64,
            folderType
        }, 'POST');
    }

    /**
     * Validates file size and extension on client side.
     * @param {File} file 
     * @param {string} folderType 
     */
    validateFileClient(file, folderType) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('ขนาดไฟล์ต้องไม่เกิน 5MB');
        }
        // Further extension checks can be implemented here based on folderType
    }

    /**
     * Updates user profile.
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    async updateProfile(data) {
        const token = this.getToken();
        return this.request('updateProfile', { token, data }, 'POST');
    }

    /**
     * Gets users (Admin only).
     * @returns {Promise<Object>}
     */
    async getUsers() {
        const token = this.getToken();
        return this.request('getUsers', { token }, 'GET');
    }

    /**
     * Updates user status.
     * @param {string} userId 
     * @param {string} status 
     * @returns {Promise<Object>}
     */
    async updateUserStatus(userId, status) {
        const token = this.getToken();
        return this.request('updateUserStatus', { token, userId, status }, 'POST');
    }

    /**
     * Gets favorite books.
     * @returns {Promise<Object>}
     */
    async getFavorites() {
        const token = this.getToken();
        return this.request('getFavorites', { token }, 'GET');
    }

    /**
     * Adds book to favorites.
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async addFavorite(bookId) {
        const token = this.getToken();
        return this.request('addFavorite', { token, bookId }, 'POST');
    }

    /**
     * Removes book from favorites.
     * @param {string} bookId 
     * @returns {Promise<Object>}
     */
    async removeFavorite(bookId) {
        const token = this.getToken();
        return this.request('removeFavorite', { token, bookId }, 'POST');
    }

    /**
     * Gets reading history.
     * @returns {Promise<Object>}
     */
    async getReadingHistory() {
        const token = this.getToken();
        return this.request('getReadingHistory', { token }, 'GET');
    }

    /**
     * Gets dashboard stats.
     * @returns {Promise<Object>}
     */
    async getDashboardStats() {
        const token = this.getToken();
        return this.request('getDashboardStats', { token }, 'GET');
    }
}

const api = new ApiService();
window.api = api;
