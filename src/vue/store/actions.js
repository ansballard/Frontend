// import fetch from "unfetch";

const API_URL = process.env.MODWATCH_API_URL;

export function getModlists({ commit }) {
  return get(`${API_URL}/api/users/list/25`)
  .then(users => {
    commit("modlists", users);
    return users;
  });
}

export function getModlist({ commit }, username) {
  return get(`${API_URL}/api/user/${username}/all`)
  .then(modlist => {
    commit("modlist", modlist);
    return modlist;
  });
}

export function getModlistFileType({ commit }, {username, filetype}) {
  return get(`${API_URL}/api/user/${username}/file/${filetype}`)
  .then(file => {
    commit("filetype", {
      type: filetype,
      value: file
    });
    return file;
  });
}

export function getBlogPost({ commit }, postid) {
  return get(`${API_URL}/api/blog/post/${postid}`)
  .then(currentpost => {
    commit("currentblogpost", currentpost);
    return currentpost;
  });
}

export function getBlogPosts({ commit }, limit) {
  return get(`${API_URL}/api/blog/posts${limit ? `/${limit}` : ""}`)
  .then(posts => {
    commit("blogposts", posts);
    return posts;
  });
}

export function login({ commit, dispatch }, {username, password}) {
  return post(`${API_URL}/oauth/login`, {
    body: { username, password }
  })
  .then(res => {
    return dispatch("notification", { notification: "Logged In" })
    .then(() => res);
  });
}

export function logout({ commit, dispatch }) {
  commit("logout");
  return dispatch("notification", { notification: "Logged Out" });
}

export function verify({ state }, { access_token } = {}) {
  return fetch(`${API_URL}/oauth/verify?t=${new Date().getTime()}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token || state.user.token}`
    }
  }).then(res => res.status === 200);
}

export function deleteModlist({ state, dispatch }, { username }) {
  if(state.user.scopes.indexOf("admin") === -1 && username !== state.user.username) {
    return Promise.reject(`${state.user.scopes.join(",")} does not include admin, and ${username} does not equal ${state.user.username}`);
  }
  return fetch(`${API_URL}/oauth/user/${username}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${state.user.token}`
    }
  })
  .then(res => res.status === 200)
  .then(valid => (
    dispatch("notification", { notification: valid ? `Deleted ${username}` : `Couldn't Delete ${username}` }))
    .then(() => valid)
  )
}

export function notification({ commit }, { notification, delay = 3000 }) {
  commit("pushNotification", notification);
  setTimeout(() => {
    commit("popNotification");
  }, delay);
}

function get(url) {
  return fetch(url, {
    method: "GET"
  })
  .then(res => res.json());
}

function post(url, { body, token }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? {
      "Authorization": `Bearer ${token}`
    } : undefined
  })
  .then(res => res.json());
}
