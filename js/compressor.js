/**
 * 图片压缩器 - 核心处理逻辑
 * 使用浏览器 Canvas API 在客户端完成图片压缩与尺寸调整
 */

const ImageCompressor = {
    /**
     * 压缩单张图片
     * @param {File} file - 图片文件
     * @param {Object} options - 压缩选项
     * @param {number} options.quality - 压缩质量 0.1-1.0
     * @param {string} options.format - 输出格式 MIME 类型，'auto' 保持原格式
     * @param {number|null} options.maxWidth - 最大宽度
     * @param {number|null} options.maxHeight - 最大高度
     * @returns {Promise<Object>} 压缩结果
     */
    async compress(file, options) {
        const { quality, format, maxWidth, maxHeight } = options;

        const img = await this.loadImage(file);
        const original = {
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: file.size,
            type: file.type,
        };

        const dimensions = this.calculateDimensions(
            original.width,
            original.height,
            maxWidth,
            maxHeight
        );

        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d');

        if (format === 'image/jpeg' || (format === 'auto' && file.type === 'image/jpeg')) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const outputFormat = format === 'auto' ? file.type : format;
        const blob = await this.canvasToBlob(canvas, outputFormat, quality);

        return {
            blob,
            url: URL.createObjectURL(blob),
            name: this.getOutputName(file.name, outputFormat),
            original,
            compressed: {
                width: canvas.width,
                height: canvas.height,
                size: blob.size,
                type: outputFormat,
            },
            savedPercent: Math.max(0, Math.round((1 - blob.size / file.size) * 100)),
        };
    },

    /**
     * 加载图片文件为 Image 对象
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('图片加载失败'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    },

    /**
     * 计算调整后的尺寸，保持宽高比
     */
    calculateDimensions(width, height, maxWidth, maxHeight) {
        let newWidth = width;
        let newHeight = height;

        if (maxWidth && newWidth > maxWidth) {
            newHeight = Math.round((newHeight * maxWidth) / newWidth);
            newWidth = maxWidth;
        }

        if (maxHeight && newHeight > maxHeight) {
            newWidth = Math.round((newWidth * maxHeight) / newHeight);
            newHeight = maxHeight;
        }

        return { width: newWidth, height: newHeight };
    },

    /**
     * Canvas 转 Blob
     */
    canvasToBlob(canvas, format, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('压缩失败：无法生成图片'));
                },
                format,
                quality
            );
        });
    },

    /**
     * 生成输出文件名
     */
    getOutputName(originalName, format) {
        const ext = format.split('/')[1];
        const baseName = originalName.replace(/\.[^.]+$/, '');
        return `${baseName}.${ext}`;
    },

    /**
     * 格式化文件大小
     */
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },
};
