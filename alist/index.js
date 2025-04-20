/*
 * @Author: kasuie
 * @Date: 2024-04-24 15:35:59
 * @LastEditors: kasuie
 * @LastEditTime: 2024-11-05 09:38:54
 * @Description:
 */
let footer = false;
const MAX_RETRY = 15; // 最大重试次数增加到15次
const RETRY_INTERVAL = 200; // 检测间隔缩短到200ms

const footerStyle = `
  .mio-footer-container {
    --text-color: rgb(var(--mio-text));
    --hover-color: rgba(var(--mio-primary));
    
    width: 100%;
    padding: 1rem 0;
    display: flex !important;
    justify-content: center;
    align-items: center;
    opacity: 0.9;
    transition: opacity 0.3s ease;
  }
  
  .mio-footer-container:hover {
    opacity: 1;
  }

  .mio-footer-content {
    display: flex;
    gap: 1.2rem;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-color);
  }

  .mio-footer-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: color 0.2s ease;
  }

  .mio-footer-link:hover {
    color: var(--hover-color);
    text-decoration: underline;
  }

  .mio-footer-divider {
    color: rgba(var(--mio-text), 0.4);
    user-select: none;
  }

  .mio-footer-icon {
    width: 1.125rem;
    height: 1.125rem;
    border-radius: 4px;
    object-fit: contain;
    transition: transform 0.2s ease;
  }

  .mio-footer-link:hover .mio-footer-icon {
    transform: scale(1.1);
  }
`;

const styleManager = {
  styleElement: null,
  inject() {
    if (!this.styleElement) {
      this.styleElement = document.createElement("style");
      this.styleElement.textContent = footerStyle;
      document.head.appendChild(this.styleElement);
    }
  },
  remove() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
};

const createElement = (tag, attrs = {}, children = []) => {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      element.setAttribute(key, value);
    }
  });
  children.forEach(child => element.appendChild(child));
  return element;
};

const renderFooter = (data) => {
  const container = document.querySelector(".mio-footer-container");
  if (!container) return;

  const contentFragment = document.createDocumentFragment();
  
  data.forEach((item, index) => {
    if (index > 0) {
      contentFragment.appendChild(
        createElement("span", { class: "mio-footer-divider" }, [document.createTextNode("|")])
      );
    }

    const link = createElement("a", { 
      class: "mio-footer-link",
      href: item.url,
      target: item.target || "_blank",
      rel: "noopener noreferrer"
    });

    if (item.icon) {
      const icon = createElement("img", {
        class: "mio-footer-icon",
        src: `https://api.remio.cc/icon/${new URL(item.url).host}.ico`,
        alt: `${item.text} icon`,
        loading: "lazy"
      });
      link.appendChild(icon);
    }

    link.appendChild(document.createTextNode(item.text));
    contentFragment.appendChild(link);
  });

  const contentWrapper = createElement("div", { class: "mio-footer-content" }, [contentFragment]);
  container.innerHTML = "";
  container.appendChild(contentWrapper);
};

const setupFooterContainer = () => {
  const existingFooter = document.querySelector(".footer");
  if (!existingFooter) return null;

  const container = createElement("div", { class: "mio-footer-container" });
  existingFooter.replaceWith(container);
  return container;
};

const loadFooterData = () => {
  try {
    const dataElement = document.querySelector("#footer-data");
    return dataElement ? JSON.parse(dataElement.textContent) : null;
  } catch (error) {
    console.error("Footer data parsing failed:", error);
    return null;
  }
};

const initialize = () => {
  styleManager.inject();
  
  let retryCount = 0;
  const initialization = () => {
    if (retryCount++ > MAX_RETRY) return;

    const footerData = loadFooterData();
    if (!footerData) return;

    if (!document.querySelector(".mio-footer-container")) {
      if (!setupFooterContainer()) return;
    }

    renderFooter(footerData);
    footer = true;
  };

  const observer = new MutationObserver(initialization);
  observer.observe(document.body, { 
    childList: true,
    subtree: true
  });

  initialization(); // 立即尝试初始化
  const retryTimer = setInterval(() => {
    if (footer || retryCount > MAX_RETRY) {
      clearInterval(retryTimer);
      observer.disconnect();
    } else {
      initialization();
    }
  }, RETRY_INTERVAL);
};

// 安全启动
if (document.readyState === "complete") {
  initialize();
} else {
  window.addEventListener("DOMContentLoaded", initialize);
}

// 监听控制台打开（检测窗口大小变化）
let isConsoleOpen = false;
setInterval(() => {
  const threshold = 160; // 控制台打开时窗口高度变化阈值
  if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
    if (!isConsoleOpen) {
      fakeError(); // 触发假报错
      isConsoleOpen = true;
    }
  } else {
    isConsoleOpen = false;
  }
}, 500);

// 伪造一个看起来超专业的错误
function fakeError() {
  console.clear(); // 先清空控制台
  
  // 1. 输出假错误（带格式）
  console.error(
    "%c🚨 SECURITY ALERT (Code: 0x8F4A2E)",
    "font-size: 16px; color: red; font-weight: bold;"
  );
  console.error(
    "%c⚠️ Unauthorized DevTools access detected.\nThis page is protected by Quantum CSS Encryption™.\n\nTo continue, please close DevTools and refresh the page.",
    "font-size: 14px; color: orange; line-height: 1.5;"
  );
  
  // 2. 伪造堆栈跟踪（看起来超真实）
  console.groupCollapsed("%c🔍 Stack Trace", "color: gray;");
  console.log("at encryptedCSS (webpack:///secure/module.js:42:13)");
  console.log("at QuantumRenderer._compile (webpack:///core/quantum.js:88:21)");
  console.log("at <anonymous>:1:11");
  console.groupEnd();
  
}

document.addEventListener("DOMContentLoaded", function() {
    // 获取body元素
    const bodyElement = document.querySelector('body');
    if (!bodyElement) return; // 如果没有找到指定的元素，则退出

    // 判断是否为移动设备（屏幕宽度小于等于960px）
    const isMobile = window.outerWidth <= 960;

    // 随机生成图片索引（范围为1到150）
    const maxImages = 150;
    const randomImageIndex = Math.floor(Math.random() * maxImages) + 1;

    // 根据设备类型选择图片路径
    let imageUrl;
    if (isMobile) {
        imageUrl = `https://cdn.jsdelivr.net/gh/Cyber-HuaTuo/Cloudflare-Pages/alist/img/mobile/mobile_${randomImageIndex}.jpg`;
    } else {
        imageUrl = `https://cdn.jsdelivr.net/gh/Cyber-HuaTuo/Cloudflare-Pages/alist/img/desktop/desktop_${randomImageIndex}.jpg`;
    }

    // 设置背景图片
    bodyElement.style.setProperty('--dynamic-bg', `url(${imageUrl})`);
});