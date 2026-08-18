/* 反馈管理 — 审核 / 上墙 */

(function () {
  const tokenKey = "ielts-feedback-admin-token";

  function showErr(msg) {
    const el = document.getElementById("fb-err");
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function hideErr() {
    document.getElementById("fb-err").classList.add("hidden");
  }

  function stars(r) {
    const n = Math.min(5, Math.max(0, Math.round(Number(r) || 0)));
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  async function apiFetch(path, options = {}) {
    const bases = typeof SiteConfig.allApiBases === "function"
      ? SiteConfig.allApiBases()
      : [((SiteConfig.apiBase || "").replace(/\/$/, "") || "")];
    let lastRes = null;
    for (let i = 0; i < bases.length; i++) {
      const base = bases[i];
      try {
        const res = await fetch(SiteConfig.apiUrl(path, base), options);
        if (res.ok) {
          if (typeof SiteConfig.cacheApiBase === "function") SiteConfig.cacheApiBase(base);
          return res;
        }
        const failover = typeof SiteConfig.shouldFailoverStatus === "function"
          ? SiteConfig.shouldFailoverStatus(res.status)
          : (res.status >= 500);
        if (!failover || i === bases.length - 1) return res;
        lastRes = res;
      } catch (e) {
        if (i === bases.length - 1) throw e;
      }
    }
    if (lastRes) return lastRes;
    throw new Error("request failed");
  }

  async function patch(id, body, token) {
    const res = await apiFetch(`/api/feedback/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${res.status}`);
    }
  }

  const EMPTY_HINTS = {
    pending: "暂无待审核评价。用户通过右上角「馈」提交后会出现在这里。",
    featured: "暂无已上墙评价。在「待审核」里挑选后点「上墙」即可展示。",
    hidden: "暂无已隐藏评价。",
    all: "暂无评价记录。数据库已连接，但还没有用户提交过反馈。"
  };

  function emptyHint(status) {
    if (status === "pending" && typeof t === "function") {
      try { return t("feedback.adminEmptyPending"); } catch { /* ignore */ }
    }
    return EMPTY_HINTS[status] || EMPTY_HINTS.all;
  }

  function renderRows(items, token, status) {
    const tbody = document.querySelector("#fb-table tbody");
    const countEl = document.getElementById("fb-count");
    const bodyEl = document.getElementById("fb-body");
    if (countEl) {
      countEl.textContent = items.length ? `共 ${items.length} 条` : emptyHint(status);
      countEl.classList.remove("hidden");
    }
    if (bodyEl) bodyEl.classList.remove("hidden");
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:1.25rem">${emptyHint(status)}</td></tr>`;
      return;
    }
    tbody.innerHTML = items.map((item) => {
      const date = item.at ? new Date(item.at).toLocaleString() : "—";
      const safeContent = String(item.content || "").replace(/</g, "&lt;");
      const display = item.displayName || item.user || "";
      return `<tr data-id="${item.id}">
        <td>${date}</td>
        <td>${stars(item.rating)}</td>
        <td>${safeContent}</td>
        <td>${(item.user || "—").replace(/</g, "&lt;")}</td>
        <td><input type="text" class="fb-display-name" value="${display.replace(/"/g, "&quot;")}" maxlength="16" placeholder="上墙展示名"></td>
        <td class="fb-actions">
          ${item.status !== "featured"
            ? `<button type="button" class="fb-feature">上墙</button>`
            : `<button type="button" class="fb-unfeature">下架</button>`}
          ${item.status !== "hidden"
            ? `<button type="button" class="fb-hide">隐藏</button>`
            : `<button type="button" class="fb-pending">恢复待审</button>`}
        </td>
      </tr>`;
    }).join("");

    tbody.querySelectorAll(".fb-feature").forEach((btn) => {
      btn.onclick = async () => {
        const row = btn.closest("tr");
        const id = row.dataset.id;
        const displayName = row.querySelector(".fb-display-name").value.trim();
        try {
          await patch(id, { status: "featured", displayName: displayName || undefined }, token);
          load(token);
        } catch (e) {
          showErr(e.message);
        }
      };
    });

    tbody.querySelectorAll(".fb-unfeature").forEach((btn) => {
      btn.onclick = async () => {
        const row = btn.closest("tr");
        try {
          await patch(row.dataset.id, { status: "pending" }, token);
          load(token);
        } catch (e) {
          showErr(e.message);
        }
      };
    });

    tbody.querySelectorAll(".fb-hide").forEach((btn) => {
      btn.onclick = async () => {
        const row = btn.closest("tr");
        try {
          await patch(row.dataset.id, { status: "hidden" }, token);
          load(token);
        } catch (e) {
          showErr(e.message);
        }
      };
    });

    tbody.querySelectorAll(".fb-pending").forEach((btn) => {
      btn.onclick = async () => {
        const row = btn.closest("tr");
        try {
          await patch(row.dataset.id, { status: "pending" }, token);
          load(token);
        } catch (e) {
          showErr(e.message);
        }
      };
    });
  }

  async function load(token) {
    hideErr();
    const status = document.getElementById("fb-filter").value;
    const url = `/api/feedback/admin?status=${encodeURIComponent(status)}&limit=100`;
    const res = await apiFetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error("口令错误，请核对 Vercel 环境变量 ADMIN_STATS_TOKEN");
      throw new Error(data.error || data.message || `加载失败 (${res.status})`);
    }
    const data = await res.json();
    renderRows(data.items || [], token, status);
    document.getElementById("fb-body").classList.remove("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof SiteConfig !== "undefined" && !SiteConfig.apiEnabled?.()) {
      showErr("请先在 js/site-config.js 配置 API（apiMirrors 或 apiBase）");
      return;
    }

    const input = document.getElementById("fb-token");
    const saved = sessionStorage.getItem(tokenKey);
    if (saved) input.value = saved;

    const loadBtn = document.getElementById("fb-load");
    loadBtn.onclick = async () => {
      const token = input.value.trim();
      if (!token) {
        showErr("请输入管理口令");
        return;
      }
      const prevLabel = loadBtn.textContent;
      loadBtn.disabled = true;
      loadBtn.textContent = "加载中…";
      hideErr();
      try {
        sessionStorage.setItem(tokenKey, token);
        await load(token);
      } catch (e) {
        showErr(e.message || "无法连接 API");
        document.getElementById("fb-body").classList.add("hidden");
        const countEl = document.getElementById("fb-count");
        if (countEl) countEl.classList.add("hidden");
      } finally {
        loadBtn.disabled = false;
        loadBtn.textContent = prevLabel;
      }
    };

    document.getElementById("fb-filter").onchange = () => {
      const token = input.value.trim();
      if (token) load(token).catch((e) => showErr(e.message));
    };

    if (saved) loadBtn.click();
  });
})();
