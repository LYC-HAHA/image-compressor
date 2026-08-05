/**
 * 应用交互逻辑
 */

const App = {
    files: [],
    results: [],

    init() {
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('fileInput');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.resultsSection = document.getElementById('resultsSection');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.formatSelect = document.getElementById('formatSelect');
        this.resizeToggle = document.getElementById('resizeToggle');
        this.resizeControls = document.getElementById('resizeControls');
        this.compressBtn = document.getElementById('compressBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadAllBtn = document.getElementById('downloadAllBtn');
        this.resultsList = document.getElementById('resultsList');
        this.resultsSummary = document.getElementById('resultsSummary');

        this.bindEvents();
    },

    bindEvents() {
        this.dropzone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropzone.classList.add('dragover');
        });
        this.dropzone.addEventListener('dragleave', () => {
            this.dropzone.classList.remove('dragover');
        });
        this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        this.qualitySlider.addEventListener('input', () => {
            this.qualityValue.textContent = this.qualitySlider.value + '%';
        });

        this.resizeToggle.addEventListener('change', () => {
            this.resizeControls.style.display = this.resizeToggle.checked ? 'block' : 'none';
        });

        this.compressBtn.addEventListener('click', () => this.compressAll());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
    },

    handleFiles(fileList) {
        const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
        if (valid.length === 0) {
            alert('请选择有效的图片文件（JPEG、PNG、WebP）');
            return;
        }
        this.files = valid;
        this.results = [];
        this.settingsPanel.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.resultsList.innerHTML = '';
        this.dropzone.querySelector('.dropzone-title').textContent =
            `已选择 ${valid.length} 张图片，点击重新选择`;
    },

    getOptions() {
        const quality = parseInt(this.qualitySlider.value) / 100;
        const format = this.formatSelect.value;
        const resizeEnabled = this.resizeToggle.checked;
        const maxWidth = resizeEnabled ? parseInt(document.getElementById('maxWidth').value) || null : null;
        const maxHeight = resizeEnabled ? parseInt(document.getElementById('maxHeight').value) || null : null;
        return { quality, format, maxWidth, maxHeight };
    },

    async compressAll() {
        const options = this.getOptions();
        this.results = [];
        this.resultsList.innerHTML = '';
        this.resultsSection.style.display = 'block';

        this.compressBtn.disabled = true;
        this.compressBtn.textContent = '压缩中...';

        for (const file of this.files) {
            const placeholder = this.addResultPlaceholder(file);
            try {
                const result = await ImageCompressor.compress(file, options);
                this.results.push(result);
                this.renderResult(result, placeholder);
            } catch (err) {
                this.renderError(placeholder, err.message);
            }
        }

        this.renderSummary();
        this.compressBtn.disabled = false;
        this.compressBtn.textContent = '开始压缩';
    },

    addResultPlaceholder(file) {
        const div = document.createElement('div');
        div.className = 'result-item loading';
        div.innerHTML = `<div class="result-info"><span class="result-name">${file.name}</span><span class="result-status">处理中...</span></div>`;
        this.resultsList.appendChild(div);
        return div;
    },

    renderResult(result, placeholder) {
        const fmt = ImageCompressor.formatSize;
        placeholder.className = 'result-item';
        placeholder.innerHTML = `
            <div class="result-preview">
                <img src="${result.url}" alt="${result.name}">
            </div>
            <div class="result-info">
                <span class="result-name">${result.name}</span>
                <div class="result-stats">
                    <span>${fmt(result.original.size)} → <strong>${fmt(result.compressed.size)}</strong></span>
                    <span class="saved-badge ${result.savedPercent > 0 ? 'positive' : 'negative'}">
                        ${result.savedPercent > 0 ? '↓' : '↑'} ${Math.abs(result.savedPercent)}%
                    </span>
                </div>
                <div class="result-dims">
                    ${result.original.width}×${result.original.height} → ${result.compressed.width}×${result.compressed.height}
                </div>
            </div>
            <a class="btn btn-primary btn-sm" href="${result.url}" download="${result.name}">下载</a>
        `;
    },

    renderError(placeholder, message) {
        placeholder.className = 'result-item error';
        placeholder.innerHTML = `<div class="result-info"><span class="result-name">❌ ${message}</span></div>`;
    },

    renderSummary() {
        if (this.results.length === 0) return;
        const totalOriginal = this.results.reduce((s, r) => s + r.original.size, 0);
        const totalCompressed = this.results.reduce((s, r) => s + r.compressed.size, 0);
        const saved = Math.max(0, Math.round((1 - totalCompressed / totalOriginal) * 100));
        const fmt = ImageCompressor.formatSize;

        this.resultsSummary.innerHTML = `
            <span>共 ${this.results.length} 张图片</span>
            <span>${fmt(totalOriginal)} → <strong>${fmt(totalCompressed)}</strong></span>
            <span class="saved-badge ${saved > 0 ? 'positive' : 'negative'}">
                总共 ${saved > 0 ? '减少' : '增加'} ${Math.abs(saved)}%
            </span>
        `;
    },

    downloadAll() {
        this.results.forEach((r, i) => {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = r.url;
                a.download = r.name;
                a.click();
            }, i * 300);
        });
    },

    reset() {
        this.files = [];
        this.results = [];
        this.fileInput.value = '';
        this.settingsPanel.style.display = 'none';
        this.resultsSection.style.display = 'none';
        this.dropzone.querySelector('.dropzone-title').textContent = '点击或拖拽图片到此处';
    },
};

document.addEventListener('DOMContentLoaded', () => App.init());
