import { auth } from "./firebase.js";

async function fetchUserHistory() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to view history");
    window.location.href = "index.html";
    return;
  }

  try {
    const token = await user.getIdToken();

    const res = await fetch("https://cricketcraze-backend-1.onrender.com/api/progress", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch history");
    }

    renderHistory(data.data);

  } catch (err) {
    console.error("Error fetching history:", err);
    alert("Failed to load history. Check console.");
  }
}

function renderHistory(records) {
  const tbody = document.getElementById("history-body");
  tbody.innerHTML = "";

  if (records.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" class="empty-state">No quiz history found. Start playing to see your scores here!</td>`;
    tbody.appendChild(tr);
    return;
  }

  records.forEach((item, index) => {
    const tr = document.createElement("tr");

    const date = new Date(item.timestamp).toLocaleString();
    const level = item.level.toLowerCase();

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td data-level="${level}">${item.level}</td>
      <td>${item.score}</td>
      <td>${date}</td>
    `;

    tbody.appendChild(tr);
  });
}

window.goHome = () => {
  window.location.href = "index.html";
};

// Wait until Firebase auth is ready
auth.onAuthStateChanged(user => {
  if (user) {
    fetchUserHistory();
  } else {
    alert("Not logged in");
    window.location.href = "index.html";
  }
});
