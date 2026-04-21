document.addEventListener('DOMContentLoaded', function () {
    const quantSelector = document.getElementById('quantitativeSelector');
    const quantImage    = document.getElementById('quantImage');
  
    if (!quantSelector || !quantImage) {
      console.error('[Quant] 找不到 quantitativeSelector 或 quantImage。请确认 id 是否匹配。');
      return;
    }
  
    // 你的真实目录（注意大小写）
    const BASE_DIR = 'images/Quantitative';
  
    function updateQuantImage() {
      const value = quantSelector.value;          // 例如 "7-task" 或 "OOD (mixed)"
      const filename = value + '.png';            // 与文件名完全一致
      const encoded  = encodeURIComponent(filename); // 编码空格/括号
      const path     = `${BASE_DIR}/${encoded}`;
  
      console.log('[Quant update]', value, '→', path);
      quantImage.onerror = null;
      quantImage.onerror = () => console.warn('[Quant 404]', path, '检查目录/大小写/后缀/文件是否存在');
      quantImage.src = path;
    }
  
    // 绑定切换
    quantSelector.addEventListener('change', updateQuantImage);
  
    // 首屏初始化（以当前选项值加载）
    updateQuantImage();
  });