import { translations } from "./translations.js";
import { extractFileText, analyzeFile } from "./file-review.js";

const STORAGE_KEY = "little-progress-tasks";
const LISTS_KEY = "little-progress-lists";
const ACTIVE_LIST_KEY = "little-progress-active-list";
const LANGUAGE_KEY = "little-progress-language";
const SHARE_PREFIX = "#share=";
const PROFILES_KEY = "little-progress-profiles";
const ACTIVE_PROFILE_KEY = "little-progress-active-profile";
let language = localStorage.getItem(LANGUAGE_KEY) || "en";
let t = translations[language] || translations.en;
const starterTasks = t.starters.map((text) => ({ id: crypto.randomUUID(), text, completed: false }));
let profileId = sessionStorage.getItem(ACTIVE_PROFILE_KEY) || "";
let taskLists = loadLists();
let activeListId = localStorage.getItem(ACTIVE_LIST_KEY) || Object.keys(taskLists)[0];
if (!taskLists[activeListId]) activeListId = Object.keys(taskLists)[0];
let tasks = taskLists[activeListId];
const list = document.querySelector("#task-list");
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const count = document.querySelector("#task-count");
const progress = document.querySelector("#progress");
const progressBar = document.querySelector("#progress-bar");
const emptyState = document.querySelector("#empty-state");
const listSelect = document.querySelector("#list-select");
const deleteListButton = document.querySelector("#delete-list-button");
const fileInput = document.querySelector("#file-input");
const reviewStatus = document.querySelector("#review-status");
const insights = document.querySelector("#insights");
const newListModal = document.querySelector("#new-list-modal");
const newListForm = document.querySelector("#new-list-form");
const newListName = document.querySelector("#new-list-name");
const newListError = document.querySelector("#new-list-error");
const closeListModal = document.querySelector("#close-list-modal");
const cancelListButton = document.querySelector("#cancel-list-button");
const profileGate = document.querySelector("#profile-gate");
const profileForm = document.querySelector("#profile-form");
const profileInput = document.querySelector("#profile-input");
const profilePin = document.querySelector("#profile-pin");
const profilePinConfirm = document.querySelector("#profile-pin-confirm");
const confirmPinLabel = document.querySelector("#confirm-pin-label");
const profileError = document.querySelector("#profile-error");
const profileModeButton = document.querySelector("#profile-mode-button");
const profileSubmit = document.querySelector("#profile-submit");
const profileName = document.querySelector("#profile-name");
const lockProfileButton = document.querySelector("#lock-profile-button");
const shareListButton = document.querySelector("#share-list-button");
const shareModal = document.querySelector("#share-modal");
const shareLink = document.querySelector("#share-link");
const copyShareLink = document.querySelector("#copy-share-link");
const closeShareModal = document.querySelector("#close-share-modal");
const cancelShareButton = document.querySelector("#cancel-share-button");
const shareStatus = document.querySelector("#share-status");
let filter = "all";
let lastFocusedElement = null;
let creatingProfile = !localStorage.getItem(PROFILES_KEY);
let currentProfileName = "";
let sharedSnapshot = readSharedSnapshot();
const readOnlyMode = Boolean(sharedSnapshot);

function readSharedSnapshot() {
  if (!location.hash.startsWith(SHARE_PREFIX)) return null;
  try {
    const encoded = location.hash.slice(SHARE_PREFIX.length).replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data.name !== "string" || !Array.isArray(data.tasks)) return null;
    return { name: data.name, tasks: data.tasks.filter((task) => task && typeof task.text === "string").map((task) => ({ id: crypto.randomUUID(), text: task.text, completed: Boolean(task.completed) })) };
  } catch (error) {
    console.warn("Could not read shared list.", error);
    return null;
  }
}

function encodeSharedSnapshot(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hashPin(pin) {
  const bytes = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function profileStorageKey() {
  return profileId ? `little-progress-lists-${profileId}` : LISTS_KEY;
}

function activeListStorageKey() {
  return profileId ? `${ACTIVE_LIST_KEY}-${profileId}` : ACTIVE_LIST_KEY;
}

function loadLists() {
  try {
    const savedLists = localStorage.getItem(profileStorageKey());
    if (savedLists) {
      const parsed = JSON.parse(savedLists);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length) return parsed;
    }
    const oldTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return { personal: Array.isArray(oldTasks) ? oldTasks : starterTasks };
  } catch (error) {
    console.warn("Could not load saved task lists.", error);
    return { personal: starterTasks };
  }
}

function saveTasks() {
  try {
    taskLists[activeListId] = tasks;
    localStorage.setItem(profileStorageKey(), JSON.stringify(taskLists));
    localStorage.setItem(activeListStorageKey(), activeListId);
  } catch (error) { console.warn("Could not save task lists.", error); }
}

function renderListSwitcher() {
  listSelect.innerHTML = Object.keys(taskLists).map((id) => `<option value="${escapeHtml(id)}">${escapeHtml(id)}</option>`).join("");
  listSelect.value = activeListId;
  listSelect.setAttribute("aria-label", language === "ar" ? "Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ù‡Ø§Ù…" : "Task list");
  deleteListButton.disabled = Object.keys(taskLists).length <= 1;
  deleteListButton.title = deleteListButton.disabled ? "Keep at least one list" : `${t.deleteList}: ${activeListId}`;
}

function applyLanguage() {
  t = translations[language] || translations.en;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t[element.dataset.i18n] || translations.en[element.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t[element.dataset.i18nPlaceholder];
  });
  document.querySelector("#new-task-label").textContent = t.input;
  document.querySelector("#language-select").value = language;
  document.querySelector("#language-select").setAttribute("aria-label", language === "ar" ? "Ø§Ù„Ù„ØºØ©" : "Language");
  closeListModal.setAttribute("aria-label", language === "ar" ? "إغلاق" : "Close");
  renderListSwitcher();
  profileName.textContent = currentProfileName || "—";
  if (readOnlyMode) {
    shareStatus.textContent = t.readOnly || translations.en.readOnly;
  }
}

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
  } catch (error) {
    console.warn("Could not load local profiles.", error);
    return {};
  }
}

function makeProfileId(name) {
  return `profile-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function updateProfileMode() {
  confirmPinLabel.hidden = !creatingProfile;
  profilePinConfirm.hidden = !creatingProfile;
  profileSubmit.textContent = creatingProfile ? (t.continue || "Continue") : (t.unlock || "Unlock");
  profileModeButton.textContent = creatingProfile ? (t.existingProfile || "I already have a profile") : (t.createProfile || "Create a new profile");
}

function showProfileGate() {
  profileGate.hidden = false;
  profileInput.value = "";
  profilePin.value = "";
  profilePinConfirm.value = "";
  profileError.hidden = true;
  profileInput.focus();
  updateProfileMode();
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function render() {
  list.innerHTML = "";
  const visibleTasks = tasks.filter((task) => filter === "all" || (filter === "completed" ? task.completed : !task.completed));
  emptyState.hidden = visibleTasks.length > 0;
  emptyState.textContent = tasks.length && filter !== "all" ? (filter === "active" ? t.noOpen : t.noDone) : t.empty;
  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task${task.completed ? " completed" : ""}`;
    item.dataset.id = task.id;
    item.innerHTML = `
      <input class="checkbox" type="checkbox" aria-label="${escapeHtml(t.mark.replace("{task}", task.text))}" ${task.completed ? "checked" : ""} ${readOnlyMode ? "disabled" : ""}>
      <span class="task-label" ${readOnlyMode ? "" : 'role="button" tabindex="0"'} title="${escapeHtml(t.hint)}">${escapeHtml(task.text)}</span>
      <button class="delete-button" type="button" aria-label="${escapeHtml(t.delete.replace("{task}", task.text))}" ${readOnlyMode ? "hidden" : ""}>&times;</button>
    `;
    list.append(item);
  });
  const completed = tasks.filter((task) => task.completed).length;
  count.textContent = `${tasks.length} ${tasks.length === 1 ? t.item : t.items}`;
  progress.textContent = tasks.length ? `${completed} / ${tasks.length} ${t.complete}` : t.ready;
  progressBar.style.width = tasks.length ? `${completed / tasks.length * 100}%` : "0%";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  render();
  input.value = "";
  input.focus();
});

list.addEventListener("change", (event) => {
  if (!event.target.matches(".checkbox")) return;
  const item = event.target.closest(".task");
  const task = tasks.find((entry) => entry.id === item.dataset.id);
  if (!task) return;
  task.completed = event.target.checked;
  saveTasks();
  render();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-button");
  if (!button) return;
  const item = button.closest(".task");
  item.classList.add("removing");
  item.addEventListener("animationend", () => {
    tasks = tasks.filter((task) => task.id !== item.dataset.id);
    saveTasks();
    render();
  }, { once: true });
});

function startEditing(label) {
  const item = label.closest(".task");
  const task = tasks.find((entry) => entry.id === item.dataset.id);
  if (!task || item.querySelector(".edit-input")) return;
  const editor = document.createElement("input");
  editor.className = "edit-input";
  editor.value = task.text;
  editor.maxLength = 120;
  editor.setAttribute("aria-label", t.edit);
  label.replaceWith(editor);
  editor.focus();
  editor.select();
  const finish = (save) => {
    const text = editor.value.trim();
    if (save && text) task.text = text;
    saveTasks();
    render();
  };
  editor.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
  editor.addEventListener("blur", () => finish(true), { once: true });
}

list.addEventListener("dblclick", (event) => {
  if (event.target.matches(".task-label")) startEditing(event.target);
});
list.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches(".task-label")) startEditing(event.target);
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

document.querySelector("#language-select").addEventListener("change", (event) => {
  language = event.target.value;
  localStorage.setItem(LANGUAGE_KEY, language);
  applyLanguage();
  render();
});

listSelect.addEventListener("change", (event) => {
  saveTasks();
  activeListId = event.target.value;
  tasks = taskLists[activeListId];
  filter = "all";
  document.querySelectorAll(".filter-button").forEach((item, index) => item.classList.toggle("active", index === 0));
  render();
});

function openListModal() {
  lastFocusedElement = document.activeElement;
  newListError.hidden = true;
  newListName.value = "";
  newListModal.hidden = false;
  newListName.focus();
}

function closeListDialog() {
  newListModal.hidden = true;
  lastFocusedElement?.focus();
}

document.querySelector("#new-list-button").addEventListener("click", openListModal);
deleteListButton.addEventListener("click", () => {
  if (Object.keys(taskLists).length <= 1) return;
  const message = (t.deleteListConfirm || translations.en.deleteListConfirm).replace("{list}", activeListId);
  if (!window.confirm(message)) return;
  delete taskLists[activeListId];
  activeListId = Object.keys(taskLists)[0];
  tasks = taskLists[activeListId];
  filter = "all";
  saveTasks();
  renderListSwitcher();
  render();
});
closeListModal.addEventListener("click", closeListDialog);
cancelListButton.addEventListener("click", closeListDialog);
newListModal.addEventListener("click", (event) => {
  if (event.target === newListModal) closeListDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !newListModal.hidden) closeListDialog();
});

newListForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = newListName.value;
  const cleanName = name ? name.trim().slice(0, 40) : "";
  if (!cleanName) return;
  if (Object.keys(taskLists).some((id) => id.toLowerCase() === cleanName.toLowerCase())) {
    newListError.textContent = t.duplicateList || translations.en.duplicateList;
    newListError.hidden = false;
    newListName.focus();
    return;
  }
  const id = cleanName;
  taskLists[id] = [];
  activeListId = id;
  tasks = taskLists[id];
  saveTasks();
  renderListSwitcher();
  render();
  closeListDialog();
});

function openShareModal() {
  const snapshot = encodeSharedSnapshot({ name: activeListId, tasks });
  shareLink.value = `${location.href.split("#")[0]}${SHARE_PREFIX}${snapshot}`;
  shareStatus.textContent = t.shareDescription || translations.en.shareDescription;
  shareModal.hidden = false;
  shareLink.focus();
  shareLink.select();
}

function closeShareDialog() {
  shareModal.hidden = true;
}

shareListButton.addEventListener("click", openShareModal);
closeShareModal.addEventListener("click", closeShareDialog);
cancelShareButton.addEventListener("click", closeShareDialog);
shareModal.addEventListener("click", (event) => {
  if (event.target === shareModal) closeShareDialog();
});
copyShareLink.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    shareStatus.textContent = "Read-only link copied.";
  } catch (error) {
    shareLink.focus();
    shareLink.select();
    shareStatus.textContent = "Copy was blocked. Press Ctrl+C to copy the selected link.";
  }
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  const extension = file.name.toLowerCase().split(".").pop();
  reviewStatus.className = "review-status";
  reviewStatus.textContent = `Reading ${file.name}â€¦`;
  insights.hidden = true;
  try {
    const text = await extractFileText(file);
    const findings = analyzeFile(file, text);
    findings.slice().reverse().forEach((finding) => tasks.unshift({ id: crypto.randomUUID(), text: `${finding.task} ? Fix: ${finding.fix}`, completed: false }));
    saveTasks();
    insights.innerHTML = findings.map((finding) => `<li class="finding"><strong>${escapeHtml(finding.issue)}</strong><span class="fix"><b>How to fix:</b> ${escapeHtml(finding.fix)}</span><span><b>Task added:</b> ${escapeHtml(finding.task)}</span></li>`).join("");
    insights.hidden = false;
    reviewStatus.className = "review-status success";
    reviewStatus.textContent = `Found ${findings.length} improvement areas in ${file.name} and added a fix task for each.`;
    if (["doc", "xls", "ppt"].includes(extension)) {
      reviewStatus.textContent += " This older format was reviewed by filename; save it as a modern format for content analysis.";
    }
    render();
  } catch (error) {
    reviewStatus.className = "review-status error";
    reviewStatus.textContent = `Could not read ${file.name}: ${error.message}`;
  } finally {
    fileInput.value = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== input && !document.activeElement.matches(".edit-input")) {
    event.preventDefault();
    input.focus();
  }
});

profileModeButton.addEventListener("click", () => {
  creatingProfile = !creatingProfile;
  profileError.hidden = true;
  profilePin.value = "";
  profilePinConfirm.value = "";
  updateProfileMode();
  profileInput.focus();
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = profileInput.value.trim();
  const pin = profilePin.value;
  const profiles = getProfiles();
  const id = makeProfileId(name);
  if (!name || !id.slice("profile-".length) || pin.length < 4) return;
  if (creatingProfile) {
    if (profiles[id]) {
      profileError.textContent = t.profileExists || translations.en.profileExists;
      profileError.hidden = false;
      return;
    }
    if (pin !== profilePinConfirm.value) {
      profileError.textContent = "PINs do not match.";
      profileError.hidden = false;
      return;
    }
    profiles[id] = { name, pinHash: await hashPin(pin) };
    saveProfiles(profiles);
    if (!Object.keys(taskLists).length || Object.keys(profiles).length === 1 && !localStorage.getItem(profileStorageKey())) {
      taskLists = { personal: starterTasks };
    }
  } else if (!profiles[id] || profiles[id].pinHash !== await hashPin(pin)) {
    profileError.textContent = t.wrongPin || translations.en.wrongPin;
    profileError.hidden = false;
    return;
  }
  profileId = id;
  currentProfileName = profiles[id].name;
  sessionStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  if (creatingProfile) {
    localStorage.setItem(profileStorageKey(), JSON.stringify(taskLists));
  } else {
    taskLists = loadLists();
  }
  activeListId = localStorage.getItem(activeListStorageKey()) || Object.keys(taskLists)[0];
  if (!taskLists[activeListId]) activeListId = Object.keys(taskLists)[0];
  tasks = taskLists[activeListId];
  profileGate.hidden = true;
  applyLanguage();
  render();
});

lockProfileButton.addEventListener("click", () => {
  sessionStorage.removeItem(ACTIVE_PROFILE_KEY);
  profileId = "";
  currentProfileName = "";
  profileGate.hidden = false;
  creatingProfile = false;
  showProfileGate();
});

document.querySelector("#clear-completed").addEventListener("click", () => {
  if (!tasks.some((task) => task.completed)) return;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

applyLanguage();
render();
if (readOnlyMode) {
  taskLists = { [sharedSnapshot.name]: sharedSnapshot.tasks };
  activeListId = sharedSnapshot.name;
  tasks = sharedSnapshot.tasks;
  profileGate.hidden = true;
  document.querySelector(".profile-bar").hidden = true;
  document.querySelector(".list-switcher").hidden = true;
  form.hidden = true;
  document.querySelector(".review-card").hidden = true;
  document.querySelector("footer").hidden = true;
  document.querySelector(".toolbar").insertAdjacentHTML("beforebegin", `<div class="read-only-banner">${escapeHtml(t.readOnly || translations.en.readOnly)}</div>`);
  render();
} else if (profileId) {
  const profiles = getProfiles();
  currentProfileName = profiles[profileId]?.name || "";
  profileName.textContent = currentProfileName || "—";
  profileGate.hidden = true;
} else {
  profileGate.hidden = false;
  updateProfileMode();
}
