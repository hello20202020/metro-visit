let records = [];
let favorites = [];
let currentRandom = null;
let editingRecordId = null;
let selectedLines = new Set();
let customOrigin = DEFAULT_ORIGIN.station;

async function init() {
  await loadData();
  if (selectedLines.size === 0) {
    METRO_DATA.forEach(line => selectedLines.add(line.id));
  }
  renderLineFilters();
  renderOriginSelector();
  renderStats();
  renderRecords();
  renderFavorites();
  renderAllStations();
  bindEvents();
  registerServiceWorker();
}

async function loadData() {
  try {
    const data = await dbLoadData();
    records = data.records || [];
    favorites = data.favorites || [];
    selectedLines = new Set(data.selectedLines || []);
    customOrigin = data.customOrigin || DEFAULT_ORIGIN.station;
  } catch (e) {
    records = [];
    favorites = [];
    selectedLines = new Set();
    customOrigin = DEFAULT_ORIGIN.station;
  }
}

async function saveData() {
  await dbSaveData({
    records,
    favorites,
    selectedLines: Array.from(selectedLines),
    customOrigin
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('Service Worker 注册失败:', err);
    });
  }
}

function getAllStations() {
  const stations = [];
  METRO_DATA.forEach(line => {
    line.stations.forEach(name => {
      stations.push({ name, lineId: line.id, lineName: line.name, color: line.color, textColor: line.textColor });
    });
  });
  return stations;
}

function getStationInfo(stationName) {
  const lines = [];
  METRO_DATA.forEach(line => {
    if (line.stations.includes(stationName)) {
      lines.push(line);
    }
  });
  return lines;
}

function renderOriginSelector() {
  const select = document.getElementById('originSelect');
  if (!select) return;

  const allStations = getAllStations();
  const uniqueStations = {};
  allStations.forEach(s => {
    if (!uniqueStations[s.name]) {
      uniqueStations[s.name] = { name: s.name, lines: [] };
    }
    uniqueStations[s.name].lines.push(s.lineName);
  });

  const sorted = Object.values(uniqueStations).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  select.innerHTML = sorted.map(s =>
    `<option value="${s.name}" ${s.name === customOrigin ? 'selected' : ''}>${s.name}（${s.lines.join(' / ')}）</option>`
  ).join('');
}

function onOriginChange() {
  const select = document.getElementById('originSelect');
  customOrigin = select.value;
  saveData();
  renderRecords();
  renderFavorites();
  if (currentRandom) {
    const routeInfo = calculateRoute(customOrigin, currentRandom.name);
    if (routeInfo) {
      const infoEl = document.getElementById('routeInfo');
      infoEl.style.display = 'block';
      const pathStr = routeInfo.path.map(p => `${p.lineName}: ${p.stations.join(' → ')}`).join(' → 换乘 → ');
      infoEl.innerHTML = `
        <div class="route-time">⏱️ 约 ${routeInfo.totalTime} 分钟</div>
        <div class="route-detail">
          📍 从 <strong>${customOrigin}</strong> 到 <strong>${currentRandom.name}</strong><br>
          🚉 共 ${routeInfo.totalStations} 站，换乘 ${routeInfo.transfers} 次<br>
          🛤️ 路径：${pathStr}
        </div>
      `;
    }
  }
  showToast('出发站已更新为：' + customOrigin);
}

function renderLineFilters() {
  const container = document.getElementById('lineFilters');
  container.innerHTML = '';
  METRO_DATA.forEach(line => {
    const item = document.createElement('label');
    item.className = 'checkbox-item';
    item.style.background = selectedLines.has(line.id) ? line.color : '#f5f7fa';
    item.style.color = selectedLines.has(line.id) ? line.textColor : '#7f8c8d';
    item.innerHTML = `
      <input type="checkbox" value="${line.id}" ${selectedLines.has(line.id) ? 'checked' : ''}>
      ${line.name}
    `;
    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedLines.add(line.id);
        item.style.background = line.color;
        item.style.color = line.textColor;
      } else {
        selectedLines.delete(line.id);
        item.style.background = '#f5f7fa';
        item.style.color = '#7f8c8d';
      }
      saveData();
      renderStats();
    });
    container.appendChild(item);
  });
}

function getRandomStation() {
  const excludeVisited = document.getElementById('excludeVisited').checked;
  const excludeFavorite = document.getElementById('excludeFavorite').checked;

  const visitedStations = new Set(records.map(r => r.station));
  const favoriteStations = new Set(favorites);

  let pool = [];
  METRO_DATA.forEach(line => {
    if (!selectedLines.has(line.id)) return;
    line.stations.forEach(name => {
      if (excludeVisited && visitedStations.has(name)) return;
      if (excludeFavorite && favoriteStations.has(name)) return;
      pool.push({ name, lineId: line.id, lineName: line.name, color: line.color, textColor: line.textColor });
    });
  });

  if (pool.length === 0) {
    showToast('没有符合条件的站点，请调整筛选条件');
    return null;
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  return picked;
}

function randomPick() {
  const station = getRandomStation();
  if (!station) return;

  currentRandom = station;
  const routeInfo = calculateRoute(customOrigin, station.name);

  const card = document.getElementById('randomCard');
  card.innerHTML = `
    <div style="font-size: 14px; opacity: 0.9;">🎉 本次随机探索</div>
    <div class="station-name">${station.name}</div>
    <span class="line-badge" style="background: ${station.color}; color: ${station.textColor};">
      ${station.lineName}
    </span>
  `;

  document.getElementById('recordBtn').style.display = 'inline-block';
  document.getElementById('favoriteBtn').style.display = 'inline-block';

  const favBtn = document.getElementById('favoriteBtn');
  if (favorites.includes(station.name)) {
    favBtn.textContent = '⭐ 已收藏';
  } else {
    favBtn.textContent = '☆ 收藏';
  }

  if (routeInfo) {
    const infoEl = document.getElementById('routeInfo');
    infoEl.style.display = 'block';
    const pathStr = routeInfo.path.map(p => `${p.lineName}: ${p.stations.join(' → ')}`).join(' → 换乘 → ');
    infoEl.innerHTML = `
      <div class="route-time">⏱️ 约 ${routeInfo.totalTime} 分钟</div>
      <div class="route-detail">
        📍 从 <strong>${customOrigin}</strong> 到 <strong>${station.name}</strong><br>
        🚉 共 ${routeInfo.totalStations} 站，换乘 ${routeInfo.transfers} 次<br>
        🛤️ 路径：${pathStr}
      </div>
    `;
  } else {
    document.getElementById('routeInfo').style.display = 'none';
  }
}

function buildGraph() {
  const graph = {};
  METRO_DATA.forEach(line => {
    const stations = line.stations;
    const duration = line.isExpress ? TIME_CONFIG.expressPerStation
                   : line.id === 'apm' ? TIME_CONFIG.apmPerStation
                   : TIME_CONFIG.normalPerStation;

    for (let i = 0; i < stations.length - 1; i++) {
      const a = stations[i], b = stations[i + 1];
      if (!graph[a]) graph[a] = [];
      if (!graph[b]) graph[b] = [];
      graph[a].push({ station: b, time: duration, lineId: line.id, lineName: line.name, color: line.color });
      graph[b].push({ station: a, time: duration, lineId: line.id, lineName: line.name, color: line.color });
    }

    if (line.isLoop && stations.length > 2) {
      const first = stations[0], last = stations[stations.length - 1];
      if (!graph[first]) graph[first] = [];
      if (!graph[last]) graph[last] = [];
      graph[first].push({ station: last, time: duration, lineId: line.id, lineName: line.name, color: line.color });
      graph[last].push({ station: first, time: duration, lineId: line.id, lineName: line.name, color: line.color });
    }
  });

  const stationLines = {};
  METRO_DATA.forEach(line => {
    line.stations.forEach(s => {
      if (!stationLines[s]) stationLines[s] = new Set();
      stationLines[s].add(line.id);
    });
  });

  Object.keys(stationLines).forEach(station => {
    const lines = Array.from(stationLines[station]);
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        if (!graph[station]) graph[station] = [];
        graph[station].push({
          station: station,
          time: TIME_CONFIG.transferTime,
          lineId: lines[j],
          isTransfer: true,
          fromLineId: lines[i]
        });
      }
    }
  });

  return graph;
}

function calculateRoute(start, end) {
  if (start === end) {
    return { totalTime: 0, transfers: 0, totalStations: 0, path: [{ lineName: '同一站', stations: [start] }] };
  }

  const graph = buildGraph();
  if (!graph[start] || !graph[end]) return null;

  const distances = {};
  const previous = {};
  const visited = new Set();
  const queue = [];

  Object.keys(graph).forEach(s => {
    distances[s] = { time: Infinity, lineId: null };
    previous[s] = null;
  });
  distances[start] = { time: 0, lineId: null };
  queue.push({ station: start, time: 0, lineId: null });

  while (queue.length > 0) {
    queue.sort((a, b) => a.time - b.time);
    const current = queue.shift();

    if (visited.has(current.station)) continue;
    visited.add(current.station);

    if (current.station === end) break;

    if (!graph[current.station]) continue;
    graph[current.station].forEach(edge => {
      if (visited.has(edge.station)) return;

      let addedTime = edge.time;
      if (edge.isTransfer && current.lineId && edge.fromLineId !== current.lineId) {
        addedTime = edge.time;
      } else if (edge.isTransfer) {
        return;
      }

      const newTime = current.time + addedTime;
      if (newTime < distances[edge.station].time) {
        distances[edge.station] = { time: newTime, lineId: edge.lineId };
        previous[edge.station] = {
          station: current.station,
          lineId: edge.lineId,
          lineName: edge.lineName,
          isTransfer: edge.isTransfer
        };
        queue.push({ station: edge.station, time: newTime, lineId: edge.lineId });
      }
    });
  }

  if (distances[end].time === Infinity) return null;

  const path = [];
  let current = end;
  let currentLineId = null;
  let currentLineName = null;
  let segmentStations = [end];

  while (previous[current]) {
    const prev = previous[current];
    if (prev.isTransfer) {
      if (segmentStations.length > 1) {
        path.unshift({ lineId: currentLineId, lineName: currentLineName, stations: [...segmentStations].reverse() });
      }
      segmentStations = [current];
      currentLineId = prev.lineId;
      currentLineName = prev.lineName;
    } else {
      if (currentLineId === null) {
        currentLineId = prev.lineId;
        currentLineName = prev.lineName;
      } else if (prev.lineId !== currentLineId) {
        if (segmentStations.length > 1) {
          path.unshift({ lineId: currentLineId, lineName: currentLineName, stations: [...segmentStations].reverse() });
        }
        segmentStations = [current];
        currentLineId = prev.lineId;
        currentLineName = prev.lineName;
      }
      segmentStations.push(prev.station);
    }
    current = prev.station;
  }

  if (segmentStations.length > 1) {
    path.unshift({ lineId: currentLineId, lineName: currentLineName, stations: [...segmentStations].reverse() });
  }

  const totalStations = path.reduce((sum, seg) => sum + seg.stations.length - 1, 0);
  const transfers = Math.max(0, path.length - 1);

  return {
    totalTime: Math.round(distances[end].time),
    transfers,
    totalStations,
    path
  };
}

function renderStats() {
  const allStations = new Set();
  METRO_DATA.forEach(line => line.stations.forEach(s => allStations.add(s)));
  const visitedStations = new Set(records.map(r => r.station));

  document.getElementById('totalStations').textContent = allStations.size;
  document.getElementById('visitedCount').textContent = visitedStations.size;
  document.getElementById('favoriteCount').textContent = favorites.length;
  document.getElementById('remainingCount').textContent = allStations.size - visitedStations.size;
}

function renderRecords() {
  const list = document.getElementById('recordsList');
  if (records.length === 0) {
    list.innerHTML = '<div class="empty-state">📝 还没有探索记录，开始你的第一次随机探索吧！</div>';
    return;
  }

  const sorted = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(r => {
    const lines = getStationInfo(r.station);
    const lineBadges = lines.map(l =>
      `<span class="record-line" style="background: ${l.color}; color: ${l.textColor};">${l.name}</span>`
    ).join('');
    const routeInfo = calculateRoute(customOrigin, r.station);
    const timeStr = routeInfo ? `约 ${routeInfo.totalTime} 分钟` : '无法计算';
    return `
      <div class="record-card">
        <div class="record-header">
          <div>
            <span class="record-station">${r.station}</span>
            ${lineBadges}
          </div>
          <span class="record-date">${r.date}</span>
        </div>
        ${r.note ? `<div class="record-note">${escapeHtml(r.note)}</div>` : ''}
        <div class="record-meta">⏱️ ${timeStr} · 🚉 ${routeInfo ? routeInfo.totalStations : 0} 站 · 🔄 ${routeInfo ? routeInfo.transfers : 0} 次换乘</div>
        <div class="record-actions">
          <button class="btn btn-sm" onclick="editRecord('${r.id}')">编辑</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecord('${r.id}')">删除</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderFavorites() {
  const list = document.getElementById('favoritesList');
  if (favorites.length === 0) {
    list.innerHTML = '<div class="empty-state">⭐ 还没有收藏站点</div>';
    return;
  }

  list.innerHTML = favorites.map(name => {
    const lines = getStationInfo(name);
    const lineBadges = lines.map(l =>
      `<span class="record-line" style="background: ${l.color}; color: ${l.textColor};">${l.name}</span>`
    ).join('');
    const routeInfo = calculateRoute(customOrigin, name);
    const timeStr = routeInfo ? `约 ${routeInfo.totalTime} 分钟` : '无法计算';
    const visited = records.some(r => r.station === name);
    return `
      <div class="record-card">
        <div class="record-header">
          <div>
            <span class="record-station">${name}</span>
            ${lineBadges}
            ${visited ? '<span class="record-line" style="background: #27ae60; color: #fff;">已探索</span>' : ''}
          </div>
          <span class="favorite-icon active" onclick="toggleFavorite('${name}')">⭐</span>
        </div>
        <div class="record-meta">⏱️ ${timeStr} · 🚉 ${routeInfo ? routeInfo.totalStations : 0} 站 · 🔄 ${routeInfo ? routeInfo.transfers : 0} 次换乘</div>
      </div>
    `;
  }).join('');
}

function renderAllStations() {
  const list = document.getElementById('allStationsList');
  const search = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const allStations = getAllStations();
  const uniqueStations = {};
  allStations.forEach(s => {
    if (!uniqueStations[s.name]) {
      uniqueStations[s.name] = { name: s.name, lines: [] };
    }
    uniqueStations[s.name].lines.push({ id: s.lineId, name: s.lineName, color: s.color, textColor: s.textColor });
  });

  let stations = Object.values(uniqueStations);
  if (search) {
    stations = stations.filter(s => s.name.toLowerCase().includes(search));
  }
  stations.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  if (stations.length === 0) {
    list.innerHTML = '<div class="empty-state">没有找到匹配的站点</div>';
    return;
  }

  list.innerHTML = stations.map(s => {
    const lineBadges = s.lines.map(l =>
      `<span class="record-line" style="background: ${l.color}; color: ${l.textColor};">${l.name}</span>`
    ).join('');
    const visited = records.some(r => r.station === s.name);
    const isFav = favorites.includes(s.name);
    return `
      <div class="record-card">
        <div class="record-header">
          <div>
            <span class="record-station">${s.name}</span>
            ${lineBadges}
            ${visited ? '<span class="record-line" style="background: #27ae60; color: #fff;">已探索</span>' : ''}
          </div>
          <span class="favorite-icon ${isFav ? 'active' : ''}" onclick="toggleFavorite('${s.name}')">${isFav ? '⭐' : '☆'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function toggleFavorite(stationName) {
  const idx = favorites.indexOf(stationName);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    showToast('已取消收藏');
  } else {
    favorites.push(stationName);
    showToast('已收藏');
  }
  saveData();
  renderStats();
  renderFavorites();
  renderAllStations();
  if (currentRandom && currentRandom.name === stationName) {
    const favBtn = document.getElementById('favoriteBtn');
    favBtn.textContent = favorites.includes(stationName) ? '⭐ 已收藏' : '☆ 收藏';
  }
}

function openRecordModal(stationName, lineName, recordId) {
  editingRecordId = recordId || null;
  document.getElementById('recordStation').value = stationName;
  document.getElementById('recordLine').value = lineName;

  if (recordId) {
    const r = records.find(r => r.id === recordId);
    if (r) {
      document.getElementById('recordDate').value = r.date;
      document.getElementById('recordNote').value = r.note || '';
      document.getElementById('modalTitle').textContent = '📝 编辑探索记录';
    }
  } else {
    document.getElementById('recordDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('recordNote').value = '';
    document.getElementById('modalTitle').textContent = '📝 添加探索记录';
  }

  document.getElementById('recordModal').classList.add('active');
}

function closeRecordModal() {
  document.getElementById('recordModal').classList.remove('active');
  editingRecordId = null;
}

function saveRecord() {
  const station = document.getElementById('recordStation').value;
  const date = document.getElementById('recordDate').value;
  const note = document.getElementById('recordNote').value.trim();

  if (!date) {
    showToast('请选择日期');
    return;
  }

  if (editingRecordId) {
    const r = records.find(r => r.id === editingRecordId);
    if (r) {
      r.date = date;
      r.note = note;
    }
    showToast('记录已更新');
  } else {
    records.push({
      id: 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      station,
      date,
      note
    });
    showToast('记录已添加');
  }

  saveData();
  renderStats();
  renderRecords();
  renderAllStations();
  closeRecordModal();
}

function editRecord(id) {
  const r = records.find(r => r.id === id);
  if (r) {
    const lines = getStationInfo(r.station);
    const lineName = lines.map(l => l.name).join(', ');
    openRecordModal(r.station, lineName, id);
  }
}

function deleteRecord(id) {
  if (!confirm('确定删除这条记录吗？')) return;
  records = records.filter(r => r.id !== id);
  saveData();
  renderStats();
  renderRecords();
  renderAllStations();
  showToast('记录已删除');
}

function exportCSV() {
  if (records.length === 0) {
    showToast('暂无记录可导出');
    return;
  }

  const headers = ['日期', '站点', '所属线路', '预估时间(分钟)', '途经站数', '换乘次数', '笔记'];
  const rows = records.map(r => {
    const lines = getStationInfo(r.station);
    const lineName = lines.map(l => l.name).join(' / ');
    const routeInfo = calculateRoute(customOrigin, r.station);
    return [
      r.date,
      r.station,
      lineName,
      routeInfo ? routeInfo.totalTime : '',
      routeInfo ? routeInfo.totalStations : '',
      routeInfo ? routeInfo.transfers : '',
      (r.note || '').replace(/[\r\n]/g, ' ').replace(/"/g, '""')
    ];
  });

  const csv = [headers, ...rows].map(row =>
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `广州地铁探索记录_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('已导出 CSV 文件');
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell);
        cell = '';
      } else if (ch === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else if (ch === '\r') {
        // skip
      } else {
        cell += ch;
      }
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function importCSV(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let text = e.target.result;
      // 去掉 BOM
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

      const rows = parseCSV(text);
      if (rows.length < 2) {
        showToast('CSV 文件没有数据');
        return;
      }

      const headers = rows[0];
      const dateIdx = headers.indexOf('日期');
      const stationIdx = headers.indexOf('站点');
      const noteIdx = headers.indexOf('笔记');

      if (stationIdx === -1 || dateIdx === -1) {
        showToast('CSV 格式不正确，需要"日期"和"站点"列');
        return;
      }

      let imported = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[stationIdx]) continue;

        const station = row[stationIdx].trim();
        const date = row[dateIdx] ? row[dateIdx].trim() : new Date().toISOString().slice(0, 10);
        const note = noteIdx !== -1 && row[noteIdx] ? row[noteIdx].trim() : '';

        // 检查站点是否存在于地铁数据中
        const lines = getStationInfo(station);
        if (lines.length === 0) {
          console.warn(`跳过未知站点: ${station}`);
          continue;
        }

        records.push({
          id: 'r_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          station,
          date,
          note
        });
        imported++;
      }

      if (imported === 0) {
        showToast('未导入任何记录，请检查 CSV 格式');
        return;
      }

      saveData();
      renderStats();
      renderRecords();
      renderAllStations();
      showToast(`成功导入 ${imported} 条记录`);
    } catch (err) {
      console.error(err);
      showToast('导入失败: ' + err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
  if (tabName === 'all') renderAllStations();
}

function bindEvents() {
  document.getElementById('randomBtn').addEventListener('click', randomPick);
  document.getElementById('originSelect').addEventListener('change', onOriginChange);
  document.getElementById('recordBtn').addEventListener('click', () => {
    if (currentRandom) {
      openRecordModal(currentRandom.name, currentRandom.lineName);
    }
  });
  document.getElementById('favoriteBtn').addEventListener('click', () => {
    if (currentRandom) toggleFavorite(currentRandom.name);
  });
  document.getElementById('cancelRecord').addEventListener('click', closeRecordModal);
  document.getElementById('saveRecord').addEventListener('click', saveRecord);
  document.getElementById('recordModal').addEventListener('click', (e) => {
    if (e.target.id === 'recordModal') closeRecordModal();
  });
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importCSV(e.target.files[0]);
      e.target.value = '';
    }
  });
  document.getElementById('selectAllLines').addEventListener('click', () => {
    METRO_DATA.forEach(line => selectedLines.add(line.id));
    saveData();
    renderLineFilters();
    renderStats();
  });
  document.getElementById('clearLines').addEventListener('click', () => {
    selectedLines.clear();
    saveData();
    renderLineFilters();
    renderStats();
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderAllStations);
  }
  document.getElementById('excludeVisited').addEventListener('change', renderStats);
  document.getElementById('excludeFavorite').addEventListener('change', renderStats);
}

window.toggleFavorite = toggleFavorite;
window.editRecord = editRecord;
window.deleteRecord = deleteRecord;

init();