// すのまま器店 - 共通JS
// ハンバーガーメニュー(右上の ☰)を担当します。
// ※ 新着商品ページは廃止しました(商品はBASEで一本化)。下のカテゴリー一覧と絞り込みの処理は、
//   BASEにカテゴリを作ったときに使えるよう残してあります(今は SHOW_CATEGORIES = false で非表示)。

// ============================================
// 商品カテゴリーの一覧
// ここを書き換えると、全ページのメニューに反映されます。
//   id   : 半角英小文字(商品カードの data-category と同じにする)
//   name : メニューに表示する名前
// ============================================
var SHOW_CATEGORIES = false; // BASEにカテゴリを作ったら true にして、リンク先を直す
var YOHEN_CATEGORIES = [
  { id: "plate", name: "お皿" },
  { id: "bowl",  name: "お椀・鉢" },
  { id: "cup",   name: "カップ・湯のみ" },
  { id: "vase",  name: "花器" }
];

(function () {
  // このJSファイルの場所から、サイトのトップの場所を求める(artists/ 内のページでもリンクが正しくなるように)
  var script = document.currentScript || document.querySelector('script[src$="js/main.js"]');
  var base = script ? script.src.replace(/js\/main\.js(\?.*)?$/, "") : "";
  var productsUrl = base + "products.html";
  var currentCategory = new URLSearchParams(location.search).get("category") || "";
  var onProductsPage = /\/products\.html$/.test(location.pathname);

  // ---------- メニュー(引き出し)を組み立てる ----------
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    var drawer = document.createElement("div");
    drawer.className = "site-drawer";
    drawer.id = "site-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "メニュー");
    drawer.setAttribute("aria-hidden", "true");

    var html = '<button class="drawer-close" type="button" aria-label="メニューを閉じる">&times;</button>';
    if (SHOW_CATEGORIES) {
      html += '<p class="drawer-heading">商品カテゴリー</p><ul class="drawer-list">';
      html += '<li><a href="' + productsUrl + '"' + (onProductsPage && !currentCategory ? ' class="is-current"' : '') + '>すべての器</a></li>';
      YOHEN_CATEGORIES.forEach(function (c) {
        var cur = onProductsPage && currentCategory === c.id ? ' class="is-current"' : '';
        html += '<li><a href="' + productsUrl + '?category=' + c.id + '"' + cur + '>' + c.name + '</a></li>';
      });
      html += '</ul>';
    }

    // ヘッダーのメニュー(ホーム・読みものなど)も、引き出しの下のほうに並べる(スマホ用)
    var navLinks = document.querySelectorAll(".site-nav a");
    if (navLinks.length) {
      html += '<p class="drawer-heading">メニュー</p><ul class="drawer-list is-sub">';
      navLinks.forEach(function (a) {
        var target = a.getAttribute("target") ? ' target="_blank" rel="noopener"' : '';
        html += '<li><a href="' + a.href + '"' + target + '>' + a.textContent + '</a></li>';
      });
      html += '</ul>';
    }
    drawer.innerHTML = html;

    var overlay = document.createElement("div");
    overlay.className = "drawer-overlay";

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    toggle.setAttribute("aria-controls", "site-drawer");

    var openMenu = function () {
      document.body.classList.add("is-menu-open");
      toggle.setAttribute("aria-expanded", "true");
      drawer.setAttribute("aria-hidden", "false");
      drawer.querySelector(".drawer-close").focus();
    };
    var closeMenu = function () {
      document.body.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
      toggle.focus();
    };
    toggle.addEventListener("click", openMenu);
    overlay.addEventListener("click", closeMenu);
    drawer.querySelector(".drawer-close").addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("is-menu-open")) closeMenu();
    });
  }

  // ---------- 新着商品ページ: カテゴリーで絞り込む ----------
  var grid = document.querySelector(".feed-grid[data-filterable]");
  if (grid && currentCategory) {
    var category = null;
    YOHEN_CATEGORIES.forEach(function (c) { if (c.id === currentCategory) category = c; });
    if (category) {
      var shown = 0;
      grid.querySelectorAll(".feed-card").forEach(function (card) {
        var cats = (card.getAttribute("data-category") || "").split(/\s+/);
        var match = cats.indexOf(category.id) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });

      var bar = document.createElement("div");
      bar.className = "filter-bar";
      bar.innerHTML = '<p class="filter-bar-label">カテゴリー:<strong>' + category.name + '</strong>' +
        '<span class="filter-bar-count">' + shown + '点</span></p>' +
        '<a class="filter-bar-reset" href="' + productsUrl + '">すべての器を見る</a>';
      grid.parentNode.insertBefore(bar, grid);

      if (shown === 0) {
        var empty = document.createElement("p");
        empty.className = "filter-empty";
        empty.textContent = "「" + category.name + "」の器は、ただいま準備中です。入荷まで、もうしばらくお待ちください。";
        grid.parentNode.insertBefore(empty, grid.nextSibling);
      }
      document.title = category.name + " | " + document.title;
    }
  }

  // ---------- お問い合わせフォーム: 入力チェックと送信 ----------
  // 送信は、ページを移動せずに Google フォームへ届けます(Google の画面は表示しません)。
  // 届けたら、このサイト内の thanks.html(サンクスページ)を表示します。
  var contactForm = document.querySelector("form[data-contact-form]");
  if (contactForm) {
    var statusEl = contactForm.querySelector(".form-status");
    var submitBtn = contactForm.querySelector('button[type="submit"]');
    var setStatus = function (text, type) {
      statusEl.textContent = text;
      statusEl.className = "form-status" + (type ? " is-" + type : "");
    };

    contactForm.addEventListener("submit", function (e) {
      var firstInvalid = null;
      contactForm.querySelectorAll("input[required], textarea[required]").forEach(function (field) {
        var ok = field.value.trim() !== "" && (field.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()));
        field.classList.toggle("is-invalid", !ok);
        field.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        e.preventDefault();
        setStatus("未入力の項目、またはメールアドレスの形式をご確認ください。", "error");
        firstInvalid.focus();
        return;
      }

      // パソコンの中のファイルを直接開いているときは、送信できないのでお知らせする
      if (location.protocol === "file:") {
        e.preventDefault();
        setStatus("(確認用のお知らせ)パソコン内のファイルを直接開いているため、送信できません。公開後のサイトでお試しください。", "error");
        return;
      }

      e.preventDefault();

      // 迷惑メール対策: 人には見えない欄に何か入っていたら、ロボットとみなして送らない
      var honey = contactForm.querySelector(".form-honeypot");
      if (honey && honey.value) {
        location.href = base + "thanks.html";
        return;
      }

      submitBtn.disabled = true;
      setStatus("送信しています…", "");

      // Google フォームは送信結果を教えてくれないしくみ(no-cors)のため、
      // 通信そのものが失敗したときだけエラーを表示し、それ以外はサンクスページへ進みます。
      fetch(contactForm.getAttribute("action"), {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(new FormData(contactForm))
      })
        .then(function () {
          location.href = base + "thanks.html";
        })
        .catch(function () {
          submitBtn.disabled = false;
          setStatus("送信できませんでした。通信状況をご確認のうえ、時間をおいて再度お試しください。", "error");
        });
    });

    // 入力し直したら、赤い枠を消す
    contactForm.addEventListener("input", function (e) {
      if (e.target.classList.contains("is-invalid")) {
        e.target.classList.remove("is-invalid");
        e.target.removeAttribute("aria-invalid");
      }
    });

    // 「戻る」でページに戻ったとき、ボタンを押せる状態に戻す
    window.addEventListener("pageshow", function () {
      submitBtn.disabled = false;
      setStatus("", "");
    });
  }
})();
