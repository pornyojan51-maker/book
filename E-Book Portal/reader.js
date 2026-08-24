// Reader Engine for Lumina Books - 100% Free & No Sign-up required
class EBookReader {
    constructor() {
        this.currentBook = null;
        this.currentChapterIndex = 0;
        this.fontSize = 18; // Default 18px
        this.fontFamily = 'var(--font-primary)';
        this.lineHeight = '1.8';
        this.theme = 'light'; // light, sepia, dark, midnight
        this.isSpeaking = false;
        this.synth = window.speechSynthesis || null;
        this.speechUtterance = null;
        
        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        this.overlay = document.getElementById('readerOverlay');
        this.toolbar = document.getElementById('readerToolbar');
        this.sidebar = document.getElementById('readerSidebar');
        this.canvas = document.getElementById('readerCanvas');
        this.paper = document.getElementById('readerPaper');
        this.tocContent = document.getElementById('tocContent');
        
        this.bookTitleEl = document.getElementById('readerBookTitle');
        this.chapterTitleEl = document.getElementById('readerChapterTitle');
        this.progressHeaderFill = document.getElementById('readerProgressHeaderFill');
        this.progressFooterText = document.getElementById('readerProgressFooterText');
        this.settingsPopover = document.getElementById('settingsPopover');
    }

    bindEvents() {
        // Toggle Sidebar
        const toggleSidebarBtn = document.getElementById('btnToggleSidebar');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('collapsed');
            });
        }

        // Close Reader
        const closeBtn = document.getElementById('btnCloseReader');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Toggle Settings Popover
        const settingsBtn = document.getElementById('btnReaderSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.settingsPopover.classList.toggle('open');
            });
        }

        document.addEventListener('click', (e) => {
            if (this.settingsPopover && !this.settingsPopover.contains(e.target) && e.target.id !== 'btnReaderSettings') {
                this.settingsPopover.classList.remove('open');
            }
        });

        // Track Scroll for Progress
        if (this.canvas) {
            this.canvas.addEventListener('scroll', () => this.updateProgressOnScroll());
        }

        // Keyboard Navigation
        window.addEventListener('keydown', (e) => {
            if (!this.overlay || !this.overlay.classList.contains('open')) return;
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                this.nextChapter();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                this.prevChapter();
            }
        });

        // Text Selection for Highlighting
        if (this.paper) {
            this.paper.addEventListener('mouseup', () => this.handleTextSelection());
        }
    }

    open(book, chapterIndex = 0) {
        this.currentBook = book;
        this.currentChapterIndex = chapterIndex;
        
        this.bookTitleEl.textContent = book.titleTh || book.title;
        this.renderTOC();
        this.loadChapter(this.currentChapterIndex);

        this.overlay.classList.add('open');
        document.body.classList.add('reader-active');
        
        // Restore saved settings
        const savedSettings = JSON.parse(localStorage.getItem('lumina_reader_settings') || '{}');
        if (savedSettings.theme) this.setTheme(savedSettings.theme);
        if (savedSettings.fontSize) this.setFontSize(savedSettings.fontSize);
        if (savedSettings.fontFamily) this.setFontFamily(savedSettings.fontFamily);
    }

    close() {
        if (this.isSpeaking) this.stopTTS();
        this.overlay.classList.remove('open');
        document.body.classList.remove('reader-active');
        this.saveBookProgress();
    }

    renderTOC() {
        if (!this.tocContent || !this.currentBook.chapters) return;
        this.tocContent.innerHTML = '';
        
        this.currentBook.chapters.forEach((ch, idx) => {
            const item = document.createElement('div');
            item.className = `toc-item ${idx === this.currentChapterIndex ? 'active' : ''}`;
            item.textContent = ch.title;
            item.addEventListener('click', () => {
                this.loadChapter(idx);
                if (window.innerWidth <= 768) {
                    this.sidebar.classList.add('collapsed');
                }
            });
            this.tocContent.appendChild(item);
        });
    }

    loadChapter(index) {
        if (!this.currentBook.chapters || index < 0 || index >= this.currentBook.chapters.length) return;
        
        this.currentChapterIndex = index;
        const chapter = this.currentBook.chapters[index];
        
        this.chapterTitleEl.textContent = chapter.title;
        this.paper.innerHTML = chapter.content;
        this.canvas.scrollTop = 0;

        // Apply formatting
        this.applyPaperStyle();
        this.renderTOC();
        this.updateProgressOnScroll();
        this.updateBookmarkButtonUI();
        this.saveBookProgress();
    }

    nextChapter() {
        if (this.currentChapterIndex < this.currentBook.chapters.length - 1) {
            this.loadChapter(this.currentChapterIndex + 1);
            showToast('ไปยังบทถัดไป');
        } else {
            showToast('คุณอ่านถึงบทสุดท้ายแล้ว');
        }
    }

    prevChapter() {
        if (this.currentChapterIndex > 0) {
            this.loadChapter(this.currentChapterIndex - 1);
            showToast('ย้อนกลับไปยังบทก่อนหน้า');
        }
    }

    setFontSize(deltaOrValue) {
        if (typeof deltaOrValue === 'number' && deltaOrValue < 5) {
            this.fontSize = Math.max(12, Math.min(32, this.fontSize + deltaOrValue));
        } else if (typeof deltaOrValue === 'number') {
            this.fontSize = deltaOrValue;
        }
        this.applyPaperStyle();
        this.saveSettings();
    }

    setFontFamily(family) {
        this.fontFamily = family;
        this.applyPaperStyle();
        this.saveSettings();
    }

    setLineHeight(height) {
        this.lineHeight = height;
        this.applyPaperStyle();
        this.saveSettings();
    }

    setTheme(themeName) {
        this.theme = themeName;
        this.overlay.className = `reader-overlay open theme-${themeName}`;
        
        const label = document.getElementById('themeLabel');
        if (label) {
            const map = { light: 'สว่าง', sepia: 'ซีเปีย', dark: 'มืด', midnight: 'OLED' };
            label.textContent = map[themeName] || 'สว่าง';
        }
        this.saveSettings();
    }

    applyPaperStyle() {
        if (!this.paper) return;
        this.paper.style.fontSize = `${this.fontSize}px`;
        this.paper.style.fontFamily = this.fontFamily;
        this.paper.style.lineHeight = this.lineHeight;
    }

    saveSettings() {
        localStorage.setItem('lumina_reader_settings', JSON.stringify({
            theme: this.theme,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            lineHeight: this.lineHeight
        }));
    }

    updateProgressOnScroll() {
        if (!this.canvas || !this.currentBook) return;
        const scrollTop = this.canvas.scrollTop;
        const scrollHeight = this.canvas.scrollHeight - this.canvas.clientHeight;
        const pagePercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;

        const totalCh = this.currentBook.chapters.length;
        const overallProgress = Math.round(((this.currentChapterIndex + pagePercentage) / totalCh) * 100);

        if (this.progressHeaderFill) {
            this.progressHeaderFill.style.width = `${Math.min(100, overallProgress)}%`;
        }
        if (this.progressFooterText) {
            this.progressFooterText.textContent = `บทที่ ${this.currentChapterIndex + 1} จาก ${totalCh} (${overallProgress}%)`;
        }

        this.currentBook.progress = overallProgress;
    }

    saveBookProgress() {
        if (!this.currentBook) return;
        this.currentBook.lastReadDate = new Date().toISOString();
        this.currentBook.isReading = true;
        if (this.currentBook.progress >= 95) {
            this.currentBook.isCompleted = true;
        }

        if (window.luminaApp) {
            window.luminaApp.updateBookState(this.currentBook);
        }
    }

    toggleTTS() {
        if (!this.synth) {
            showToast('เบราว์เซอร์นี้ไม่รองรับระบบอ่านออกเสียง');
            return;
        }

        if (this.isSpeaking) {
            this.stopTTS();
            showToast('หยุดการอ่านออกเสียงแล้ว');
        } else {
            const text = this.paper.innerText;
            if (!text) return;
            
            this.speechUtterance = new SpeechSynthesisUtterance(text);
            this.speechUtterance.lang = 'th-TH';
            this.speechUtterance.rate = 1.0;

            this.speechUtterance.onend = () => {
                this.isSpeaking = false;
                this.updateTTSButtonUI();
            };

            this.synth.speak(this.speechUtterance);
            this.isSpeaking = true;
            this.updateTTSButtonUI();
            showToast('กำลังอ่านออกเสียงด้วยเสียงสังเคราะห์ 🔊');
        }
    }

    stopTTS() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
        this.updateTTSButtonUI();
    }

    updateTTSButtonUI() {
        const btn = document.getElementById('btnTTS');
        if (btn) {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = this.isSpeaking ? 'volume_off' : 'volume_up';
            }
            btn.classList.toggle('active', this.isSpeaking);
        }
    }

    toggleBookmark() {
        if (!this.currentBook) return;
        const key = `bookmark_${this.currentBook.id}`;
        let bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
        const existingIdx = bookmarks.findIndex(b => b.chapterIndex === this.currentChapterIndex);

        if (existingIdx >= 0) {
            bookmarks.splice(existingIdx, 1);
            showToast('ลบบุ๊กมาร์กของบทนี้เรียบร้อยแล้ว');
        } else {
            bookmarks.push({
                chapterIndex: this.currentChapterIndex,
                title: this.currentBook.chapters[this.currentChapterIndex].title,
                date: new Date().toLocaleDateString('th-TH')
            });
            showToast('บันทึกบุ๊กมาร์กเรียบร้อยแล้ว 📌');
        }

        localStorage.setItem(key, JSON.stringify(bookmarks));
        this.updateBookmarkButtonUI();
    }

    updateBookmarkButtonUI() {
        if (!this.currentBook) return;
        const key = `bookmark_${this.currentBook.id}`;
        let bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
        const isBookmarked = bookmarks.some(b => b.chapterIndex === this.currentChapterIndex);
        const btn = document.getElementById('btnBookmark');
        if (btn) {
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.style.fontVariationSettings = isBookmarked ? "'FILL' 1" : "'FILL' 0";
            }
        }
    }

    handleTextSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText.length > 2) {
            // Text selection highlight logic
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.overlay.requestFullscreen().catch(err => {
                showToast('ไม่สามารถเปิดโหมดเต็มจอได้');
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Global Toast Helper
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    const icon = type === 'error' ? 'error' : 'info';
    toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

window.showToast = showToast;
