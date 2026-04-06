(function () {
  const body = document.body;
  const root = document.documentElement;
  const openButton = document.getElementById("mobileMenuOpen");
  const closeButton = document.getElementById("mobileMenuClose");
  const overlay = document.getElementById("sheetOverlay");
  const sheet = document.getElementById("sheet");
  const sheetLinks = sheet ? sheet.querySelectorAll("a[href^='#']") : [];
  const themeToggle = document.getElementById("themeToggle");
  const projectCards = Array.from(document.querySelectorAll(".project-card"));
  const projectPreviewButtons = Array.from(document.querySelectorAll(".project-preview-btn"));
  const projectPreviewOverlay = document.getElementById("projectPreviewOverlay");
  const projectPreviewModal = document.getElementById("projectPreviewModal");
  const projectPreviewClose = document.getElementById("projectPreviewClose");
  const projectPreviewImage = document.getElementById("projectPreviewImage");
  const projectPreviewTitle = document.getElementById("projectPreviewTitle");
  const projectPreviewDescription = document.getElementById("projectPreviewDescription");
  const projectPreviewRole = document.getElementById("projectPreviewRole");
  const projectPreviewClient = document.getElementById("projectPreviewClient");
  const projectPreviewPeriod = document.getElementById("projectPreviewPeriod");
  const projectPreviewFullText = document.getElementById("projectPreviewFullText");
  const projectPreviewHighlights = document.getElementById("projectPreviewHighlights");
  const projectPreviewTags = document.getElementById("projectPreviewTags");
  const projectPreviewLive = document.getElementById("projectPreviewLive");
  const projectPreviewCode = document.getElementById("projectPreviewCode");
  const FOCUSABLE_SELECTOR = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(", ");
  let currentProjectIndex = 0;
  let scrollLockCount = 0;
  let lastProjectPreviewTrigger = null;

  function lockBodyScroll() {
    scrollLockCount += 1;
    if (scrollLockCount === 1) body.style.overflow = "hidden";
  }

  function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) body.style.overflow = "";
  }

  function applyTheme(isDark) {
    root.classList.toggle("dark", isDark);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.innerHTML = isDark
        ? '<svg class="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.64 5.64l1.56 1.56M16.8 16.8l1.56 1.56M18.36 5.64 16.8 7.2M7.2 16.8l-1.56 1.56M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>'
        : '<svg class="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>';
    }
  }

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextIsDark = !root.classList.contains("dark");
      applyTheme(nextIsDark);
      localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    });
  }

  function openSheet() {
    if (!overlay || !sheet || !openButton) return;
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add("open");
      sheet.classList.add("open");
      sheet.setAttribute("aria-hidden", "false");
      openButton.setAttribute("aria-expanded", "true");
      lockBodyScroll();
    });
  }

  function closeSheet() {
    if (!overlay || !sheet || !openButton) return;
    overlay.classList.remove("open");
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
    unlockBodyScroll();
    setTimeout(() => {
      if (!overlay.classList.contains("open")) overlay.hidden = true;
    }, 300);
  }

  if (openButton) openButton.addEventListener("click", openSheet);
  if (closeButton) closeButton.addEventListener("click", closeSheet);
  if (overlay) overlay.addEventListener("click", closeSheet);
  sheetLinks.forEach((link) => link.addEventListener("click", closeSheet));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSheet();
  });

  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  function getProjectData(card) {
    const image = card.querySelector(".project-image img");
    const title = card.querySelector(".project-content h3");
    const description = card.querySelector(".project-content p");
    const tags = Array.from(card.querySelectorAll(".tag-list .badge")).map((tag) => tag.textContent.trim());
    const actionLinks = Array.from(card.querySelectorAll(".project-actions a"));

    return {
      imageSrc: image ? image.getAttribute("src") : "",
      imageAlt: image ? image.getAttribute("alt") : "",
      title: title ? title.textContent.trim() : "",
      description: description ? description.textContent.trim() : "",
      role: card.dataset.role || "Not specified",
      client: card.dataset.client || "Internal project",
      period: card.dataset.period || "Not specified",
      fullText: card.dataset.fullText || "",
      highlights: (card.dataset.highlights || "")
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean),
      tags,
      liveUrl: card.dataset.liveUrl || (actionLinks[0] ? actionLinks[0].getAttribute("href") : "#"),
      codeUrl: card.dataset.codeUrl || (actionLinks[1] ? actionLinks[1].getAttribute("href") : "#"),
    };
  }

  function renderProjectPreview(index) {
    const project = getProjectData(projectCards[index]);
    if (!projectPreviewImage || !projectPreviewTitle || !projectPreviewDescription || !projectPreviewRole || !projectPreviewClient || !projectPreviewPeriod || !projectPreviewFullText || !projectPreviewHighlights || !projectPreviewTags || !projectPreviewLive || !projectPreviewCode) return;

    projectPreviewImage.src = project.imageSrc;
    projectPreviewImage.alt = project.imageAlt || project.title;
    projectPreviewTitle.textContent = project.title;
    projectPreviewDescription.textContent = project.description;
    projectPreviewRole.textContent = project.role;
    projectPreviewClient.textContent = project.client;
    projectPreviewPeriod.textContent = project.period;
    projectPreviewFullText.textContent = project.fullText || project.description;
    projectPreviewHighlights.replaceChildren();
    if (project.highlights.length) {
      project.highlights.forEach((item) => {
        const itemNode = document.createElement("li");
        itemNode.textContent = item;
        projectPreviewHighlights.appendChild(itemNode);
      });
    } else {
      const fallbackNode = document.createElement("li");
      fallbackNode.textContent = "Additional details are not provided yet.";
      projectPreviewHighlights.appendChild(fallbackNode);
    }
    projectPreviewTags.replaceChildren();
    project.tags.forEach((tag) => {
      const tagNode = document.createElement("span");
      tagNode.className = "badge badge-secondary badge-pill";
      tagNode.textContent = tag;
      projectPreviewTags.appendChild(tagNode);
    });
    projectPreviewLive.href = project.liveUrl;
    projectPreviewCode.href = project.codeUrl;
    [projectPreviewLive, projectPreviewCode].forEach((linkNode) => {
      const href = linkNode.getAttribute("href");
      const isExternalLink = href && href !== "#" && /^https?:\/\//.test(href);
      if (isExternalLink) {
        linkNode.setAttribute("target", "_blank");
        linkNode.setAttribute("rel", "noopener noreferrer");
      } else {
        linkNode.removeAttribute("target");
        linkNode.removeAttribute("rel");
      }
    });
  }

  function getFocusableNodes(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((node) => {
      if (!(node instanceof HTMLElement)) return false;
      if (node.hasAttribute("disabled")) return false;
      return node.offsetParent !== null;
    });
  }

  function handleProjectPreviewTab(event) {
    if (event.key !== "Tab") return;
    if (!projectPreviewModal || !projectPreviewModal.classList.contains("open")) return;
    const focusableNodes = getFocusableNodes(projectPreviewModal);
    if (!focusableNodes.length) return;

    const firstNode = focusableNodes[0];
    const lastNode = focusableNodes[focusableNodes.length - 1];
    const activeNode = document.activeElement;
    const movingBackward = event.shiftKey;

    if (!movingBackward && activeNode === lastNode) {
      event.preventDefault();
      firstNode.focus();
    }

    if (movingBackward && activeNode === firstNode) {
      event.preventDefault();
      lastNode.focus();
    }
  }

  function openProjectPreview(index, triggerButton) {
    if (!projectPreviewOverlay || !projectPreviewModal) return;
    currentProjectIndex = index;
    lastProjectPreviewTrigger = triggerButton || document.activeElement;
    renderProjectPreview(currentProjectIndex);
    projectPreviewOverlay.hidden = false;
    requestAnimationFrame(() => {
      projectPreviewOverlay.classList.add("open");
      projectPreviewModal.classList.add("open");
      projectPreviewModal.setAttribute("aria-hidden", "false");
      lockBodyScroll();
      const focusableNodes = getFocusableNodes(projectPreviewModal);
      if (focusableNodes.length) focusableNodes[0].focus();
    });
  }

  function closeProjectPreview() {
    if (!projectPreviewOverlay || !projectPreviewModal) return;
    projectPreviewOverlay.classList.remove("open");
    projectPreviewModal.classList.remove("open");
    projectPreviewModal.setAttribute("aria-hidden", "true");
    unlockBodyScroll();
    setTimeout(() => {
      if (!projectPreviewOverlay.classList.contains("open")) {
        projectPreviewOverlay.hidden = true;
      }
    }, 280);
    if (lastProjectPreviewTrigger instanceof HTMLElement) {
      lastProjectPreviewTrigger.focus();
    }
  }

  projectPreviewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".project-card");
      const index = projectCards.indexOf(card);
      if (index >= 0) openProjectPreview(index, button);
    });
  });

  if (projectPreviewClose) projectPreviewClose.addEventListener("click", closeProjectPreview);
  if (projectPreviewOverlay) projectPreviewOverlay.addEventListener("click", closeProjectPreview);

  document.addEventListener("keydown", (event) => {
    if (!projectPreviewModal || !projectPreviewModal.classList.contains("open")) return;
    handleProjectPreviewTab(event);
    if (event.key === "Escape") closeProjectPreview();
  });

  const grid = document.getElementById("heroGrid");
  const squaresGroup = document.getElementById("heroSquares");

  if (grid && squaresGroup) {
    const SQUARE_SIZE = 40;
    const SQUARE_COUNT = 30;
    const MAX_OPACITY = 0.1;
    const DURATION = 3000;
    const SVG_NS = "http://www.w3.org/2000/svg";
    const squares = [];

    function getGridBounds() {
      const rect = grid.getBoundingClientRect();
      return {
        widthCount: Math.max(1, Math.floor(rect.width / SQUARE_SIZE)),
        heightCount: Math.max(1, Math.floor(rect.height / SQUARE_SIZE)),
        width: rect.width,
        height: rect.height,
      };
    }

    function randomPos(bounds) {
      return {
        x: Math.floor(Math.random() * bounds.widthCount),
        y: Math.floor(Math.random() * bounds.heightCount),
      };
    }

    function placeSquare(rect, pos) {
      rect.setAttribute("x", String(pos.x * SQUARE_SIZE + 1));
      rect.setAttribute("y", String(pos.y * SQUARE_SIZE + 1));
      rect.setAttribute("width", String(SQUARE_SIZE - 1));
      rect.setAttribute("height", String(SQUARE_SIZE - 1));
    }

    function animateSquare(entry, delay = 0) {
      const bounds = getGridBounds();
      const pos = randomPos(bounds);
      placeSquare(entry.rect, pos);

      setTimeout(() => {
        entry.rect.animate(
          [
            { opacity: "0" },
            { opacity: String(MAX_OPACITY), offset: 0.5 },
            { opacity: "0" },
          ],
          { duration: DURATION, easing: "ease-in-out" }
        );

        setTimeout(() => animateSquare(entry), DURATION);
      }, delay);
    }

    for (let i = 0; i < SQUARE_COUNT; i += 1) {
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("fill", "currentColor");
      rect.setAttribute("stroke-width", "0");
      rect.setAttribute("opacity", "0");
      squaresGroup.appendChild(rect);
      squares.push({ rect });
    }

    squares.forEach((square, index) => {
      animateSquare(square, index * 100);
    });
  }
})();
