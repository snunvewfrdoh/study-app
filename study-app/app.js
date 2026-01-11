// ------------------------------
// 章一覧を JSON から読み込んで生成
// ------------------------------
async function loadChapterList() {
  const res = await fetch("data/chapters.json");
  const data = await res.json();

  const select = document.getElementById("chapterSelect");
  select.innerHTML = ""; // 初期化

  data.chapters.forEach(ch => {
    const option = document.createElement("option");
    option.value = ch.file;
    option.textContent = ch.title;
    select.appendChild(option);
  });
}

// 初期化
loadChapterList();


// ------------------------------
// Markdown 読み込み
// ------------------------------
document.getElementById("loadBtn").addEventListener("click", async () => {
  const chapter = document.getElementById("chapterSelect").value;

  const res = await fetch(`texts/${chapter}`);
  const md = await res.text();

  document.getElementById("content").innerHTML = marked.parse(md);

  loadMemo(chapter);
});


// ------------------------------
// メモ保存
// ------------------------------
document.getElementById("saveMemoBtn").addEventListener("click", () => {
  const chapter = document.getElementById("chapterSelect").value;
  const memo = document.getElementById("memo").value;

  localStorage.setItem(`memo_${chapter}`, memo);
  alert("メモを保存しました");
});


// ------------------------------
// メモ読み込み
// ------------------------------
function loadMemo(chapter) {
  const memo = localStorage.getItem(`memo_${chapter}`) || "";
  document.getElementById("memo").value = memo;
}


// ======================================================
// 4択問題機能（章ごと出題 + 複数問題 + 進捗 + 正答率）
// ======================================================

// 複数問題用の変数
let currentQuestions = [];
let currentIndex = 0;
let correctCount = 0;


// ------------------------------
// 章を選んだら問題数を表示
// ------------------------------
document.getElementById("chapterSelect").addEventListener("change", async () => {
  const chapter = document.getElementById("chapterSelect").value;
  const chapterId = parseInt(chapter.replace("chapter", "").replace(".md", ""));

  const res = await fetch("data/questions.json");
  const data = await res.json();

  const filtered = data.questions.filter(q => q.chapterId === chapterId);

  document.getElementById("questionCount").textContent =
    `この章の問題数：${filtered.length}問`;
});


// ------------------------------
// 章ごとに問題を読み込む
// ------------------------------
document.getElementById("loadQuestionByChapterBtn").addEventListener("click", async () => {
  const chapter = document.getElementById("chapterSelect").value;
  const chapterId = parseInt(chapter.replace("chapter", "").replace(".md", ""));

  const res = await fetch("data/questions.json");
  const data = await res.json();

  // 章に一致する問題だけ抽出
  currentQuestions = data.questions.filter(q => q.chapterId === chapterId);
  currentIndex = 0;
  correctCount = 0;

  document.getElementById("questionCount").textContent =
    `この章の問題数：${currentQuestions.length}問`;

  if (currentQuestions.length === 0) {
    document.getElementById("questionArea").textContent = "この章の問題はありません。";
    document.getElementById("choicesArea").innerHTML = "";
    document.getElementById("nextQuestionBtn").style.display = "none";
    document.getElementById("progress").textContent = "";
    return;
  }

  // 最初の問題を表示
  showQuestion(currentQuestions[currentIndex]);
});


// ------------------------------
// 問題表示（共通）
// ------------------------------
function showQuestion(q) {
  document.getElementById("questionArea").textContent = q.question;

  const choicesArea = document.getElementById("choicesArea");
  choicesArea.innerHTML = "";

  const labels = ["A", "B", "C", "D"];

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";

    btn.innerHTML = `
    <span class="choice-label">${labels[index]}</span>
    <span class="choice-text">${choice}</span>
  `;

    btn.addEventListener("click", () => {
      checkAnswer(index, q);
    });

    choicesArea.appendChild(btn);
  });

  document.getElementById("resultArea").textContent = "";
  document.getElementById("explanationArea").textContent = "";

  document.getElementById("nextQuestionBtn").style.display = "none";

  updateProgress();
}


// ------------------------------
// 正解判定
// ------------------------------
function checkAnswer(selected, q) {
  const resultArea = document.getElementById("resultArea");
  const explanationArea = document.getElementById("explanationArea");

  if (selected === q.answer) {
    resultArea.textContent = "正解！";
    resultArea.style.color = "green";
    correctCount++;
  } else {
    resultArea.textContent = "不正解…";
    resultArea.style.color = "red";
  }

  explanationArea.textContent = "解説: " + q.explanation;

  document.getElementById("nextQuestionBtn").style.display = "block";
}


// ------------------------------
// 次の問題へ
// ------------------------------
document.getElementById("nextQuestionBtn").addEventListener("click", () => {
  currentIndex++;

  if (currentIndex >= currentQuestions.length) {
    document.getElementById("questionArea").textContent =
      `これでこの章の問題は終了です。`;

    document.getElementById("choicesArea").innerHTML = "";

    document.getElementById("resultArea").textContent =
      `正答率：${correctCount} / ${currentQuestions.length} 問`;

    document.getElementById("explanationArea").textContent = "";
    document.getElementById("nextQuestionBtn").style.display = "none";
    document.getElementById("progress").textContent = "";
    return;
  }

  showQuestion(currentQuestions[currentIndex]);
});


// ------------------------------
// 進捗表示
// ------------------------------
function updateProgress() {
  if (currentQuestions.length === 0) {
    document.getElementById("progress").textContent = "";
    return;
  }

  document.getElementById("progress").textContent =
    `進捗：${currentIndex + 1} / ${currentQuestions.length} 問`;
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    document.getElementById("textScreen").style.display = "none";
    document.getElementById("quizScreen").style.display = "none";

    document.getElementById(target).style.display = "block";
  });
});
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    // 画面切り替え
    document.getElementById("textScreen").style.display = "none";
    document.getElementById("quizScreen").style.display = "none";
    document.getElementById(target).style.display = "block";

    // active クラス切り替え
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
