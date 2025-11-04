document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Clear select options except placeholder
      Array.from(activitySelect.options)
        .slice(1)
        .forEach((opt) => opt.remove());

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - (details.participants?.length || 0);

        // Build participants HTML
        const participants = details.participants || [];
        let participantsHTML = "";
        if (participants.length === 0) {
          participantsHTML = `<div class="participants-section"><h5>Participants</h5><div class="participants-list"><em>No participants yet</em></div></div>`;
        } else {
          const items = participants
                .map((p) => {
                  const label = String(p);
                  const initial = label.trim().charAt(0).toUpperCase() || "?";
                  // Add a small delete button next to each participant. Use data attributes for activity and email.
                  return `<li class="participant-item"><span class="participant-badge">${initial}</span><span class="participant-name">${label}</span><button class="participant-delete" data-activity="${name}" data-email="${label}" aria-label="Remove participant">🗑️</button></li>`;
                })
            .join("");
          participantsHTML = `<div class="participants-section"><h5>Participants</h5><div class="participants-list"><ul>${items}</ul></div></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the newly signed-up participant appears immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Delegate click listener for participant delete buttons
  activitiesList.addEventListener("click", async (event) => {
    const btn = event.target.closest(".participant-delete");
    if (!btn) return;

    const activityName = btn.dataset.activity;
    const email = btn.dataset.email;
    if (!activityName || !email) return;

    // Send DELETE request to unregister participant
    try {
      const resp = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await resp.json().catch(() => ({}));

      if (resp.ok) {
        // Refresh activities list to reflect change
        fetchActivities();
        messageDiv.textContent = result.message || `Removed ${email} from ${activityName}`;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        setTimeout(() => messageDiv.classList.add("hidden"), 4000);
      } else {
        messageDiv.textContent = result.detail || `Failed to remove ${email}`;
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Error removing participant:", err);
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
    }
  });

  // Initialize app
  fetchActivities();
});
