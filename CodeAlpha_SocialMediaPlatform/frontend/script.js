const API = "http://localhost:5000/api";
let userId = null;
let token = null; // ✅ store JWT
const socket = io("http://localhost:5000");

async function register() {
  await fetch(`${API}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  });
  alert("Registered!");
}

async function login() {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value
    })
  });
  const data = await res.json();
  userId = data.user._id;
  token = data.token; // ✅ store JWT
  alert("Logged in!");
  socket.emit('join', userId);
  loadPosts();
}

async function createPost() {
  await fetch(`${API}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // ✅ send token
    },
    body: JSON.stringify({ userId, content: document.getElementById("postContent").value })
  });
  document.getElementById("postContent").value = "";
  loadPosts();
}

async function loadPosts() {
  const res = await fetch(`${API}/posts`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const posts = await res.json();

  document.getElementById("postList").innerHTML = posts.map(p => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
      <b>${p.user.username}</b>: ${p.content}
      <br>
      <button onclick="likePost('${p._id}')">Like (${p.likes.length})</button>
      <div>
        <input id="comment-${p._id}" placeholder="Add comment">
        <button onclick="commentPost('${p._id}')">Comment</button>
      </div>
      <div>
        ${p.comments.map(c => `<p><b>${c.user.username}</b>: ${c.text}</p>`).join("")}
      </div>
      <div>
        <button onclick="follow('${p.user._id}')">Follow</button>
        <button onclick="unfollow('${p.user._id}')">Unfollow</button>
      </div>
    </div>
  `).join("");
}

async function likePost(id) {
  await fetch(`${API}/posts/${id}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });
  loadPosts();
}

async function commentPost(id) {
  const text = document.getElementById(`comment-${id}`).value;
  await fetch(`${API}/posts/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ userId, text })
  });
  document.getElementById(`comment-${id}`).value = "";
  loadPosts();
}

async function follow(targetId) {
  await fetch(`${API}/users/follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ userId, targetId })
  });
  alert("Followed!");
}

async function unfollow(targetId) {
  await fetch(`${API}/users/unfollow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ userId, targetId })
  });
  alert("Unfollowed!");
}

async function loadProfile() {
  const res = await fetch(`${API}/users/${userId}/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();

  document.getElementById("profileData").innerHTML = `
    <h3>${data.user.username} (${data.user.email})</h3>
    <p><b>Followers:</b> ${data.user.followers.map(f => f.username).join(", ")}</p>
    <p><b>Following:</b> ${data.user.following.map(f => f.username).join(", ")}</p>
    <h4>My Posts:</h4>
    ${data.posts.map(p => `
      <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
        ${p.content}
        <br>
        <small>Comments: ${p.comments.map(c => `<b>${c.user.username}</b>: ${c.text}`).join(", ")}</small>
      </div>
    `).join("")}
  `;
}

async function loadFeed() {
  const res = await fetch(`${API}/posts/feed/${userId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const posts = await res.json();

  document.getElementById("feedData").innerHTML = posts.map(p => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
      <b>${p.user.username}</b>: ${p.content}
      <br>
      <button onclick="likePost('${p._id}')">Like (${p.likes.length})</button>
      <div>
        <input id="feed-comment-${p._id}" placeholder="Add comment">
        <button onclick="commentPost('${p._id}')">Comment</button>
      </div>
      <div>
        ${p.comments.map(c => `<p><b>${c.user.username}</b>: ${c.text}</p>`).join("")}
      </div>
    </div>
  `).join("");
}

function logout() {
  userId = null;
  token = null;
  alert("Logged out!");
  document.getElementById("postList").innerHTML = "";
  document.getElementById("profileData").innerHTML = "";
  document.getElementById("feedData").innerHTML = "";
  document.getElementById("notificationData").innerHTML = "";
  document.getElementById("chatBox").innerHTML = "";
}

async function loadNotifications() {
  const res = await fetch(`${API}/notifications/${userId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const notifications = await res.json();

  document.getElementById("notificationData").innerHTML = notifications.map(n => `
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0; background:#eef6ff; border-left:4px solid #007bff;">
      <b>${n.sender.username}</b> ${n.type}d your post
    </div>
  `).join("");
}

// ✅ Real-time notifications via Socket.IO
socket.on('notification', (data) => {
  const note = `
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0; background:#ffe;">
      <b>${data.sender}</b> ${data.type}d your post
    </div>
  `;
  document.getElementById("notificationData").innerHTML = note + document.getElementById("notificationData").innerHTML;
});

// ✅ Real-time feed updates
socket.on('newPost', (data) => {
  const postHTML = `
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0; background:#f0fff0;">
      <b>${data.user}</b>: ${data.content}
      <br>
      <button onclick="likePost('${data.postId}')">Like (0)</button>
      <div>
        <input id="feed-comment-${data.postId}" placeholder="Add comment">
        <button onclick="commentPost('${data.postId}')">Comment</button>
      </div>
    </div>
  `;
  document.getElementById("feedData").innerHTML = postHTML + document.getElementById("feedData").innerHTML;
});

// ✅ Real-time chat messages
socket.on('chatMessage', (data) => {
  const msgHTML = `
    <div style="border:1px solid #ccc; padding:8px; margin:5px 0; background:#fffbe6;">
      <b>${data.sender}</b>: ${data.message}
      <br><small>${new Date(data.createdAt).toLocaleTimeString()}</small>
    </div>
  `;
  document.getElementById("chatBox").innerHTML += msgHTML;

  // Auto-scroll to bottom
  const chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
});

// ✅ Send chat message
async function sendChatMessage() {
  const recipient = document.getElementById("chatRecipient").value;
  const message = document.getElementById("chatMessage").value;

  await fetch(`${API}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // ✅ send token with chat requests
    },
    body: JSON.stringify({ sender: userId, recipient, message })
  });

  document.getElementById("chatMessage").value = "";
}

// ✅ Load chat history
async function loadChatHistory(contactId) {
  const res = await fetch(`${API}/chat/${userId}/${contactId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const messages = await res.json();

  document.getElementById("chatBox").innerHTML = messages.map(m => `
    <div style="border:1px solid #ccc; padding:8px; margin:5px 0; background:#fff;">
      <b>${m.sender.username}</b>: ${m.message}
      <br><small>${new Date(m.createdAt).toLocaleTimeString()}</small>
    </div>
  `).join("");

  // Auto-scroll to bottom
  const chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
}
