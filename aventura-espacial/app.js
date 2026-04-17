const app = document.getElementById("app");
const bgm = document.getElementById("bgm");
const ticTac = document.getElementById("tic-tac");
const soundToggle = document.getElementById("sound-toggle");
const fullscreenToggle = document.getElementById("fullscreen-toggle");
const installButton = document.getElementById("install-button");
const feedbackModal = document.getElementById("feedback-modal");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackText = document.getElementById("feedback-text");
const feedbackImage = document.getElementById("feedback-image");

const images = {
  inicial: "./assets/images/tela-inicial.png",
  narrativa1: "./assets/images/narrativa-1.png",
  narrativa2: "./assets/images/narrativa-2.png",
  narrativa3: "./assets/images/narrativa-3.png",
  narrativa4: "./assets/images/narrativa-4.png",
  narrativa5: "./assets/images/narrativa-5.png",
  narrativa6: "./assets/images/narrativa-6.png",
  narrativa7: "./assets/images/narrativa-7.png",
  pistas: "./assets/images/pistas.png",
  l1v: "./assets/images/nivel1-vitoria.png",
  l1d: "./assets/images/nivel1-derrota.png",
  l2v: "./assets/images/nivel2-vitoria.png",
  l2d: "./assets/images/nivel2-derrota.png",
  l3v: "./assets/images/nivel3-vitoria.png",
  l3d: "./assets/images/nivel3-derrota.png",
  finalV: "./assets/images/vitoria-final.png",
  finalD: "./assets/images/derrota-final.png",
  acerto: "./assets/images/acerto.png",
  erro: "./assets/images/erro.png"
};

const sounds = {
  acerto: "./assets/sounds/acerto.mp3",
  erro: "./assets/sounds/erro.mp3",
  tempo: "./assets/sounds/tempo-esgotado.mp3",
  derrota: "./assets/sounds/derrota.mp3",
  vitoria: "./assets/sounds/vitoria.mp3"
};

const FINAL_CODE = "8569";
const FEEDBACK_DURATION_MS = 1300;

const level1Questions = [
  { panel: 9, options: { A: "4 + 5", B: "6 + 2", C: "5 + 3", D: "8 + 0" }, answer: "A" },
  { panel: 10, options: { A: "4 + 5", B: "6 + 2", C: "5 + 3", D: "8 + 2" }, answer: "D" },
  { panel: 8, options: { A: "4 + 5", B: "6 + 2", C: "5 + 3", D: "8 + 1" }, answer: "C" },
  { panel: 14, options: { A: "6 + 5", B: "6 + 3", C: "7 + 7", D: "8 + 0" }, answer: "C" },
  { panel: 15, options: { A: "9 + 5", B: "7 + 8", C: "8 + 8", D: "8 + 4" }, answer: "B" }
];

const level2Questions = [
  {
    prompt: "Se o astronauta andar 3 casas para cima e 2 casas para a esquerda, ele vai ficar na mesma posição do(a):",
    grid: { A2: "☀️", B2: "⭐", C2: "🌜", D2: "☄️", E4: "🧑‍🚀" },
    options: { A: "SOL", B: "LUA", C: "ASTEROIDE", D: "ESTRELA" },
    answer: "D"
  },
  {
    prompt: "Qual é a localização da estrela Alfa?",
    grid: { B5: "🌟" },
    options: { A: "A1", B: "D5", C: "B5", D: "C3" },
    answer: "C"
  },
  {
    prompt: "Se o foguete avançar 4 casas para cima e 2 casas à direita, em que posição ele vai ficar?",
    grid: { E3: "🚀" },
    options: { A: "A4", B: "D5", C: "B4", D: "A5" },
    answer: "D"
  },
  {
    prompt: "Qual é a posição do astronauta?",
    grid: { A4: "🧑‍🚀" },
    options: { A: "A4", B: "A3", C: "C4", D: "B1" },
    answer: "A"
  },
  {
    prompt: "Se o astronauta avançar duas casas para baixo e três casas à esquerda, ele vai ficar em qual posição?",
    grid: { A4: "🧑‍🚀" },
    options: { A: "A3", B: "D1", C: "C1", D: "B1" },
    answer: "C"
  }
];

const level3Questions = [
  { options: { A: "55 + 45", B: "55 + 55", C: "45 + 45", D: "60 + 45" }, answer: "A" },
  { options: { A: "45 + 50", B: "60 + 35", C: "25 + 75", D: "50 + 45" }, answer: "C" },
  { options: { A: "78 + 21", B: "77 + 34", C: "33 + 77", D: "65 + 35" }, answer: "D" },
  { options: { A: "98 + 1", B: "95 + 6", C: "84 + 26", D: "94 + 6" }, answer: "D" },
  { options: { A: "38 + 45", B: "54 + 26", C: "63 + 37", D: "92 + 7" }, answer: "C" }
];

const state = {
  soundEnabled: true,
  screen: "home",
  timerId: null,
  timeLeft: 0,
  currentLevel: 1,
  questionIndex: 0,
  score: 0,
  fuel: 0,
  isLocked: false,
  deferredPrompt: null
};

function createTwoColumn(left, right) {
  app.innerHTML = `<section class="screen"><div class="card">${left}</div><div class="card">${right}</div></section>`;
}

function renderImage(src, alt) {
  return `<img class="scene-image" src="${src}" alt="${alt}">`;
}

function optionButtons(options) {
  return Object.entries(options)
    .map(
      ([key, text]) =>
        `<button class="option" data-option="${key}"><strong>${key})</strong> ${text}</button>`
    )
    .join("");
}

function timerText(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function playEffect(sound) {
  if (!state.soundEnabled || !sound) return;
  const effect = new Audio(sound);
  effect.currentTime = 0;
  effect.play().catch(() => {});
}

function showFeedback({ title, text, image, sound }, cb) {
  feedbackTitle.textContent = title;
  feedbackText.textContent = text;

  if (image) {
    feedbackImage.src = image;
    feedbackImage.classList.remove("hidden");
  } else {
    feedbackImage.classList.add("hidden");
  }

  feedbackModal.classList.remove("hidden");
  playEffect(sound);

  setTimeout(() => {
    feedbackModal.classList.add("hidden");
    if (cb) cb();
  }, FEEDBACK_DURATION_MS);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
  ticTac.pause();
  ticTac.currentTime = 0;
}

function startTimer(seconds, onTick, onExpire) {
  stopTimer();
  state.timeLeft = seconds;
  onTick(state.timeLeft);

  if (state.soundEnabled) {
    ticTac.currentTime = 0;
    ticTac.play().catch(() => {});
  }

  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    onTick(state.timeLeft);

    if (state.timeLeft <= 0) {
      stopTimer();
      playEffect(sounds.tempo);
      showFeedback(
        {
          title: "Tempo esgotado",
          text: "O tempo acabou para esta etapa.",
          sound: null
        },
        onExpire
      );
    }
  }, 1000);
}

function setAudioState() {
  soundToggle.textContent = state.soundEnabled ? "🔊 Som ligado" : "🔇 Som desligado";
  if (state.soundEnabled) {
    bgm.play().catch(() => {});
  } else {
    bgm.pause();
    ticTac.pause();
  }
}

function beginLevel(level) {
  state.currentLevel = level;
  state.questionIndex = 0;
  state.score = 0;
  if (level === 3) state.fuel = 0;
}

function toLevelResult(level, passed) {
  stopTimer();
  if (passed) playEffect(sounds.vitoria);
  else playEffect(sounds.derrota);

  if (level === 1) {
    createResultScreen(
      passed ? images.l1v : images.l1d,
      passed
        ? "Vocês conseguiram! As luzes da nave voltaram a se acender!"
        : "Vocês fracassaram, é preciso escalar outra equipe para tentar fazer o trabalho.",
      passed ? "CONTINUAR" : "TENTAR NOVAMENTE",
      () => (passed ? renderNarrative5() : renderLevel1Intro())
    );
  }

  if (level === 2) {
    createResultScreen(
      passed ? images.l2v : images.l2d,
      passed
        ? "O mapa foi reconstruído, agora vocês já podem se orientar!"
        : "Vocês fracassaram, é preciso escalar outra equipe para tentar fazer o trabalho.",
      passed ? "CONTINUAR" : "TENTAR NOVAMENTE",
      () => (passed ? renderNarrative6() : renderLevel2Intro())
    );
  }

  if (level === 3) {
    createResultScreen(
      passed ? images.l3v : images.l3d,
      passed
        ? "Vocês conseguiram! O tanque está cheio e já podem avançar!"
        : "Vocês fracassaram, é preciso escalar outra equipe para tentar fazer o trabalho.",
      passed ? "IR PARA O DESAFIO FINAL" : "TENTAR NOVAMENTE",
      () => (passed ? renderNarrative7() : renderLevel3Intro())
    );
  }
}

function createResultScreen(image, message, buttonText, nextFn) {
  createTwoColumn(
    renderImage(image, "Resultado"),
    `<h2>Resultado</h2><p>${message}</p><button class="primary" id="next-result">${buttonText}</button>`
  );
  document.getElementById("next-result").addEventListener("click", nextFn);
}

function renderHome() {
  stopTimer();
  createTwoColumn(
    `
      <h1>AVENTURA ESPACIAL</h1>
      <p>Jogo pedagógico de Matemática para o 3º ano do Ensino Fundamental.</p>
      <p>Nível de dificuldade: fácil.</p>
      <p>Criado por Edneia Angélica Gomes.</p>
      <button class="primary" id="start-game">COMEÇAR</button>
    `,
    renderImage(images.inicial, "Tela inicial")
  );

  document.getElementById("start-game").addEventListener("click", renderNarrative1);
}

function renderNarrative(image, text, nextFn) {
  stopTimer();
  createTwoColumn(
    renderImage(image, "Narrativa"),
    `<h2>Narrativa</h2><p>${text}</p><button class="primary" id="next-story">AVANÇAR</button>`
  );
  document.getElementById("next-story").addEventListener("click", nextFn);
}

function renderNarrative1() {
  renderNarrative(
    images.narrativa1,
    "Vocês são jovens cadetes da Academia Estelar, enviados para explorar o planeta Marte.",
    renderNarrative2
  );
}

function renderNarrative2() {
  renderNarrative(
    images.narrativa2,
    "Durante a viagem, um campo magnético misterioso desvia a nave, deixando a tripulação presa em uma enorme nebulosa.",
    renderNarrative3
  );
}

function renderNarrative3() {
  renderNarrative(
    images.narrativa3,
    "Agora vocês têm que encarar altos desafios para consertar a nave, escapar da nebulosa e continuar a missão.",
    renderLevel1Intro
  );
}

function renderLevel1Intro() {
  beginLevel(1);
  renderNarrative(
    images.narrativa4,
    "Quando a nave é sugada pelo campo magnético, a central de energia é danificada. É preciso consertá-la, descobrindo qual das operações abaixo tem como resultado o número do painel.",
    renderLevel1Question
  );
}

function renderLevel1Question() {
  const question = level1Questions[state.questionIndex];
  createTwoColumn(
    `
      <h2>Nível 1 - Questão ${state.questionIndex + 1}/5</h2>
      <p class="timer" id="timer">01:00</p>
      <p>Painel luminoso:</p>
      <p class="panel-number">${question.panel}</p>
    `,
    `
      <h3>Escolha a operação correta</h3>
      ${optionButtons(question.options)}
    `
  );

  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => processLevelAnswer(button.dataset.option, question.answer, 1));
  });

  startTimer(
    60,
    (time) => {
      const timer = document.getElementById("timer");
      if (timer) timer.textContent = timerText(time);
    },
    () => processLevelAnswer(null, question.answer, 1)
  );
}

function renderGrid(placements = {}) {
  const rows = ["A", "B", "C", "D", "E"];
  const cols = ["1", "2", "3", "4", "5"];
  let html = `<div class="grid-wrapper"><div class="grid">`;
  html += `<div class="cell label"></div>${cols.map((c) => `<div class="cell label">${c}</div>`).join("")}`;

  rows.forEach((row) => {
    html += `<div class="cell label">${row}</div>`;
    cols.forEach((col) => {
      html += `<div class="cell">${placements[`${row}${col}`] || ""}</div>`;
    });
  });

  html += `</div></div>`;
  return html;
}

function renderLevel2Intro() {
  beginLevel(2);
  renderNarrative(
    images.narrativa5,
    "O mapa estelar foi danificado pelo campo magnético. É preciso reconstruí-lo, encontrando as estrelas perdidas.",
    renderLevel2Question
  );
}

function renderLevel2Question() {
  const question = level2Questions[state.questionIndex];
  createTwoColumn(
    `
      <h2>Nível 2 - Questão ${state.questionIndex + 1}/5</h2>
      <p>${question.prompt}</p>
      ${renderGrid(question.grid)}
    `,
    `
      <p class="timer" id="timer">01:00</p>
      <h3>Alternativas</h3>
      ${optionButtons(question.options)}
    `
  );

  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => processLevelAnswer(button.dataset.option, question.answer, 2));
  });

  startTimer(
    60,
    (time) => {
      const timer = document.getElementById("timer");
      if (timer) timer.textContent = timerText(time);
    },
    () => processLevelAnswer(null, question.answer, 2)
  );
}

function renderLevel3Intro() {
  beginLevel(3);
  renderNarrative(
    images.narrativa6,
    "O tanque de combustível foi avariado. É preciso acertar as operações que recuperam o combustível, deixando o tanque 100% cheio.",
    renderLevel3Question
  );
}

function renderLevel3Question() {
  const question = level3Questions[state.questionIndex];
  createTwoColumn(
    `
      <h2>Nível 3 - Questão ${state.questionIndex + 1}/5</h2>
      <p class="timer" id="timer">01:00</p>
      <p>Tanque de combustível:</p>
      <p class="fuel ${state.fuel === 100 ? "full" : ""}" id="fuel-mark">${state.fuel}%</p>
    `,
    `
      <h3>Qual operação deixa o tanque em 100%?</h3>
      ${optionButtons(question.options)}
    `
  );

  document.querySelectorAll("[data-option]").forEach((button) => {
    button.addEventListener("click", () => processLevel3Answer(button.dataset.option, question.answer));
  });

  startTimer(
    60,
    (time) => {
      const timer = document.getElementById("timer");
      if (timer) timer.textContent = timerText(time);
    },
    () => processLevel3Answer(null, question.answer)
  );
}

function processLevelAnswer(selected, expected, level) {
  if (state.isLocked) return;
  state.isLocked = true;
  stopTimer();

  const correct = selected === expected;
  if (correct) state.score += 1;

  showFeedback(
    {
      title: correct ? "Acerto" : "Erro",
      text: correct ? "Resposta correta!" : "Resposta incorreta.",
      image: correct ? images.acerto : images.erro,
      sound: correct ? sounds.acerto : sounds.erro
    },
    () => {
      state.questionIndex += 1;
      state.isLocked = false;

      if (state.questionIndex >= 5) {
        toLevelResult(level, state.score >= 4);
        return;
      }

      if (level === 1) renderLevel1Question();
      if (level === 2) renderLevel2Question();
    }
  );
}

function processLevel3Answer(selected, expected) {
  if (state.isLocked) return;
  state.isLocked = true;
  stopTimer();

  const correct = selected === expected;
  state.fuel = correct ? 100 : 0;
  if (correct) state.score += 1;

  showFeedback(
    {
      title: correct ? "Acerto" : "Erro",
      text: correct ? "Tanque recarregado em 100%!" : "Operação incorreta, tanque em 0%.",
      image: correct ? images.acerto : images.erro,
      sound: correct ? sounds.acerto : sounds.erro
    },
    () => {
      state.questionIndex += 1;
      state.isLocked = false;

      if (state.questionIndex >= 5) {
        toLevelResult(3, state.score >= 4);
      } else {
        renderLevel3Question();
      }
    }
  );
}

function renderNarrative5() {
  renderLevel2Intro();
}

function renderNarrative6() {
  renderLevel3Intro();
}

function renderNarrative7() {
  renderNarrative(
    images.narrativa7,
    "A saída da nebulosa aparece através de um portal misterioso trancado por códigos numéricos. Resolva os enigmas, junte as pistas e descubra o código.",
    renderClues
  );
}

function renderClues() {
  createTwoColumn(
    `
      <h2>Desafio Final - Pistas</h2>
      <p class="timer" id="timer">05:00</p>
      <ol>
        <li>Quantos números pares há entre 1 e 17?</li>
        <li>Quantos números ímpares há entre 0 e 10?</li>
        <li>Quantas vezes o número 1 aparece entre 0 e 13?</li>
        <li>Número que corresponde à letra I.</li>
      </ol>
      <button class="primary" id="go-code">AVANÇAR</button>
    `,
    renderImage(images.pistas, "Pistas")
  );

  document.getElementById("go-code").addEventListener("click", renderCodeEntry);

  startTimer(
    300,
    (time) => {
      const timer = document.getElementById("timer");
      if (timer) timer.textContent = timerText(time);
    },
    renderCodeEntry
  );
}

function renderCodeEntry() {
  stopTimer();
  createTwoColumn(
    renderImage(images.narrativa7, "Portal"),
    `
      <h2>Digite o código de 4 dígitos</h2>
      <p>Use as pistas para descobrir a sequência correta.</p>
      <div class="code-inputs">
        <input inputmode="numeric" maxlength="1" class="digit" aria-label="Dígito 1 do código" />
        <input inputmode="numeric" maxlength="1" class="digit" aria-label="Dígito 2 do código" />
        <input inputmode="numeric" maxlength="1" class="digit" aria-label="Dígito 3 do código" />
        <input inputmode="numeric" maxlength="1" class="digit" aria-label="Dígito 4 do código" />
      </div>
      <button class="primary" id="check-code" aria-label="Confirmar código de quatro dígitos">CONFIRMAR CÓDIGO</button>
    `
  );

  const digitInputs = Array.from(document.querySelectorAll(".digit"));
  digitInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 1);
      if (input.value && index < digitInputs.length - 1) digitInputs[index + 1].focus();
    });
  });

  document.getElementById("check-code").addEventListener("click", () => {
    const code = digitInputs.map((el) => el.value).join("");
    const success = code === FINAL_CODE;

    createResultScreen(
      success ? images.finalV : images.finalD,
      success
        ? "Código correto! A nave escapou da nebulosa e a missão foi concluída."
        : "Código incorreto! O portal continua trancado.",
      "REINICIAR JOGO",
      renderHome
    );

    playEffect(success ? sounds.vitoria : sounds.derrota);
  });
}

function configureGlobalActions() {
  document.body.addEventListener(
    "click",
    () => {
      if (state.soundEnabled) bgm.play().catch(() => {});
    },
    { once: true }
  );

  soundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    setAudioState();
  });

  fullscreenToggle.addEventListener("click", async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.();
      await screen.orientation?.lock?.("landscape").catch(() => {});
    } else {
      await document.exitFullscreen?.();
    }
  });

  const isStandalone =
    // navigator.standalone cobre Safari iOS quando o app é aberto pela tela inicial.
    window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  const showInstallOnFirstVisit = !isStandalone && !localStorage.getItem("aventura-install-visit");
  if (showInstallOnFirstVisit) {
    installButton.classList.remove("hidden");
    localStorage.setItem("aventura-install-visit", "1");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    installButton.classList.remove("hidden");
  });

  installButton.addEventListener("click", async () => {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      installButton.classList.add("hidden");
      return;
    }

    showFeedback({
      title: "Instalação",
      text: "Use o menu do navegador e escolha \"Adicionar à tela inicial\" para instalar no celular.",
      sound: null
    });
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

configureGlobalActions();
setAudioState();
renderHome();
