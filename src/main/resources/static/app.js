const signupForm = document.getElementById("signup-form");
const authForm = document.getElementById("auth-form");
const clearAuthButton = document.getElementById("clear-auth");
const entryForm = document.getElementById("entry-form");
const entriesContainer = document.getElementById("entries");
const refreshEntriesButton = document.getElementById("refresh-entries");
const basePathLabel = document.getElementById("base-path");
const activeUserLabel = document.getElementById("active-user");
const profileForm = document.getElementById("profile-form");
const deleteAccountButton = document.getElementById("delete-account");
const adminForm = document.getElementById("admin-form");
const loadUsersButton = document.getElementById("load-users");
const adminUsersContainer = document.getElementById("admin-users");

const signupStatus = document.getElementById("signup-status");
const authStatus = document.getElementById("auth-status");
const entryStatus = document.getElementById("entry-status");
const profileStatus = document.getElementById("profile-status");
const adminStatus = document.getElementById("admin-status");

const AUTH_STORAGE_KEY = "journalapp.auth";
const basePath = window.location.pathname
  .replace(/\/index\.html$/, "")
  .replace(/\/$/, "");
const apiPath = (path) => `${basePath}${path}`;

const setStatus = (element, message, type = "") => {
  element.textContent = message;
  element.className = `status ${type}`.trim();
};

const loadAuth = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return { username: "", password: "" };
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { username: "", password: "" };
  }
};

const saveAuth = (auth) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

const authHeader = () => {
  const auth = loadAuth();
  if (!auth.username || !auth.password) {
    return null;
  }
  return `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
};

const request = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const auth = authHeader();
  if (auth && !options.skipAuth) {
    headers.Authorization = auth;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const renderEntries = (entries = []) => {
  if (!entries.length) {
    entriesContainer.innerHTML = '<p class="muted">No entries found.</p>';
    return;
  }

  entriesContainer.innerHTML = "";
  entries.forEach((entry) => {
    const wrapper = document.createElement("div");
    wrapper.className = "entry";

    const titleInput = document.createElement("input");
    titleInput.value = entry.title || "";
    titleInput.placeholder = "Title";

    const contentInput = document.createElement("textarea");
    contentInput.rows = 3;
    contentInput.value = entry.content || "";
    contentInput.placeholder = "Content";

    const metadata = document.createElement("div");
    metadata.className = "entry-meta";
    const entryId = document.createElement("span");
    entryId.textContent = `ID: ${entry.id || "unknown"}`;
    const entryDate = document.createElement("span");
    entryDate.textContent = entry.date ? `Date: ${entry.date}` : "Date: n/a";
    metadata.append(entryId, entryDate);

    const actions = document.createElement("div");
    actions.className = "entry-actions";

    const updateButton = document.createElement("button");
    updateButton.type = "button";
    updateButton.textContent = "Update";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "ghost";
    deleteButton.textContent = "Delete";

    updateButton.addEventListener("click", async () => {
      try {
        await request(apiPath(`/journal/id/${entry.id}`), {
          method: "PUT",
          body: JSON.stringify({
            title: titleInput.value,
            content: contentInput.value,
          }),
        });
        setStatus(entryStatus, "Entry updated.", "success");
        await loadEntries();
      } catch (error) {
        setStatus(entryStatus, error.message, "error");
      }
    });

    deleteButton.addEventListener("click", async () => {
      try {
        await request(apiPath(`/journal/id/${entry.id}`), {
          method: "DELETE",
        });
        setStatus(entryStatus, "Entry deleted.", "success");
        await loadEntries();
      } catch (error) {
        setStatus(entryStatus, error.message, "error");
      }
    });

    actions.append(updateButton, deleteButton);
    wrapper.append(titleInput, contentInput, metadata, actions);
    entriesContainer.append(wrapper);
  });
};

const renderUsers = (users = []) => {
  if (!users.length) {
    adminUsersContainer.innerHTML = '<p class="muted">No users found.</p>';
    return;
  }

  adminUsersContainer.innerHTML = "";
  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "entry";

    const name = document.createElement("h3");
    name.textContent = user.userName || "unknown";

    const meta = document.createElement("div");
    meta.className = "entry-meta";
    const userId = document.createElement("span");
    userId.textContent = `ID: ${user.id || "unknown"}`;
    const role = document.createElement("span");
    role.textContent = `Roles: ${(user.roles || []).join(", ") || "user"}`;
    meta.append(userId, role);

    card.append(name, meta);
    adminUsersContainer.append(card);
  });
};

const loadEntries = async () => {
  try {
    const entries = await request(apiPath("/journal"));
    renderEntries(entries);
    setStatus(entryStatus, "Entries loaded.", "success");
  } catch (error) {
    renderEntries([]);
    setStatus(entryStatus, error.message, "error");
  }
};

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = signupForm.elements["signup-username"].value.trim();
  const password = signupForm.elements["signup-password"].value.trim();

  if (!username || !password) {
    setStatus(signupStatus, "Provide both username and password.", "error");
    return;
  }

  try {
    await request(apiPath("/public/create-user"), {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        userName: username,
        password,
      }),
    });
    setStatus(signupStatus, "User created. Save credentials below.", "success");
  } catch (error) {
    setStatus(signupStatus, error.message, "error");
  }
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = authForm.elements["auth-username"].value.trim();
  const password = authForm.elements["auth-password"].value.trim();
  if (!username || !password) {
    setStatus(authStatus, "Provide both username and password.", "error");
    return;
  }

  saveAuth({ username, password });
  setStatus(authStatus, "Credentials saved.", "success");
  if (activeUserLabel) {
    activeUserLabel.textContent = username;
  }
  loadEntries();
});

clearAuthButton.addEventListener("click", () => {
  saveAuth({ username: "", password: "" });
  authForm.reset();
  setStatus(authStatus, "Credentials cleared.", "success");
  if (activeUserLabel) {
    activeUserLabel.textContent = "none";
  }
  renderEntries([]);
});

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = entryForm.elements["entry-title"].value.trim();
  const content = entryForm.elements["entry-content"].value.trim();

  if (!title || !content) {
    setStatus(entryStatus, "Title and content are required.", "error");
    return;
  }

  try {
    await request(apiPath("/journal"), {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
    setStatus(entryStatus, "Entry created.", "success");
    entryForm.reset();
    await loadEntries();
  } catch (error) {
    setStatus(entryStatus, error.message, "error");
  }
});

profileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = profileForm.elements["profile-username"].value.trim();
  const password = profileForm.elements["profile-password"].value.trim();

  if (!username && !password) {
    setStatus(profileStatus, "Provide a username or password.", "error");
    return;
  }

  try {
    await request(apiPath("/user"), {
      method: "PUT",
      body: JSON.stringify({
        userName: username || undefined,
        password: password || undefined,
      }),
    });
    setStatus(profileStatus, "Profile updated.", "success");
    if (username && activeUserLabel) {
      activeUserLabel.textContent = username;
    }
    profileForm.reset();
  } catch (error) {
    setStatus(profileStatus, error.message, "error");
  }
});

deleteAccountButton.addEventListener("click", async () => {
  if (!confirm("Delete your account and all journal entries?")) {
    return;
  }
  try {
    await request(apiPath("/user"), {
      method: "DELETE",
    });
    setStatus(profileStatus, "Account deleted.", "success");
    saveAuth({ username: "", password: "" });
    authForm.reset();
    renderEntries([]);
    if (activeUserLabel) {
      activeUserLabel.textContent = "none";
    }
  } catch (error) {
    setStatus(profileStatus, error.message, "error");
  }
});

adminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = adminForm.elements["admin-username"].value.trim();
  const password = adminForm.elements["admin-password"].value.trim();

  if (!username || !password) {
    setStatus(adminStatus, "Provide admin username and password.", "error");
    return;
  }

  try {
    await request(apiPath("/admin/create-admin-user"), {
      method: "POST",
      body: JSON.stringify({
        userName: username,
        password,
      }),
    });
    setStatus(adminStatus, "Admin user created.", "success");
    adminForm.reset();
  } catch (error) {
    setStatus(adminStatus, error.message, "error");
  }
});

loadUsersButton.addEventListener("click", async () => {
  try {
    const users = await request(apiPath("/admin/all-users"));
    renderUsers(users);
    setStatus(adminStatus, "Admin data loaded.", "success");
  } catch (error) {
    renderUsers([]);
    setStatus(adminStatus, error.message, "error");
  }
});

refreshEntriesButton.addEventListener("click", loadEntries);

const init = () => {
  const auth = loadAuth();
  if (basePathLabel) {
    basePathLabel.textContent = basePath || "/";
  }
  if (activeUserLabel) {
    activeUserLabel.textContent = auth.username || "none";
  }
  if (auth.username) {
    authForm.elements["auth-username"].value = auth.username;
    authForm.elements["auth-password"].value = auth.password;
    loadEntries();
  }
};

init();
