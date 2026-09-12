(function(){
  "use strict";

  /* ===== 視圖切換（淡入淡出） ===== */
  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  function go(id){
    views.forEach(function(v){
      var on = (v.id === id);
      v.classList.toggle('active', on);
      if(on){
        v.querySelectorAll('.card').forEach(function(c){
          c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
        });
      }
    });
    window.scrollTo(0,0);
  }

  /* ===== Toast ===== */
  var toastEl = document.getElementById('toast'), toastTimer = null;
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 1800);
  }

  /* ===== 模擬狀態欄時間 ===== */
  function tick(){
    var n = new Date();
    var hh = ('0'+n.getHours()).slice(-2), mm = ('0'+n.getMinutes()).slice(-2);
    document.getElementById('sb-time').textContent = hh + ':' + mm;
  }
  tick(); setInterval(tick, 30000);

  /* ===== 首頁：願意 → 確認頁 ===== */
  document.getElementById('btn-yes').addEventListener('click', function () {
    go('view-confirm');
  });

  /* ===== 首頁：不要按鈕隨機逃跑 ===== */
  var noBtn = document.getElementById('btn-no');
  var stage = document.getElementById('stage');
  var dodgeCount = 0, escaped = false;
  var tips = ['嘿嘿 點不到我~','你抓不到我啦~','別點嘛 人家害羞~','再見啦 我先跑了~','略略略~','我飛走啦~'];
  function moveNoBtn(){
    if(!escaped){
      escaped = true;
      noBtn.classList.add('escaped');
      var sr = stage.getBoundingClientRect(), br = noBtn.getBoundingClientRect();
      noBtn.style.left = (br.left - sr.left) + 'px';
      noBtn.style.top  = (br.top  - sr.top)  + 'px';
    }
    var sr = stage.getBoundingClientRect();
    var pad = 16;
    var curX = parseFloat(noBtn.style.left), curY = parseFloat(noBtn.style.top);
    var w = noBtn.offsetWidth, h = noBtn.offsetHeight;
    var minX = pad, maxX = Math.max(pad, sr.width  - w - pad * 2);
    var minY = pad, maxY = Math.max(pad, sr.height - h - pad * 2);
    var nx = curX, ny = curY, tries = 0;
    do {
      // 只跳到旁邊約兩格（2 倍按鈕寬／高）的距離內，不跑太遠
      nx = Math.min(maxX, Math.max(minX, curX + (Math.random() * 4 - 2) * w));
      ny = Math.min(maxY, Math.max(minY, curY + (Math.random() * 4 - 2) * h));
      tries++;
    } while(Math.abs(nx - curX) + Math.abs(ny - curY) < 40 && tries < 8);
    noBtn.style.left = nx + 'px';
    noBtn.style.top  = ny + 'px';
    noBtn.classList.remove('wobble'); void noBtn.offsetWidth; noBtn.classList.add('wobble');
    dodgeCount++;
    if(dodgeCount % 2 === 0){
      toast(tips[Math.floor(Math.random() * tips.length)]);
    }
  }
  var lastEscape = 0;
  function escapeNo(e){
    e.preventDefault();
    if(Date.now() - lastEscape < 300) return;
    lastEscape = Date.now();
    moveNoBtn();
  }
  noBtn.addEventListener('touchstart', escapeNo, { passive: false });
  noBtn.addEventListener('pointerdown', escapeNo);
  noBtn.addEventListener('click', escapeNo);

  if (window.matchMedia('(pointer:fine)').matches) {
    noBtn.addEventListener('mouseenter', moveNoBtn);
  }

  /* ===== 確認頁 ===== */
  document.getElementById('btn-ok-confirm').addEventListener('click', function () {
    go('view-time');
  });
  document.getElementById('back-time').addEventListener('click', function () {
    go('view-confirm');
  });
  document.getElementById('back-mode').addEventListener('click', function () {
    go('view-time');
  });

  /* ===== 時間頁：日期（未來 14 天） ===== */
  var wd = ['日','一','二','三','四','五','六'];
  var dateRow = document.getElementById('date-row');
  var pickedDate = null, pickedTime = null;
  var base = new Date();
  var dateOpts = [];
  for(var i = 0; i < 14; i++){
    var dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    var top = (i === 0) ? '今天' : (i === 1 ? '明天' : '週' + wd[dt.getDay()]);
    var sub = (dt.getMonth() + 1) + '/' + dt.getDate();
    dateOpts.push({ top: top, sub: sub, full: (dt.getMonth() + 1) + '月' + dt.getDate() + '日 週' + wd[dt.getDay()] });
  }
  dateOpts.forEach(function(o, idx){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'date-chip';
    b.innerHTML = '<span class="dc-top">' + o.top + '</span><span class="dc-sub">' + o.sub + '</span>';
    b.addEventListener('click', function(){
      dateRow.querySelectorAll('.date-chip').forEach(function(c){ c.classList.remove('on'); });
      b.classList.add('on');
      pickedDate = o;
    });
    dateRow.appendChild(b);
  });

  /* ===== 時間頁：00:00 - 24:00 ===== */
  var timeGrid = document.getElementById('time-grid');
  var times = [];
  for(var h = 12; h <= 20; h++){
    for(var m = 0; m < 60; m += 30){
      if(h === 24 && m === 30) continue;
      times.push(('0'+h).slice(-2) + ':' + ('0'+m).slice(-2));
    }
  }
  times.forEach(function(t){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'time-chip'; b.textContent = t;
    b.addEventListener('click', function(){
      timeGrid.querySelectorAll('.time-chip').forEach(function(c){ c.classList.remove('on'); });
      b.classList.add('on');
      pickedTime = t;
    });
    timeGrid.appendChild(b);
  });

  /* ===== 時間頁：確定時間 ===== */
  document.getElementById('btn-time-ok').addEventListener('click', function () {
    if (!pickedDate) {
      toast('先選個日期嘛~');
      return;
    }
    if (!pickedTime) {
      toast('再選個時間嘛~');
      return;
    }
    go('view-mode');
  });

  /* ===== 模式頁：多選 ===== */
  var modes = ['匹配','聯合','摸金','自訂','模仿','捉迷藏','塔羅','其他'];
  var modeGrid = document.getElementById('mode-grid');
  var pickedModes = [];
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 7"/></svg>';
  modes.forEach(function(m){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'mode-chip';
    b.innerHTML = '<span class="check">' + checkSvg + '</span>' + m;
    b.addEventListener('click', function(){
      var on = b.classList.toggle('on');
      var idx = pickedModes.indexOf(m);
      if(on && idx === -1){ pickedModes.push(m); }
      if(!on && idx > -1){ pickedModes.splice(idx, 1); }
    });
    modeGrid.appendChild(b);
  });

  /* ===== 模式頁：就選這些！ ===== */
  document.getElementById('btn-mode-ok').addEventListener('click', function () {
    if (pickedModes.length === 0) {
      toast('至少要選一個模式嘛~');
      return;
    }

    document.getElementById('r-date').textContent = pickedDate.full;
    document.getElementById('r-time').textContent = pickedTime;
    document.getElementById('r-modes').textContent = pickedModes.join('、');
    go('view-result');
  });

  /* ===== 結果頁：轉發式回覆（零設定） ===== */
  var INVITER_EMAIL = 'a.i.channel.ouo@gmail.com';
  function replyText(){
    return '想跟你一起打第五！我選好了～\n'
      + '日期：' + (pickedDate ? pickedDate.full : '') + '\n'
      + '時間：' + (pickedTime || '') + '\n'
      + '模式：' + (pickedModes.join('、') || '');
  }
  function fallbackCopy(t, done){
    var ta = document.createElement('textarea');
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch(e){ toast('複製失敗，長按手動複製吧'); }
    document.body.removeChild(ta);
  }
  document.getElementById('btn-reply').addEventListener('click', function(){
    var text = replyText();
    if(navigator.share){
      navigator.share({ title: '約你打第五', text: text }).catch(function(){});
    } else {
      window.location.href = 'mailto:' + INVITER_EMAIL
        + '?subject=' + encodeURIComponent('想跟你一起打第五！')
        + '?body=' + encodeURIComponent(text);
    }
  });

  /* ===== 結果頁：複製結果圖片（canvas 產生 + 剪貼簿） ===== */
  function drawHeart(c, cx, cy, s, color){
    c.save(); c.translate(cx, cy); c.scale(s / 100, s / 100); c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, 35);
    c.bezierCurveTo(-55, -15, -25, -65, 0, -25);
    c.bezierCurveTo(25, -65, 55, -15, 0, 35);
    c.closePath(); c.fill(); c.restore();
  }
  function drawStar(c, cx, cy, r, color){
    c.save(); c.translate(cx, cy); c.fillStyle = color;
    c.beginPath();
    for(var i = 0; i < 5; i++){
      var a1 = -Math.PI / 2 + i * 2 * Math.PI / 5;
      var a2 = a1 + Math.PI / 5;
      var px = Math.cos(a1) * r, py = Math.sin(a1) * r;
      var qx = Math.cos(a2) * r * 0.45, qy = Math.sin(a2) * r * 0.45;
      if(i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      c.lineTo(qx, qy);
    }
    c.closePath(); c.fill(); c.restore();
  }
  function roundRect(c, px, py, w, h, r){
    c.beginPath();
    c.moveTo(px + r, py);
    c.arcTo(px + w, py, px + w, py + h, r);
    c.arcTo(px + w, py + h, px, py + h, r);
    c.arcTo(px, py + h, px, py, r);
    c.arcTo(px, py, px + w, py, r);
    c.closePath();
  }
  function buildResultImage(cb){
    var img = document.querySelector('.result-avatar img');
    function draw(){
      var cv = document.createElement('canvas');
      cv.width = 1080; cv.height = 1350;
      var c = cv.getContext('2d');
      var g = c.createLinearGradient(0, 0, 1080, 1350);
      g.addColorStop(0, '#FFE0EF'); g.addColorStop(0.5, '#F6E0FF'); g.addColorStop(1, '#E1CDFF');
      c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
      drawHeart(c, 130, 270, 55, 'rgba(255,127,168,.45)');
      drawStar(c, 950, 190, 44, 'rgba(201,168,255,.55)');
      drawHeart(c, 950, 640, 42, 'rgba(255,127,168,.4)');
      drawStar(c, 140, 950, 40, 'rgba(201,168,255,.5)');
      drawHeart(c, 165, 1180, 48, 'rgba(255,127,168,.4)');
      drawStar(c, 930, 1140, 44, 'rgba(201,168,255,.5)');
      c.save();
      c.beginPath(); c.arc(540, 320, 158, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,179,206,.55)'; c.fill();
      c.restore();
      c.save();
      c.beginPath(); c.arc(540, 320, 136, 0, Math.PI * 2); c.clip();
      c.drawImage(img, 540 - 136, 320 - 136, 272, 272);
      c.restore();
      c.strokeStyle = '#fff'; c.lineWidth = 10;
      c.beginPath(); c.arc(540, 320, 136, 0, Math.PI * 2); c.stroke();
      c.textAlign = 'center';
      c.fillStyle = '#7A4F8E';
      c.font = 'bold 54px "ZCOOL KuaiLe","Noto Sans SC",sans-serif';
      c.fillText('真開心你沒有拒絕——', 540, 590);
      c.fillText('我會準時來接你！', 540, 664);
      roundRect(c, 84, 748, 912, 396, 50);
      c.fillStyle = '#fff'; c.fill();
      var rows = [
        ['日期', pickedDate ? pickedDate.full : ''],
        ['時間', pickedTime || ''],
        ['模式', pickedModes.join('、') || '']
      ];
      rows.forEach(function(rw, i){
        var y = 748 + 132 + i * 132;
        c.fillStyle = '#B58AC9';
        c.textAlign = 'left';
        c.font = '44px "ZCOOL KuaiLe","Noto Sans SC",sans-serif';
        c.fillText(rw[0], 160, y);
        c.fillStyle = '#7A4F8E';
        c.textAlign = 'right';
        c.font = 'bold 46px "ZCOOL KuaiLe","Noto Sans SC",sans-serif';
        c.fillText(rw[1], 920, y);
        if(i < 2){
          c.strokeStyle = '#F3D6E8'; c.lineWidth = 4;
          c.setLineDash([14, 14]);
          c.beginPath(); c.moveTo(160, y + 48); c.lineTo(920, y + 48); c.stroke();
          c.setLineDash([]);
        }
      });
      c.textAlign = 'center';
      c.fillStyle = '#B57BD4';
      c.font = '42px "ZCOOL KuaiLe","Noto Sans SC",sans-serif';
      c.fillText('我等你上線就好', 540, 1258);
      drawHeart(c, 400, 1258, 26, 'rgba(255,127,168,.8)');
      drawHeart(c, 680, 1258, 26, 'rgba(255,127,168,.8)');
      cv.toBlob(cb, 'image/png');
    }
    if(img && img.complete){ draw(); } else { img.onload = draw; }
  }
  function saveImageBlob(blob){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '約你打第五-選擇.png';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 500);
    toast('已儲存圖片，發給 TA 就好啦~');
  }
  document.getElementById('btn-copy').addEventListener('click', function () {
    buildResultImage(function (blob) {
      if (!blob) {
        toast('生成圖片失敗，請重試');
        return;
      }

      if (navigator.clipboard && window.ClipboardItem && navigator.clipboard.write) {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
          .then(function () {
            toast('圖片已複製！貼給 TA 就好啦~');
          })
          .catch(function () {
            saveImageBlob(blob);
          });
      } else {
        saveImageBlob(blob);
      }
    });
  });

})();
