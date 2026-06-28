const API = 'http://localhost:3000';
let state = {
  authenticated: false,
  accounts: [],
  currentAccount: null,
  currentPage: 'dashboard',
  clients: [],
  scheduledPosts: [],
  calendarDate: new Date()
};

// ===== INIT =====
async function init() {
  await checkAuth();
  if (state.authenticated) {
    loadPage('dashboard');
    setupNav();
  }
}

async function checkAuth() {
  try {
    const res = await fetch(`${API}/auth/status`, { credentials: 'include' });
    const data = await res.json();
    state.authenticated = data.authenticated;
    state.accounts = data.accounts || [];
    state.currentAccount = data.currentAccount;

    if (data.authenticated) {
      document.getElementById('auth-screen').style.display = 'none';
      document.getElementById('app-layout').style.display = 'grid';
      updateAccountDisplay();
    }
  } catch {
    showAuthScreen();
  }
}

function showAuthScreen() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app-layout').style.display = 'none';
}

function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) loadPage(page);
    });
  });
}

function updateAccountDisplay() {
  const account = state.accounts.find(a => a.igId === state.currentAccount);
  if (account) {
    document.getElementById('sidebar-account-name').textContent = account.pageName || account.igUsername || 'Account';
    document.getElementById('sidebar-account-handle').textContent = `@${account.igUsername || ''}`;
  }
}

// ===== NAVIGATION =====
function loadPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const section = document.getElementById(`page-${page}`);
  if (section) section.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  switch (page) {
    case 'dashboard': loadDashboard(); break;
    case 'insights': loadInsights(); break;
    case 'media': loadMedia(); break;
    case 'calendar': loadCalendar(); break;
    case 'clients': loadClients(); break;
    case 'reports': loadReports(); break;
  }
}

// ===== DASHBOARD =====
async function loadDashboard() {
  setLoading('dashboard-kpis', true);
  try {
    const [summaryRes, accountRes] = await Promise.all([
      apiFetch('/api/insights/summary'),
      apiFetch('/api/insights/account')
    ]);

    if (summaryRes.ok) {
      const s = await summaryRes.json();
      renderKPIs(s, accountRes.ok ? await accountRes.json() : null);
    }
  } catch (err) {
    showError('dashboard-kpis', 'データを取得できませんでした');
  }

  loadRecentMedia();
  loadDashboardCharts();
}

function renderKPIs(summary, account) {
  const erClass = summary.engagementRate >= 3 ? 'er-good' : summary.engagementRate >= 1 ? 'er-ok' : 'er-low';
  document.getElementById('dashboard-kpis').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-icon">👥</div>
      <div class="kpi-label">フォロワー</div>
      <div class="kpi-value">${formatNum(summary.followers)}</div>
    </div>
    <div class="kpi-card pink">
      <div class="kpi-icon">💗</div>
      <div class="kpi-label">エンゲージメント率</div>
      <div class="kpi-value ${erClass}">${summary.engagementRate}%</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-icon">📱</div>
      <div class="kpi-label">投稿数</div>
      <div class="kpi-value">${formatNum(summary.mediaCount)}</div>
    </div>
    <div class="kpi-card blue">
      <div class="kpi-icon">👍</div>
      <div class="kpi-label">平均エンゲージメント</div>
      <div class="kpi-value">${formatNum(summary.avgEngagement)}</div>
    </div>
  `;
}

async function loadDashboardCharts() {
  try {
    const res = await apiFetch('/api/insights/account-metrics?period=day');
    if (!res.ok) return;
    const data = await res.json();
    renderMetricsChart(data.data || [], 'reach', 'dashboard-reach-chart');
  } catch {}
}

async function loadRecentMedia() {
  try {
    const res = await apiFetch('/api/insights/media?limit=6');
    if (!res.ok) return;
    const data = await res.json();
    renderMediaGrid(data.data || [], 'dashboard-recent-media');
  } catch {}
}

// ===== INSIGHTS =====
async function loadInsights() {
  document.getElementById('insights-period').addEventListener('change', () => loadInsights());
  const period = document.getElementById('insights-period')?.value || 'day';

  setLoading('insights-metrics', true);
  try {
    const res = await apiFetch(`/api/insights/account-metrics?period=${period}`);
    if (res.ok) {
      const data = await res.json();
      renderInsightsMetrics(data.data || []);
    }
  } catch {}

  try {
    const res = await apiFetch('/api/insights/audience');
    if (res.ok) {
      const data = await res.json();
      renderAudienceData(data.data || []);
    }
  } catch {}
}

function renderInsightsMetrics(metrics) {
  const metricsMap = {};
  metrics.forEach(m => { metricsMap[m.name] = m; });

  const reach = metricsMap['reach'];
  const impressions = metricsMap['impressions'];
  const profileViews = metricsMap['profile_views'];
  const websiteClicks = metricsMap['website_clicks'];

  const total = (m) => m?.values?.reduce((s, v) => s + (v.value || 0), 0) || 0;

  document.getElementById('insights-metrics').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-icon">👁</div>
      <div class="kpi-label">リーチ</div>
      <div class="kpi-value">${formatNum(total(reach))}</div>
    </div>
    <div class="kpi-card pink">
      <div class="kpi-icon">📊</div>
      <div class="kpi-label">インプレッション</div>
      <div class="kpi-value">${formatNum(total(impressions))}</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-icon">🏠</div>
      <div class="kpi-label">プロフィール閲覧</div>
      <div class="kpi-value">${formatNum(total(profileViews))}</div>
    </div>
    <div class="kpi-card blue">
      <div class="kpi-icon">🔗</div>
      <div class="kpi-label">Webクリック</div>
      <div class="kpi-value">${formatNum(total(websiteClicks))}</div>
    </div>
  `;

  if (reach?.values) {
    renderLineChart(reach.values, 'reach-line-chart', 'リーチ', '#dfd71c');
  }
  if (impressions?.values) {
    renderLineChart(impressions.values, 'impressions-line-chart', 'インプレッション', '#e1306c');
  }
}

function renderAudienceData(metrics) {
  const genderAge = metrics.find(m => m.name === 'audience_gender_age');
  const country = metrics.find(m => m.name === 'audience_country');

  if (genderAge?.values?.[0]?.value) {
    const data = genderAge.values[0].value;
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);

    document.getElementById('audience-gender-age').innerHTML = sorted.map(([key, val]) => `
      <div class="audience-bar">
        <div class="audience-label">${key}</div>
        <div class="audience-track">
          <div class="audience-fill" style="width:${((val/total)*100).toFixed(1)}%"></div>
        </div>
        <div class="audience-pct">${((val/total)*100).toFixed(1)}%</div>
      </div>
    `).join('');
  }

  if (country?.values?.[0]?.value) {
    const data = country.values[0].value;
    const total = Object.values(data).reduce((s, v) => s + v, 0);
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);

    document.getElementById('audience-country').innerHTML = sorted.map(([key, val]) => `
      <div class="audience-bar">
        <div class="audience-label">${key}</div>
        <div class="audience-track">
          <div class="audience-fill" style="width:${((val/total)*100).toFixed(1)}%;background:#e1306c"></div>
        </div>
        <div class="audience-pct">${((val/total)*100).toFixed(1)}%</div>
      </div>
    `).join('');
  }
}

// ===== MEDIA =====
async function loadMedia() {
  setLoading('media-grid-container', true);
  try {
    const res = await apiFetch('/api/insights/media?limit=24');
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderMediaGrid(data.data || [], 'media-grid-container', true);
  } catch {
    showError('media-grid-container', '投稿データを取得できませんでした');
  }
}

function renderMediaGrid(posts, containerId, showInsights = false) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (posts.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="icon">📸</div><h3>投稿がありません</h3></div>`;
    return;
  }
  el.innerHTML = `<div class="media-grid">${posts.map(post => `
    <div class="media-item" onclick="showPostDetail('${post.id}')">
      <div class="media-thumb">
        ${post.media_url ? `<img src="${post.media_url}" alt="" loading="lazy" onerror="this.style.display='none'">` : '📸'}
      </div>
      <div class="media-info">
        <div class="media-stats">
          <span>❤️ ${formatNum(post.like_count || 0)}</span>
          <span>💬 ${formatNum(post.comments_count || 0)}</span>
          ${showInsights && post.insights?.reach ? `<span>👁 ${formatNum(post.insights.reach)}</span>` : ''}
        </div>
        <div class="media-caption">${post.caption || '（キャプションなし）'}</div>
        <div class="media-caption" style="font-size:11px;margin-top:2px">${formatDate(post.timestamp)}</div>
      </div>
    </div>
  `).join('')}</div>`;
}

function showPostDetail(id) {
  // 投稿詳細モーダル（インサイト詳細）
  openModal('post-detail-modal');
  document.getElementById('post-detail-body').innerHTML = `<div class="loading"><div class="spinner"></div> 読み込み中...</div>`;

  apiFetch(`/api/insights/media?limit=50`).then(r => r.json()).then(data => {
    const post = (data.data || []).find(p => p.id === id);
    if (!post) return;

    const ins = post.insights || {};
    document.getElementById('post-detail-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          ${post.media_url ? `<img src="${post.media_url}" style="width:100%;border-radius:8px" alt="">` : ''}
        </div>
        <div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px">${formatDate(post.timestamp)}</div>
          <div style="font-size:13px;margin-bottom:16px;line-height:1.6">${post.caption || '（キャプションなし）'}</div>
          <div class="report-summary" style="grid-template-columns:1fr 1fr">
            <div class="report-kpi"><div class="report-kpi-value">❤️ ${formatNum(post.like_count||0)}</div><div class="report-kpi-label">いいね</div></div>
            <div class="report-kpi"><div class="report-kpi-value">💬 ${formatNum(post.comments_count||0)}</div><div class="report-kpi-label">コメント</div></div>
            ${ins.reach ? `<div class="report-kpi"><div class="report-kpi-value">👁 ${formatNum(ins.reach)}</div><div class="report-kpi-label">リーチ</div></div>` : ''}
            ${ins.impressions ? `<div class="report-kpi"><div class="report-kpi-value">📊 ${formatNum(ins.impressions)}</div><div class="report-kpi-label">インプレッション</div></div>` : ''}
            ${ins.saved ? `<div class="report-kpi"><div class="report-kpi-value">🔖 ${formatNum(ins.saved)}</div><div class="report-kpi-label">保存数</div></div>` : ''}
            ${ins.engagement ? `<div class="report-kpi"><div class="report-kpi-value">💫 ${formatNum(ins.engagement)}</div><div class="report-kpi-label">エンゲージ</div></div>` : ''}
          </div>
          <a href="${post.permalink}" target="_blank" class="btn btn-secondary btn-sm" style="margin-top:12px">
            Instagramで見る ↗
          </a>
        </div>
      </div>
    `;
  });
}

// ===== CALENDAR =====
async function loadCalendar() {
  try {
    const res = await apiFetch('/api/scheduler');
    if (res.ok) state.scheduledPosts = await res.json();
  } catch {}
  renderCalendar();
}

function renderCalendar() {
  const d = state.calendarDate;
  const year = d.getFullYear(), month = d.getMonth();
  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const dayNames = ['日','月','火','水','木','金','土'];

  document.getElementById('calendar-month-label').textContent = `${year}年 ${monthNames[month]}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  let html = dayNames.map(d => `<div class="cal-header">${d}</div>`).join('');

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num">${new Date(year,month,1-firstDay+i).getDate()}</div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const dayPosts = state.scheduledPosts.filter(p => {
      const pd = new Date(p.scheduledAt);
      return pd.getFullYear() === year && pd.getMonth() === month && pd.getDate() === day;
    });

    html += `
      <div class="cal-day ${isToday ? 'today' : ''}" onclick="openScheduleModal('${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}')">
        <div class="cal-day-num">${day}</div>
        ${dayPosts.map(p => `
          <div class="cal-event ${p.status}" title="${p.caption || ''}">
            ${new Date(p.scheduledAt).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})} ${p.mediaType === 'REELS' ? '🎬' : p.mediaType === 'CAROUSEL' ? '🗂' : '📸'}
          </div>
        `).join('')}
      </div>
    `;
  }

  document.getElementById('calendar-grid').innerHTML = html;
}

function prevMonth() {
  state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1);
  renderCalendar();
}

function nextMonth() {
  state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1);
  renderCalendar();
}

function openScheduleModal(dateStr) {
  openModal('schedule-modal');
  if (dateStr) {
    document.getElementById('schedule-datetime').value = `${dateStr}T09:00`;
  }
}

async function submitSchedulePost() {
  const formData = {
    scheduledAt: document.getElementById('schedule-datetime').value,
    mediaType: document.getElementById('schedule-type').value,
    imageUrl: document.getElementById('schedule-image-url').value,
    caption: document.getElementById('schedule-caption').value
  };

  if (!formData.scheduledAt || !formData.imageUrl) {
    alert('日時と画像URLは必須です');
    return;
  }

  try {
    const res = await apiFetch('/api/scheduler', { method: 'POST', body: JSON.stringify(formData) });
    if (res.ok) {
      closeModal('schedule-modal');
      await loadCalendar();
    }
  } catch {}
}

// ===== CLIENTS =====
async function loadClients() {
  setLoading('clients-table-body', true);
  try {
    const res = await apiFetch('/api/clients');
    if (res.ok) {
      state.clients = await res.json();
      renderClientsTable();
    }
  } catch {}
}

function renderClientsTable() {
  const tbody = document.getElementById('clients-table-body');
  if (state.clients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon">👥</div><h3>クライアントが登録されていません</h3></div></td></tr>`;
    return;
  }
  tbody.innerHTML = state.clients.map(c => `
    <tr>
      <td>
        <div style="font-weight:600">${c.name}</div>
        <div style="font-size:11px;color:var(--muted)">${c.company}</div>
      </td>
      <td>@${c.igUsername}</td>
      <td><span class="badge badge-${c.plan}">${planLabel(c.plan)}</span></td>
      <td>${c.contractEnd ? c.contractEnd : '—'}</td>
      <td><span class="badge badge-${c.status}">${c.status === 'active' ? '稼働中' : '停止'}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="editClient('${c.id}')">編集</button>
          <button class="btn btn-secondary btn-sm" onclick="viewClientReport('${c.id}')">レポート</button>
          <button class="btn btn-danger btn-sm" onclick="deleteClient('${c.id}')">削除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openClientModal(id) {
  const client = id ? state.clients.find(c => c.id === id) : null;
  document.getElementById('client-modal-title').textContent = client ? 'クライアント編集' : '新規クライアント登録';
  document.getElementById('client-id').value = client?.id || '';
  document.getElementById('client-name').value = client?.name || '';
  document.getElementById('client-company').value = client?.company || '';
  document.getElementById('client-ig-username').value = client?.igUsername || '';
  document.getElementById('client-ig-account-id').value = client?.igAccountId || '';
  document.getElementById('client-access-token').value = client?.accessToken || '';
  document.getElementById('client-plan').value = client?.plan || 'basic';
  document.getElementById('client-contract-start').value = client?.contractStart || '';
  document.getElementById('client-contract-end').value = client?.contractEnd || '';
  document.getElementById('client-notes').value = client?.notes || '';
  openModal('client-modal');
}

function editClient(id) { openClientModal(id); }

async function submitClientForm() {
  const id = document.getElementById('client-id').value;
  const data = {
    name: document.getElementById('client-name').value,
    company: document.getElementById('client-company').value,
    igUsername: document.getElementById('client-ig-username').value,
    igAccountId: document.getElementById('client-ig-account-id').value,
    accessToken: document.getElementById('client-access-token').value,
    plan: document.getElementById('client-plan').value,
    contractStart: document.getElementById('client-contract-start').value,
    contractEnd: document.getElementById('client-contract-end').value,
    notes: document.getElementById('client-notes').value
  };

  const url = id ? `/api/clients/${id}` : '/api/clients';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await apiFetch(url, { method, body: JSON.stringify(data) });
    if (res.ok) {
      closeModal('client-modal');
      await loadClients();
    }
  } catch {}
}

async function deleteClient(id) {
  if (!confirm('このクライアントを削除しますか？')) return;
  try {
    const res = await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (res.ok) await loadClients();
  } catch {}
}

function viewClientReport(id) {
  const client = state.clients.find(c => c.id === id);
  if (client) {
    loadPage('reports');
    document.getElementById('report-client-filter').value = id;
    generateReport();
  }
}

// ===== REPORTS =====
async function loadReports() {
  const res = await apiFetch('/api/clients');
  if (res.ok) {
    const clients = await res.json();
    const select = document.getElementById('report-client-filter');
    select.innerHTML = `<option value="">自分のアカウント</option>` +
      clients.map(c => `<option value="${c.id}">${c.name} (@${c.igUsername})</option>`).join('');
  }
  generateReport();
}

async function generateReport() {
  const now = new Date();
  const year = document.getElementById('report-year')?.value || now.getFullYear();
  const month = document.getElementById('report-month')?.value || (now.getMonth() + 1);

  setLoading('report-preview', true);
  try {
    const res = await apiFetch(`/api/reports/monthly?year=${year}&month=${month}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderReportPreview(data);
  } catch {
    showError('report-preview', 'レポートを生成できませんでした');
  }
}

function renderReportPreview(data) {
  const { period, account, summary, topPosts } = data;
  document.getElementById('report-preview').innerHTML = `
    <div style="margin-bottom:20px">
      <div style="font-size:18px;font-weight:700">${period.year}年${period.month}月 月次レポート</div>
      <div style="font-size:13px;color:var(--muted)">@${account.username} · ${account.followers_count?.toLocaleString()}フォロワー</div>
    </div>
    <div class="report-summary">
      <div class="report-kpi">
        <div class="report-kpi-value">${formatNum(summary.reach)}</div>
        <div class="report-kpi-label">リーチ</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${formatNum(summary.impressions)}</div>
        <div class="report-kpi-label">インプレッション</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${formatNum(summary.profileViews)}</div>
        <div class="report-kpi-label">プロフィール閲覧</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${summary.avgEngagementRate}%</div>
        <div class="report-kpi-label">平均ER</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${summary.totalPosts}件</div>
        <div class="report-kpi-label">投稿数</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${formatNum(summary.totalLikes)}</div>
        <div class="report-kpi-label">合計いいね</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${formatNum(summary.totalComments)}</div>
        <div class="report-kpi-label">合計コメント</div>
      </div>
      <div class="report-kpi">
        <div class="report-kpi-value">${formatNum(summary.websiteClicks)}</div>
        <div class="report-kpi-label">Webクリック</div>
      </div>
    </div>
    ${topPosts?.length > 0 ? `
      <div style="font-size:14px;font-weight:600;margin-bottom:12px">トップ投稿</div>
      <div class="media-grid" style="grid-template-columns:repeat(3,1fr)">
        ${topPosts.map(p => `
          <div class="media-item">
            <div class="media-info">
              <div class="media-stats">
                <span>❤️ ${p.like_count||0}</span>
                <span>💬 ${p.comments_count||0}</span>
              </div>
              <div class="media-caption">${formatDate(p.timestamp)}</div>
              <div class="media-caption">${p.caption || ''}</div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function downloadCSV() {
  const year = document.getElementById('report-year')?.value || new Date().getFullYear();
  const month = document.getElementById('report-month')?.value || (new Date().getMonth() + 1);
  window.location.href = `${API}/api/reports/monthly/csv?year=${year}&month=${month}`;
}

// ===== CHARTS (Chart.js) =====
function renderLineChart(values, canvasId, label, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (canvas._chart) canvas._chart.destroy();

  const labels = values.map(v => new Date(v.end_time).toLocaleDateString('ja-JP', { month:'numeric', day:'numeric' }));
  const data = values.map(v => v.value || 0);

  canvas._chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}18`,
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
      }
    }
  });
}

function renderMetricsChart(metrics, metricName, canvasId) {
  const metric = metrics.find(m => m.name === metricName);
  if (!metric?.values) return;
  renderLineChart(metric.values, canvasId, metricName, '#dfd71c');
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ===== UTILS =====
async function apiFetch(path, options = {}) {
  return fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
}

function formatNum(n) {
  if (n >= 10000) return `${(n/10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n/1000).toFixed(1)}k`;
  return String(n || 0);
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ja-JP', { year:'numeric', month:'short', day:'numeric' });
}

function planLabel(plan) {
  const labels = { basic: 'ベーシック', standard: 'スタンダード', premium: 'プレミアム', custom: 'カスタム' };
  return labels[plan] || plan;
}

function setLoading(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  if (show) el.innerHTML = `<div class="loading"><div class="spinner"></div> 読み込み中...</div>`;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="alert alert-error">${msg}</div>`;
}

// ===== LOGOUT =====
async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' });
  showAuthScreen();
}

init();
