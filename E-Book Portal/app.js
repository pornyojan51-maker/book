// Lumina Books Application Logic - Free Reading with Mandatory Account Registration
class LuminaApp {
    constructor() {
        this.books = [];
        this.categories = [];
        this.currentUser = null;

        this.activeCategory = 'ทั้งหมด';
        this.searchQuery = '';
        this.viewMode = 'grid';
        this.reader = null;

        this.init();
    }

    async init() {
        try {
            await this.loadCurrentUser();
            await this.loadCategories();
            await this.loadBooks();
        } catch (e) {
            showToast('โหลดข้อมูลล้มเหลว: ' + e.message, 'error');
        }

        this.reader = typeof EBookReader !== 'undefined' ? new EBookReader() : null;
        window.luminaApp = this;

        this.bindEvents();
        this.renderAll();
    }

    async loadCurrentUser() {
        this.currentUser = window.api ? window.api.getCurrentUser() : null;
    }

    saveCurrentUser() {
        if (window.api && this.currentUser) {
            window.api.setCurrentUser(this.currentUser);
        } else if (window.api) {
            window.api.clearToken();
            sessionStorage.removeItem('lumina_current_user');
        }
    }

    isLoggedIn() {
        return window.api ? window.api.isLoggedIn() : false;
    }

    requireAuth(actionMessage = 'เข้าใช้งานฟีเจอร์นี้') {
        if (this.isLoggedIn()) {
            return true;
        }
        showToast(`ข้อผิดพลาดการเข้าถึง: กรุณาสร้างบัญชีใหม่หรือเข้าสู่ระบบก่อนเพื่อ${actionMessage}`, 'error');
        this.openAuthModal();
        return false;
    }

    async loadCategories() {
        try {
            if (window.api) {
                const res = await window.api.getCategories();
                this.categories = res.categories || [];
            }
        } catch (error) {
            showToast('โหลดหมวดหมู่ล้มเหลว', 'error');
            this.categories = ['วรรณกรรม', 'นิยาย', 'ทั่วไป'];
        }
    }

    async addCategory(catName) {
        if (!this.requireAuth('เพิ่มหมวดหมู่หนังสือใหม่')) {
            return false;
        }

        const cleanName = catName.trim();
        if (!cleanName) {
            showToast('ข้อผิดพลาด: กรุณากรอกชื่อหมวดหมู่ที่ต้องการเพิ่ม', 'error');
            return false;
        }

        if (this.categories.includes(cleanName)) {
            showToast(`ข้อผิดพลาด: หมวดหมู่ "${cleanName}" มีอยู่ในระบบแล้ว`, 'error');
            return false;
        }

        try {
            if (window.api) {
                await window.api.createCategory(cleanName);
                await this.loadCategories();
                this.renderCategoryTabs();
                showToast(`เพิ่มหมวดหมู่ใหม่ "${cleanName}" เรียบร้อยแล้ว! 🎉`);
                return true;
            }
        } catch (error) {
            showToast(error.message, 'error');
        }
        return false;
    }

    async loadBooks() {
        try {
            if (window.api) {
                const res = await window.api.getBooks();
                this.books = res.books || [];
            }
        } catch (error) {
            showToast('โหลดหนังสือล้มเหลว', 'error');
            this.books = [];
        }
    }

    async addBook(bookData) {
        if (window.api) {
            try {
                await window.api.createBook(bookData);
                await this.loadBooks();
                this.renderAll();
                showToast(`เพิ่มหนังสือ "${bookData.title}" สำเร็จ!`);
            } catch (error) {
                showToast('เพิ่มหนังสือล้มเหลว: ' + error.message, 'error');
            }
        }
    }

    async deleteBook(bookId) {
        if (window.api) {
            try {
                await window.api.deleteBook(bookId);
                await this.loadBooks();
                this.renderAll();
                showToast('ลบหนังสือสำเร็จ');
            } catch (error) {
                showToast('ลบหนังสือล้มเหลว: ' + error.message, 'error');
            }
        }
    }

    bindEvents() {
        // Search Input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderLibrary();
            });
        }

        // View Mode Switchers
        const gridBtn = document.getElementById('btnViewGrid');
        const listBtn = document.getElementById('btnViewList');
        if (gridBtn && listBtn) {
            gridBtn.addEventListener('click', () => {
                this.viewMode = 'grid';
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
                this.renderLibrary();
            });
            listBtn.addEventListener('click', () => {
                this.viewMode = 'list';
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
                this.renderLibrary();
            });
        }

        // Category Creation Modal
        const btnAddCategory = document.getElementById('btnAddCategoryModal');
        const categoryModal = document.getElementById('categoryModal');
        const btnCloseCategoryModal = document.getElementById('btnCloseCategoryModal');
        const formAddCategory = document.getElementById('formAddCategory');

        if (btnAddCategory && categoryModal) {
            btnAddCategory.addEventListener('click', () => {
                if (this.requireAuth('เพิ่มหมวดหมู่หนังสือใหม่')) {
                    categoryModal.classList.add('open');
                }
            });
        }
        if (btnCloseCategoryModal && categoryModal) {
            btnCloseCategoryModal.addEventListener('click', () => categoryModal.classList.remove('open'));
        }
        if (formAddCategory) {
            formAddCategory.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('newCategoryNameInput').value;
                const success = await this.addCategory(nameInput);
                if (success) {
                    document.getElementById('newCategoryNameInput').value = '';
                    if (categoryModal) categoryModal.classList.remove('open');
                }
            });
        }

        // Upload Book Modal
        const btnUpload = document.getElementById('btnUploadBook');
        const uploadModal = document.getElementById('uploadModal');
        const btnCloseUpload = document.getElementById('btnCloseUploadModal');
        const dropzone = document.getElementById('uploadDropzone');
        const fileInput = document.getElementById('bookFileInput');

        if (btnUpload && uploadModal) {
            btnUpload.addEventListener('click', () => {
                if (this.requireAuth('อัปโหลดหนังสือใหม่เข้าสู่คลัง')) {
                    this.populateCategorySelect('uploadBookCategorySelect');
                    uploadModal.classList.add('open');
                }
            });
        }
        if (btnCloseUpload && uploadModal) {
            btnCloseUpload.addEventListener('click', () => uploadModal.classList.remove('open'));
        }

        if (dropzone && fileInput) {
            dropzone.addEventListener('click', () => fileInput.click());
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files[0]);
                }
            });
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        // Profile / Auth Button
        const profileBtn = document.getElementById('userProfileBtn');
        const profileModal = document.getElementById('profileModal');
        const closeProfile = document.getElementById('btnCloseProfileModal');
        
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                if (this.isLoggedIn()) {
                    this.updateProfileStats();
                    profileModal.classList.add('open');
                } else {
                    this.openAuthModal();
                }
            });
        }
        if (closeProfile && profileModal) {
            closeProfile.addEventListener('click', () => profileModal.classList.remove('open'));
        }

        // Auth Tabs & Forms
        const authModal = document.getElementById('authModal');
        const btnCloseAuth = document.getElementById('btnCloseAuthModal');
        const authTabLogin = document.getElementById('authTabLogin');
        const authTabRegister = document.getElementById('authTabRegister');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (btnCloseAuth && authModal) {
            btnCloseAuth.addEventListener('click', () => authModal.classList.remove('open'));
        }
        if (authTabLogin && authTabRegister) {
            authTabLogin.addEventListener('click', () => {
                authTabLogin.classList.add('active');
                authTabRegister.classList.remove('active');
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            });
            authTabRegister.addEventListener('click', () => {
                authTabRegister.classList.add('active');
                authTabLogin.classList.remove('active');
                registerForm.style.display = 'block';
                loginForm.style.display = 'none';
            });
        }

        // Submit Login Form
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const identity = document.getElementById('loginIdentity').value.trim();
                const password = document.getElementById('loginPassword').value.trim();
                await this.loginUser(identity, password);
            });
        }

        // Submit Register Form
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value.trim();
                const email = document.getElementById('regEmail').value.trim();
                const phone = document.getElementById('regPhone').value.trim();
                const username = document.getElementById('regUsername').value.trim();
                const password = document.getElementById('regPassword').value.trim();

                if (window.api) {
                    try {
                        await window.api.register(username, password, email, name);
                        showToast(`สร้างบัญชีใหม่สำเร็จ! ยินดีต้อนรับคุณ ${name} สู่ Lumina Books`);
                        await this.loginUser(username, password);
                    } catch (error) {
                        showToast(error.message, 'error');
                    }
                }
            });
        }

        // Demo Logins
        document.getElementById('btnDemoLogin')?.addEventListener('click', async () => {
            if (window.api) {
                try {
                    await this.loginUser('alex', 'password123'); // Still here for demo purpose but using API.
                } catch(e) {
                    showToast('เข้าสู่ระบบ Demo ล้มเหลว', 'error');
                }
            }
        });

        document.getElementById('btnDemoAdminLogin')?.addEventListener('click', async () => {
            if (window.api) {
                try {
                    await this.loginUser('admin', 'admin123'); // Still here for demo purpose but using API.
                } catch(e) {
                    showToast('เข้าสู่ระบบ Admin ล้มเหลว', 'error');
                }
            }
        });

        // Logout Button
        document.getElementById('btnLogout')?.addEventListener('click', async () => {
            await this.logoutUser();
        });
    }

    openAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('open');
    }

    async loginUser(username, password) {
        if (window.api) {
            try {
                const res = await window.api.login(username, password);
                await this.loadCurrentUser();
                const authModal = document.getElementById('authModal');
                if (authModal) authModal.classList.remove('open');
                
                showToast(`เข้าสู่ระบบเรียบร้อยแล้ว ยินดีต้อนรับ! อ่านฟรีได้ทันที 📚`);
                
                // Refresh data
                await this.loadCategories();
                await this.loadBooks();
                this.renderAll();
            } catch (error) {
                showToast('เข้าสู่ระบบล้มเหลว: ' + error.message, 'error');
            }
        }
    }

    async logoutUser() {
        if (window.api) {
            try {
                await window.api.logout();
            } catch (e) {}
        }
        
        this.currentUser = null;
        
        const profileModal = document.getElementById('profileModal');
        if (profileModal) profileModal.classList.remove('open');

        showToast('ออกจากระบบเรียบร้อยแล้ว');
        
        // Refresh data
        await this.loadCategories();
        await this.loadBooks();
        this.renderAll();
    }

    renderAll() {
        this.renderNavProfile();
        this.renderWelcomeHeader();
        this.renderCategoryTabs();
        this.renderContinueReading();
        this.renderLibrary();
    }

    renderNavProfile() {
        const avatarEl = document.getElementById('navUserAvatar');
        const guestIconEl = document.getElementById('navGuestIcon');
        const nameEl = document.getElementById('navUserName');
        const badgeEl = document.getElementById('navUserBadge');
        const btnAdminPortal = document.getElementById('btnAdminPortal');

        if (this.isLoggedIn()) {
            if (avatarEl) {
                avatarEl.src = this.currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                avatarEl.style.display = 'block';
            }
            if (guestIconEl) guestIconEl.style.display = 'none';
            if (nameEl) nameEl.textContent = this.currentUser.name || this.currentUser.username;
            if (badgeEl) {
                badgeEl.textContent = this.currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'บัญชีใช้งาน';
                badgeEl.className = this.currentUser.role === 'admin' ? 'user-badge admin-badge' : 'user-badge';
            }
            if (btnAdminPortal) {
                btnAdminPortal.style.display = this.currentUser.role === 'admin' ? 'inline-flex' : 'none';
            }
        } else {
            // Guest Mode
            if (avatarEl) avatarEl.style.display = 'none';
            if (guestIconEl) guestIconEl.style.display = 'flex';
            if (nameEl) nameEl.textContent = 'เข้าสู่ระบบ / สร้างบัญชีใหม่';
            if (badgeEl) {
                badgeEl.textContent = 'อ่านฟรี! เพียงสร้างบัญชีใหม่';
                badgeEl.className = 'user-badge guest-badge';
            }
            if (btnAdminPortal) btnAdminPortal.style.display = 'none';
        }
    }

    renderWelcomeHeader() {
        const titleEl = document.getElementById('welcomeTitle');
        const subEl = document.getElementById('welcomeSubtitle');
        const bannerEl = document.getElementById('guestBannerNotice');

        if (this.isLoggedIn()) {
            if (titleEl) titleEl.textContent = `ยินดีต้อนรับกลับมา, ${this.currentUser.name || this.currentUser.username}`;
            if (subEl) subEl.textContent = 'อ่านหนังสือฟรี ไร้ข้อจำกัด เพิ่มหมวดหมู่และบันทึกความก้าวหน้าได้ตลอดเวลา';
            if (bannerEl) bannerEl.style.display = 'none';
        } else {
            if (titleEl) titleEl.textContent = 'ยินดีต้อนรับสู่ Lumina Books';
            if (subEl) subEl.textContent = 'อ่านหนังสือฟรี 100%! เพียงสร้างบัญชีใหม่หรือเข้าสู่ระบบเพื่อเปิดอ่านทันที';
            if (bannerEl) bannerEl.style.display = 'flex';
        }
    }

    renderCategoryTabs() {
        const container = document.getElementById('categoryTabsContainer');
        if (!container) return;

        const fixedTabs = ['ทั้งหมด', 'กำลังอ่าน', 'อ่านจบแล้ว', 'รายการโปรด'];
        const allTabs = [...fixedTabs, ...this.categories];

        container.innerHTML = allTabs.map(cat => `
            <button class="tab-btn ${this.activeCategory === cat ? 'active' : ''}" 
                    onclick="window.luminaApp.selectCategory('${cat}')">
                ${cat}
            </button>
        `).join('') + `
            <button class="tab-btn" id="btnAddCategoryModal" style="background: rgba(26,35,126,0.06); color: var(--color-primary); border-style: dashed;">
                <span class="material-symbols-outlined" style="font-size: 16px;">add</span> เพิ่มหมวดหมู่
            </button>
        `;

        document.getElementById('btnAddCategoryModal')?.addEventListener('click', () => {
            if (this.requireAuth('เพิ่มหมวดหมู่หนังสือใหม่')) {
                document.getElementById('categoryModal')?.classList.add('open');
            }
        });
    }

    selectCategory(catName) {
        this.activeCategory = catName;
        this.renderCategoryTabs();
        this.renderLibrary();
    }

    populateCategorySelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = this.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    getContinueReadingBook() {
        const reading = this.books
            .filter(b => b.progress > 0 && b.progress < 100)
            .sort((a, b) => new Date(b.lastReadDate || 0) - new Date(a.lastReadDate || 0));
        
        return reading[0] || this.books[0];
    }

    renderContinueReading() {
        const book = this.getContinueReadingBook();
        if (!book) return;

        const cardContainer = document.getElementById('continueReadingCard');
        if (!cardContainer) return;

        cardContainer.innerHTML = `
            <div class="continue-cover-wrapper" onclick="window.luminaApp.openBook('${book.id}')">
                <img src="${book.coverUrl}" alt="${book.title}" class="continue-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
                <div class="continue-play-overlay">
                    <span class="material-symbols-outlined">play_arrow</span>
                </div>
            </div>
            <div class="continue-details">
                <div class="flex items-center gap-2" style="margin-bottom: 6px;">
                    <span class="tag-badge">${book.category || 'หนังสือ'}</span>
                    <span class="tag-badge" style="background: rgba(46, 125, 50, 0.1); color: #2e7d32;">อ่านฟรี</span>
                </div>
                <h3 class="continue-book-title">${book.titleTh || book.title}</h3>
                <p class="continue-book-meta">โดย ${book.author} • อ่านแล้ว ${book.progress || 0}%</p>
                
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${book.progress || 0}%"></div>
                </div>

                <button class="btn-primary" onclick="window.luminaApp.openBook('${book.id}')">
                    <span class="material-symbols-outlined">menu_book</span>
                    เปิดอ่านหนังสือ
                </button>
            </div>
        `;
    }

    renderLibrary() {
        const grid = document.getElementById('myLibraryGrid');
        if (!grid) return;

        grid.className = this.viewMode === 'grid' ? 'books-grid' : 'books-list';

        let filtered = this.books.filter(b => {
            let matchCategory = true;
            if (this.activeCategory === 'กำลังอ่าน') matchCategory = b.progress > 0 && b.progress < 100;
            else if (this.activeCategory === 'อ่านจบแล้ว') matchCategory = b.isCompleted || b.progress >= 100;
            else if (this.activeCategory === 'รายการโปรด') {
                matchCategory = b.isFavorite; // Requires update if user specific favs handled externally
            }
            else if (this.activeCategory !== 'ทั้งหมด') matchCategory = b.category === this.activeCategory;

            let matchSearch = true;
            if (this.searchQuery) {
                const titleStr = (b.title + ' ' + (b.titleTh || '') + ' ' + b.author + ' ' + (b.category || '')).toLowerCase();
                matchSearch = titleStr.includes(this.searchQuery);
            }

            return matchCategory && matchSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-outline);">
                    <span class="material-symbols-outlined" style="font-size: 64px; margin-bottom: 12px;">search_off</span>
                    <p style="font-size: 1.1rem; font-weight: 500;">ไม่พบหนังสือในหมวดหมู่ "${this.activeCategory}"</p>
                    <p style="font-size: 0.9rem; margin-top: 4px;">คุณสามารถคลิกปุ่ม "+ เพิ่มหมวดหมู่" เพื่อสร้างหมวดใหม่ได้</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(book => {
            const isFav = book.isFavorite;

            return `
                <div class="book-card" onclick="window.luminaApp.openBook('${book.id}')">
                    <button class="favorite-btn-top ${isFav ? 'active' : ''}" 
                            onclick="event.stopPropagation(); window.luminaApp.toggleFavorite('${book.id}')"
                            title="เพิ่ม/ลบ จากรายการโปรด">
                        <span class="material-symbols-outlined">favorite</span>
                    </button>
                    <div class="book-cover-box">
                        <img src="${book.coverUrl}" alt="${book.title}" class="book-cover-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
                        <div class="book-cover-overlay">
                            <button class="action-circle-btn">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                        </div>
                    </div>
                    <div class="book-card-info">
                        <div>
                            <span class="tag-badge" style="font-size:0.68rem; margin-bottom:4px;">${book.category || 'วรรณกรรม'}</span>
                            <p class="book-title" title="${book.titleTh || book.title}">${book.titleTh || book.title}</p>
                            <p class="book-author">${book.author}</p>
                        </div>
                        <div class="book-progress-mini">
                            <div class="progress-mini-bar">
                                <div class="progress-mini-fill" style="width: ${book.progress || 0}%"></div>
                            </div>
                            <span class="progress-text">${book.progress || 0}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openBook(bookId) {
        if (!this.requireAuth('เปิดอ่านหนังสือฟรี')) {
            return;
        }

        const book = this.books.find(b => b.id === bookId);
        if (book && this.reader) {
            this.reader.open(book);
        }
    }

    async toggleFavorite(bookId) {
        if (!this.requireAuth('บันทึกหนังสือในรายการโปรด')) {
            return;
        }

        if (window.api) {
            try {
                const book = this.books.find(b => b.id === bookId);
                if (book && book.isFavorite) {
                    await window.api.removeFavorite(bookId);
                    showToast('ลบออกจากรายการโปรดแล้ว');
                } else {
                    await window.api.addFavorite(bookId);
                    showToast('บันทึกในรายการโปรดเรียบร้อยแล้ว ❤️');
                }
                
                await this.loadBooks();
                this.renderLibrary();
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    }

    async handleFileUpload(file) {
        if (!this.requireAuth('อัปโหลดหนังสือใหม่เข้าสู่ระบบ')) {
            return;
        }

        if (window.api) {
            try {
                window.api.validateFileClient(file, 'book');
                
                showToast(`กำลังประมวลผลและอัปโหลดไฟล์: ${file.name}`);
                const selectCategory = document.getElementById('uploadBookCategorySelect')?.value || 'วรรณกรรม';
                
                const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                
                const uploadRes = await window.api.uploadFile(file, 'book');
                
                // Then create book
                const newBook = {
                    title: fileNameWithoutExt,
                    titleTh: fileNameWithoutExt,
                    author: this.currentUser ? this.currentUser.name : 'ผู้ใช้อัปโหลด',
                    category: selectCategory,
                    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                    description: `หนังสืออัปโหลดเพิ่มเมื่อ ${new Date().toLocaleDateString('th-TH')}`,
                    fileUrl: uploadRes.url
                };

                await this.addBook(newBook);
                
                const uploadModal = document.getElementById('uploadModal');
                if (uploadModal) uploadModal.classList.remove('open');
                
            } catch (error) {
                showToast(error.message, 'error');
            }
        }
    }

    updateProfileStats() {
        if (!this.isLoggedIn()) return;
        const totalCount = this.books.length;
        const completedCount = this.books.filter(b => b.isCompleted || b.progress >= 100).length;
        const favoritesCount = this.books.filter(b => b.isFavorite).length;

        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileTier = document.getElementById('profileTier');

        if (profileName) profileName.textContent = this.currentUser.name || this.currentUser.username;
        if (profileEmail) profileEmail.textContent = this.currentUser.email || '-';
        if (profileAvatar) profileAvatar.src = this.currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
        if (profileTier) profileTier.textContent = this.currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : 'บัญชีใช้งาน';

        document.getElementById('statTotalBooks').textContent = totalCount;
        document.getElementById('statCompletedBooks').textContent = completedCount;
        document.getElementById('statFavorites').textContent = favoritesCount;
    }
}

// Global Toast Helper
function showToast(message, type = 'info') {
    if (window.api) {
        if (type === 'error') {
            window.api.showToastError(message);
        } else if (type === 'success') {
            window.api.showToastSuccess(message);
        } else {
            window.api.showToast(message, type);
        }
    } else {
        alert(message);
    }
}

window.showToast = showToast;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new LuminaApp();
});
