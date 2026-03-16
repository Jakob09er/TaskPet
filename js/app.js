// =========================
// TASKPET - SHARED SCRIPT
// Landingpage + App
// =========================

// ---------- FOOTER YEAR ----------
const yearElements = document.querySelectorAll("#currentYear");
yearElements.forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------- ASSET CONFIG ----------
const PETS = {
  dog: {
    key: "dog",
    title: "Dog",
    subtext: "Fleischfresser. Liebt Steaks und erledigte Aufgaben.",
    food: "🥩",
    assets: {
      idle: "assets/dog_idle.png",
      blink: "assets/dog_blink.png",
      sad: "assets/dog_sad.png",
      jump: "assets/dog_jump.png",
      flip: "assets/dog_flip.png",
      eat: "assets/dog_eat.png",
      timeout: "assets/dog_timeout.png",
    },
    successSequence: ["jump", "flip", "eat"],
  },
  rabbit: {
    key: "rabbit",
    title: "Rabbit",
    subtext: "Vegan. Liebt Karotten und strukturierte Tage.",
    food: "🥕",
    assets: {
      idle: "assets/rabbit_idle.png",
      blink: "assets/rabbit_blink.png",
      sad: "assets/rabbit_sad.png",
      jump: "assets/rabbit_jump.png",
      eat: "assets/rabbit_eat.png",
      timeout: "assets/rabbit_timeout.png",
    },
    successSequence: ["jump", "eat", "jump"],
  },
};

// =========================
// LANDING PAGE LOGIC
// =========================
(function initLandingPage() {
  const dog = document.getElementById("landingDog");
  const rabbit = document.getElementById("landingRabbit");

  if (!dog || !rabbit) return;

  let activePet = "dog";

  function showPet(petKey) {
    if (petKey === "dog") {
      dog.classList.add("hero-pet-active");
      rabbit.classList.remove("hero-pet-active");
      activePet = "dog";
    } else {
      rabbit.classList.add("hero-pet-active");
      dog.classList.remove("hero-pet-active");
      activePet = "rabbit";
    }
  }

  function switchPet() {
    showPet(activePet === "dog" ? "rabbit" : "dog");
  }

  function blinkPet(imgEl, idleSrc, blinkSrc) {
    if (!imgEl) return;
    const currentSrc = imgEl.getAttribute("src");
    imgEl.setAttribute("src", blinkSrc);

    setTimeout(() => {
      imgEl.setAttribute("src", idleSrc);
    }, 180);

    return currentSrc;
  }

  // switch every 6 seconds
  setInterval(switchPet, 6000);

  // random blink
  setInterval(() => {
    const blinkDog = Math.random() > 0.5;

    if (blinkDog) {
      blinkPet(dog, PETS.dog.assets.idle, PETS.dog.assets.blink);
    } else {
      blinkPet(rabbit, PETS.rabbit.assets.idle, PETS.rabbit.assets.blink);
    }
  }, 3500);

  showPet("dog");
})();

// =========================
// APP PAGE LOGIC
// =========================
(function initAppPage() {
  const petImage = document.getElementById("petImage");
  if (!petImage) return;

  // ---------- DOM ----------
  const appLogoPet = document.getElementById("appLogoPet");

  const petTitle = document.getElementById("petTitle");
  const petSubtext = document.getElementById("petSubtext");

  const prevPetBtn = document.getElementById("prevPetBtn");
  const nextPetBtn = document.getElementById("nextPetBtn");
  const petSelector = document.getElementById("petSelector");

  const petNameInput = document.getElementById("petNameInput");
  const petNameDisplay = document.getElementById("petNameDisplay");

  const sessionTimeRange = document.getElementById("sessionTimeRange");
  const timeValueLabel = document.getElementById("timeValueLabel");

  const planningHeader = document.getElementById("planningHeader");
  const runningHeader = document.getElementById("runningHeader");
  const mainTimer = document.getElementById("mainTimer");

  const taskInput = document.getElementById("taskInput");
  const taskDurationInput = document.getElementById("taskDurationInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const taskListEmpty = document.getElementById("taskListEmpty");

  const startSessionBtn = document.getElementById("startSessionBtn");

  // ---------- STATE ----------
  let selectedPetKey = localStorage.getItem("taskpet_selected_pet") || "dog";
  let petName = localStorage.getItem("taskpet_pet_name") || "";

  let tasks = [];
  let activeTaskId = null;
  let sessionStarted = false;
  let sessionDurationMinutes = Number(sessionTimeRange?.value || 60);
  let timeRemainingSeconds = sessionDurationMinutes * 60;
  let timerInterval = null;

  let successAnimationIndex = 0;
  let blinkInterval = null;
  let blinkTimeout = null;
  let reactionTimeout = null;

  // ---------- HELPERS ----------
  function getSelectedPet() {
    return PETS[selectedPetKey];
  }

  function savePetState() {
    localStorage.setItem("taskpet_selected_pet", selectedPetKey);
    localStorage.setItem("taskpet_pet_name", petName);
  }

  function formatTime(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  function updateTimeLabel() {
    if (!timeValueLabel || !sessionTimeRange) return;
    const minutes = Number(sessionTimeRange.value);
    sessionDurationMinutes = minutes;
    timeValueLabel.textContent = `${minutes} min`;

    if (!sessionStarted) {
      timeRemainingSeconds = minutes * 60;
      if (mainTimer) {
        mainTimer.textContent = formatTime(timeRemainingSeconds);
      }
    }
  }

  function setPetVisual(stateName = "idle", duration = 1200) {
    const pet = getSelectedPet();
    const asset = pet.assets[stateName] || pet.assets.idle;

    if (!petImage) return;

    petImage.src = asset;
    if (appLogoPet) {
      appLogoPet.src = pet.assets.idle;
    }

    if (reactionTimeout) {
      clearTimeout(reactionTimeout);
    }

    if (stateName !== "idle") {
      reactionTimeout = setTimeout(() => {
        petImage.src = pet.assets.idle;
      }, duration);
    }
  }

  function blinkCurrentPet() {
    const pet = getSelectedPet();
    if (!petImage || sessionStarted === false && document.hidden) return;

    if (reactionTimeout) return; // don't blink during reactions

    petImage.src = pet.assets.blink;

    if (blinkTimeout) {
      clearTimeout(blinkTimeout);
    }

    blinkTimeout = setTimeout(() => {
      petImage.src = pet.assets.idle;
    }, 180);
  }

  function startBlinkLoop() {
    stopBlinkLoop();
    blinkInterval = setInterval(() => {
      if (Math.random() > 0.45) {
        blinkCurrentPet();
      }
    }, 3200);
  }

  function stopBlinkLoop() {
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
    if (blinkTimeout) {
      clearTimeout(blinkTimeout);
      blinkTimeout = null;
    }
  }

  function updatePetUI() {
    const pet = getSelectedPet();

    if (petTitle) petTitle.textContent = pet.title;
    if (petSubtext) petSubtext.textContent = pet.subtext;
    if (petImage) petImage.src = pet.assets.idle;
    if (appLogoPet) appLogoPet.src = pet.assets.idle;

    if (petNameInput && !sessionStarted) {
      petNameInput.value = petName;
    }

    savePetState();
  }

  function nextPet() {
    if (sessionStarted) return;
    selectedPetKey = selectedPetKey === "dog" ? "rabbit" : "dog";
    updatePetUI();
  }

  function prevPet() {
    if (sessionStarted) return;
    selectedPetKey = selectedPetKey === "dog" ? "rabbit" : "dog";
    updatePetUI();
  }

  function generateTaskId() {
    return Date.now() + Math.floor(Math.random() * 10000);
  }

  function getTaskById(taskId) {
    return tasks.find((task) => task.id === taskId);
  }

  function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    if (tasks.length === 0) {
      const empty = document.createElement("div");
      empty.className = "task-list-empty";
      empty.id = "taskListEmpty";
      empty.textContent = "No tasks yet. Add your first mission.";
      taskList.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = "task-item";
      if (task.id === activeTaskId) {
        taskItem.classList.add("active-task");
      }

      const taskMain = document.createElement("div");
      taskMain.className = "task-main";

      const taskText = document.createElement("div");
      taskText.className = "task-text";
      taskText.textContent = task.text;

      const taskMinutes = document.createElement("div");
      taskMinutes.className = "task-minutes";
      taskMinutes.textContent = `${task.duration} min`;

      taskMain.appendChild(taskText);
      taskMain.appendChild(taskMinutes);

      const taskMinutesDesktop = document.createElement("div");
      taskMinutesDesktop.className = "task-minutes";
      taskMinutesDesktop.textContent = `${task.duration} min`;

      const taskActions = document.createElement("div");
      taskActions.className = "task-actions";

      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "task-action-btn play-btn";
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-label", `Start ${task.text}`);
      playBtn.disabled = task.status === "done" || task.status === "failed";
      playBtn.addEventListener("click", () => {
        if (!sessionStarted) return;
        activeTaskId = task.id;
        renderTasks();
      });

      const doneBtn = document.createElement("button");
      doneBtn.type = "button";
      doneBtn.className = "task-action-btn done-btn";
      doneBtn.textContent = "✔";
      doneBtn.setAttribute("aria-label", `Complete ${task.text}`);
      doneBtn.disabled = task.status === "done" || task.status === "failed";
      doneBtn.addEventListener("click", () => {
        if (!sessionStarted) return;
        completeTask(task.id);
      });

      const failBtn = document.createElement("button");
      failBtn.type = "button";
      failBtn.className = "task-action-btn fail-btn";
      failBtn.textContent = "✖";
      failBtn.setAttribute("aria-label", `Fail ${task.text}`);
      failBtn.disabled = task.status === "done" || task.status === "failed";
      failBtn.addEventListener("click", () => {
        if (!sessionStarted) return;
        failTask(task.id);
      });

      if (task.status === "done") {
        playBtn.disabled = true;
        doneBtn.disabled = true;
        failBtn.disabled = true;
        taskText.style.textDecoration = "line-through";
        taskText.style.opacity = "0.65";
      }

      if (task.status === "failed") {
        playBtn.disabled = true;
        doneBtn.disabled = true;
        failBtn.disabled = true;
        taskText.style.opacity = "0.6";
      }

      taskActions.appendChild(playBtn);
      taskActions.appendChild(doneBtn);
      taskActions.appendChild(failBtn);

      taskItem.appendChild(taskMain);
      taskItem.appendChild(taskMinutesDesktop);
      taskItem.appendChild(taskActions);

      taskList.appendChild(taskItem);
    });
  }

  function addTask() {
    const text = taskInput?.value.trim();
    const duration = Number(taskDurationInput?.value || 30);

    if (!text) return;
    if (!duration || duration < 1) return;

    const newTask = {
      id: generateTaskId(),
      text,
      duration,
      status: "pending",
    };

    tasks.push(newTask);

    if (!activeTaskId) {
      activeTaskId = newTask.id;
    }

    if (taskInput) taskInput.value = "";
    if (taskDurationInput) taskDurationInput.value = 30;

    renderTasks();
    taskInput?.focus();
  }

  function getNextPendingTaskId() {
    const nextPending = tasks.find((task) => task.status === "pending");
    return nextPending ? nextPending.id : null;
  }

  function showFoodEffect() {
    const pet = getSelectedPet();
    const food = document.createElement("div");
    food.textContent = pet.food;
    food.style.position = "fixed";
    food.style.right = "24px";
    food.style.bottom = "24px";
    food.style.fontSize = "34px";
    food.style.zIndex = "9999";
    food.style.pointerEvents = "none";
    food.style.transition = "transform 0.8s ease, opacity 0.8s ease";
    food.style.opacity = "1";
    document.body.appendChild(food);

    requestAnimationFrame(() => {
      food.style.transform = "translate(-220px, -280px) scale(0.7)";
      food.style.opacity = "0";
    });

    setTimeout(() => {
      food.remove();
    }, 850);
  }

  function runSuccessAnimation() {
    const pet = getSelectedPet();
    const sequence = pet.successSequence;
    const animationName = sequence[successAnimationIndex % sequence.length];

    successAnimationIndex += 1;

    showFoodEffect();
    setPetVisual(animationName, 1100);
  }

  function completeTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;

    task.status = "done";

    runSuccessAnimation();

    if (activeTaskId === taskId) {
      activeTaskId = getNextPendingTaskId();
    }

    renderTasks();

    if (allTasksCompleted()) {
      finishSessionSuccess();
    }
  }

  function failTask(taskId) {
    const task = getTaskById(taskId);
    if (!task) return;

    task.status = "failed";
    setPetVisual("sad", 1400);

    if (activeTaskId === taskId) {
      activeTaskId = getNextPendingTaskId();
    }

    renderTasks();
  }

  function allTasksCompleted() {
    return tasks.length > 0 && tasks.every((task) => task.status === "done");
  }

  function hasOpenTasks() {
    return tasks.some((task) => task.status === "pending");
  }

  function updateTimerUI() {
    if (mainTimer) {
      mainTimer.textContent = formatTime(timeRemainingSeconds);
    }
  }

  function lockSetupUI() {
    if (planningHeader) planningHeader.classList.add("is-hidden");
    if (runningHeader) runningHeader.classList.remove("is-hidden");

    if (petSelector) petSelector.classList.add("is-hidden");

    if (petNameInput) {
      petNameInput.classList.add("is-hidden");
      petNameInput.disabled = true;
    }

    if (petNameDisplay) {
      petNameDisplay.classList.remove("is-hidden");
      petNameDisplay.textContent = petName || getSelectedPet().title;
    }

    if (startSessionBtn) {
      startSessionBtn.classList.add("is-hidden");
    }
  }

  function startTimer() {
    stopTimer();

    timerInterval = setInterval(() => {
      timeRemainingSeconds -= 1;
      updateTimerUI();

      if (timeRemainingSeconds <= 0) {
        stopTimer();
        timeRemainingSeconds = 0;
        updateTimerUI();
        handleTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function handleTimeout() {
    if (hasOpenTasks()) {
      setPetVisual("timeout", 5000);
      activeTaskId = null;
      renderTasks();
      alert("Time is up. Your TaskPet is not impressed.");
    } else {
      finishSessionSuccess();
    }
  }

  function finishSessionSuccess() {
    stopTimer();
    setPetVisual("eat", 1800);
    alert("Session complete. Your TaskPet is happy.");
  }

  function startSession() {
    if (sessionStarted) return;
    if (tasks.length === 0) {
      alert("Add at least one task before starting.");
      return;
    }

    petName = petNameInput?.value.trim() || getSelectedPet().title;
    savePetState();

    sessionStarted = true;
    timeRemainingSeconds = sessionDurationMinutes * 60;
    updateTimerUI();
    lockSetupUI();

    if (!activeTaskId) {
      activeTaskId = getNextPendingTaskId();
    }

    renderTasks();
    startTimer();
  }

  // ---------- EVENTS ----------
  prevPetBtn?.addEventListener("click", prevPet);
  nextPetBtn?.addEventListener("click", nextPet);

  petNameInput?.addEventListener("input", (e) => {
    petName = e.target.value;
    savePetState();
  });

  sessionTimeRange?.addEventListener("input", updateTimeLabel);

  addTaskBtn?.addEventListener("click", addTask);

  taskInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });

  taskDurationInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  });

  startSessionBtn?.addEventListener("click", startSession);

  // ---------- INIT ----------
  updatePetUI();
  updateTimeLabel();
  updateTimerUI();
  renderTasks();
  startBlinkLoop();
})();