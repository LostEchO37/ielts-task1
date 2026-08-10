/* 反馈管理 — 审核 / 上墙 */

(function () {
  const tokenKey = "ielts-feedback-admin-token";

  function apiUrl(path) {
    if (typeof SiteConfig !== "undefined" && SiteConfig.apiUrl) {
      return SiteConfig.apiUrl(path);
    }
    return path.startsWith("/") ? path : `/${path}`;
  }

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

  async function patch(id, body, token) {
    const res = await fetch(apiUrl(`/api/feedback/${encodeURIComponent(id)}`), {
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

  function renderRows(items, token) {
    const tbody = document.querySelector("#fb-table tbody");
    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted)">暂无记录</td></tr>`;
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
    const url = apiUrl(`/api/feedback/admin?status=${encodeURIComponent(status)}&limit=100`);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("口令错误");
      throw new Error(`加载失败 (${res.status})`);
    }
    const data = await res.json();
    renderRows(data.items || [], token);
    document.getElementById("fb-body").classList.remove("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof SiteConfig !== "undefined" && !SiteConfig.apiBase) {
      showErr("请先在 js/site-config.js 配置 apiBase");
      return;
    }

    const input = document.getElementById("fb-token");
    const saved = sessionStorage.getItem(tokenKey);
    if (saved) input.value = saved;

    document.getElementById("fb-load").onclick = async () => {
      const token = input.value.trim();
      if (!token) {
        showErr("请输入管理口令");
        return;
      }
      try {
        sessionStorage.setItem(tokenKey, token);
        await load(token);
      } catch (e) {
        showErr(e.message || "无法连接 API");
        document.getElementById("fb-body").classList.add("hidden");
      }
    };

    document.getElementById("fb-filter").onchange = () => {
      const token = input.value.trim();
      if (token) load(token).catch((e) => showErr(e.message));
    };
  });
})();
