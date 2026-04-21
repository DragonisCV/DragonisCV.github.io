document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".comparison-container");
  const slider = document.querySelector(".slider");
  const image2Container = document.getElementById("image2-container");
  const image1 = document.getElementById("image1");
  const image2 = document.getElementById("image2");

  let isDragging = false;
  let currentImage = "Derain";

  function handleSliderMove(e) {
    if (!isDragging) return;

    const rect = container.getBoundingClientRect();
    let x;

    if (e.type === "touchmove") {
      x = e.touches[0].clientX - rect.left;
    } else {
      x = e.clientX - rect.left;
    }
    const percentage = (x / rect.width) * 100;
    const limitedPercentage = Math.min(Math.max(percentage, 0), 100);
    // Move the slider according to the calculated percentage
    slider.style.left = `${limitedPercentage}%`;

    // Update the width of the image2 container based on the slider position
    image2Container.style.width = `${limitedPercentage}%`;
  }

  slider.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener("mousemove", handleSliderMove);
  document.addEventListener("mouseup", () => (isDragging = false));

  slider.addEventListener("touchstart", (e) => {
    isDragging = true;
    e.preventDefault(); // Prevent scrolling while dragging
  });

  document.addEventListener("touchmove", (e) => {
    if (isDragging) {
      e.preventDefault();
      handleSliderMove(e);
    }
  });

  document.addEventListener("touchend", () => (isDragging = false));

  document
    .getElementById("imageSelector")
    .addEventListener("change", function () {
      currentImage = this.value;

      // Update both active buttons
      document.querySelectorAll(".method-button.active").forEach((button) => {
        const imageNum = button.dataset.image;
        const method = button.dataset.method;
        const image = document.getElementById(`image${imageNum}`);
        image.src = `images/${currentImage}/${method}.png`;
      });
    });

  document.querySelectorAll(".method-button").forEach((button) => {
    button.addEventListener("click", function () {
      const selector = this.closest(".method-selector");
      selector.querySelectorAll(".method-button").forEach((btn) => {
        btn.classList.remove("active");
      });

      this.classList.add("active");

      const imageNum = this.dataset.image;
      const method = this.dataset.method; // Convert method to lowercase
      const image = document.getElementById(`image${imageNum}`);
      const imagePath = `images/${currentImage}/${method}.png`;

      image.src = imagePath;
    });
  });

  // Set default buttons on load
  window.addEventListener("load", () => {
    const leftDefault = document.querySelector(
      '.left-selector [data-method="LQ"]'
    );
    const rightDefault = document.querySelector(
      '.right-selector [data-method="Ours"]'
    );

    if (leftDefault) {
      leftDefault.classList.add("active");
      leftDefault.click();
    }

    if (rightDefault) {
      rightDefault.classList.add("active");
      rightDefault.click();
    }
  });
  (function () {
    // 可调参数
    const PATCH_SIZE = 40; // 取样窗口（像素，基于显示尺寸）
    const SCALE = 4; // 放大倍数（4x）

    // 选中你这段对比容器
    const container = document.querySelector(".comparison-container");
    if (!container) return;

    // 确保容器可作为绝对定位参考
    const cs = window.getComputedStyle(container);
    if (cs.position === "static") container.style.position = "relative";

    // 取两张图（左：image2；右：image1）
    const imgLeft = document.getElementById("image2");
    const imgRight = document.getElementById("image1");
    if (!imgLeft || !imgRight) return;

    // 创建放大镜 DOM
    const magnifier = document.createElement("div");
    magnifier.className = "magnifier";
    magnifier.innerHTML = `
        <div class="magnifier-pane pane-left"  title="Left image zoom"></div>
        <div class="magnifier-pane pane-right" title="Right image zoom"></div>
      `;
    container.appendChild(magnifier);
    const paneL = magnifier.querySelector(".pane-left");
    const paneR = magnifier.querySelector(".pane-right");

    // 工具函数：给定鼠标在容器内坐标，更新两 pane 的背景
    function updateMagnifier(mouseX, mouseY) {
      // 用 getBoundingClientRect 获取图像在页面中的可见区域
      const rectL = imgLeft.getBoundingClientRect();
      const rectR = imgRight.getBoundingClientRect();
      const rectC = container.getBoundingClientRect();

      // 将鼠标点（相对容器）映射到左右图像坐标系中
      // 你的两张图是重叠叠放的（滑块裁剪显示），它们在容器里对齐，
      // 因此我们可以用同一容器内坐标去采样两张图。
      const xInImg = mouseX;
      const yInImg = mouseY;

      // 当前显示尺寸（像素）
      const wL = imgLeft.clientWidth,
        hL = imgLeft.clientHeight;
      const wR = imgRight.clientWidth,
        hR = imgRight.clientHeight;

      // 限制采样窗口不越界
      const bgXL = Math.min(
        Math.max(xInImg - PATCH_SIZE / 2, 0),
        wL - PATCH_SIZE
      );
      const bgYL = Math.min(
        Math.max(yInImg - PATCH_SIZE / 2, 0),
        hL - PATCH_SIZE
      );
      const bgXR = Math.min(
        Math.max(xInImg - PATCH_SIZE / 2, 0),
        wR - PATCH_SIZE
      );
      const bgYR = Math.min(
        Math.max(yInImg - PATCH_SIZE / 2, 0),
        hR - PATCH_SIZE
      );

      // 背景尺寸为显示尺寸 * 放大倍数（保持像素对应）
      const bgSizeLW = wL * SCALE,
        bgSizeLH = hL * SCALE;
      const bgSizeRW = wR * SCALE,
        bgSizeRH = hR * SCALE;

      // 更新左窗（取自 image2）
      paneL.style.backgroundImage = `url("${
        imgLeft.currentSrc || imgLeft.src
      }")`;
      paneL.style.backgroundSize = `${bgSizeLW}px ${bgSizeLH}px`;
      paneL.style.backgroundPosition = `-${bgXL * SCALE}px -${bgYL * SCALE}px`;

      // 更新右窗（取自 image1）
      paneR.style.backgroundImage = `url("${
        imgRight.currentSrc || imgRight.src
      }")`;
      paneR.style.backgroundSize = `${bgSizeRW}px ${bgSizeRH}px`;
      paneR.style.backgroundPosition = `-${bgXR * SCALE}px -${bgYR * SCALE}px`;
    }

    // 辅助：把页面坐标转换为容器内坐标
    function getPointInContainer(evt) {
      const rect = container.getBoundingClientRect();
      let x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left;
      let y = (evt.touches ? evt.touches[0].clientY : evt.clientY) - rect.top;
      // clamp
      x = Math.max(0, Math.min(x, container.clientWidth));
      y = Math.max(0, Math.min(y, container.clientHeight));
      return { x, y };
    }

    // 事件绑定：鼠标移动时更新放大镜
    function handleMove(evt) {
      const { x, y } = getPointInContainer(evt);
      magnifier.style.display = "flex";
      updateMagnifier(x, y);
    }
    function handleLeave() {
      magnifier.style.display = "none";
    }

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);

    // 为了保证首次进入就有内容，等待图片加载完成后初始化一次
    const maybeInit = () => {
      if (imgLeft.complete && imgRight.complete) {
        magnifier.style.display = "none"; // 初始隐藏
        // 可选：把鼠标位置默认设为容器中心预渲染一帧
        updateMagnifier(container.clientWidth / 2, container.clientHeight / 2);
      }
    };
    imgLeft.addEventListener("load", maybeInit, { once: true });
    imgRight.addEventListener("load", maybeInit, { once: true });
    // 若已缓存加载完成
    maybeInit();

    // —— 与滑块的兼容性 ——
    // 你的滑块按钮可能会拖动改变遮罩，放大镜不拦截事件，不需特别处理。
    // 如果你在拖动时希望持续刷新放大镜，可在滑块拖动事件里手动触发一次：
    // updateMagnifier(lastX, lastY);
  })();
});
