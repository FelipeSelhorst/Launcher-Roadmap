const statusConfig = {
    considering: {
        container: "considering-cards",
        label: "Considering",
        icon: "💭"
    },
    planned: {
        container: "planned-cards",
        label: "Planned",
        icon: "⚙️"
    },
    progress: {
        container: "progress-cards",
        label: "Progress",
        icon: "🔨"
    },
    completed: {
        container: "completed-cards",
        label: "Completed",
        icon: "✅"
    },
    dropped: {
        container: "dropped-cards",
        label: "Dropped",
        icon: "❌"
    }
};

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

function  createStatus(task) {
    const status = createElement(
        "div",
        `${task.status}-status`
    );

    switch (task.status) {
        case "considering":
            status.textContent =
                task.statusLabel || "Under Evaluation";
            break;
    
        case "planned":
            if (task.quarter) {
                status.append(
                    createElement(
                        "div",
                        "date-planned",
                        task.quarter
                    )
                );
            }

            if (task.statusLabel) {
                status.append(
                    createElement(
                        "div",
                        "real-status",
                        task.statusLabel
                    )
                );
            }

            if (task.difficulty) {
                status.append(
                    createElement(
                        "div",
                        "difficulty",
                        task.difficulty
                    )
                );
            }
            break;

        case "progress": {
            const bar = createElement("div", "progress-bar");
            const fill = createElement("div", "progress-fill");
            const percentage = Math.max(
                0,
                Math.min(100, Number(task.progress) || 0)
            );

            fill.style.width = `${percentage}%`;
            fill.setAttribute("aria-hidden", "true");

            bar.setAttribute("role", "progressbar");
            bar.setAttribute("aria-label", `${task.title} progress`);
            bar.setAttribute("aria-valuemin", "0");
            bar.setAttribute("aria-valuemax", "100");
            bar.setAttribute("aria-valuenow", String(percentage));

            bar.append(fill);
            
            status.append(
                bar,
                createElement(
                    "span",
                    "progress-percentage",
                    `${percentage}%`
                )
            );
            break;
        }

        case "completed":
            if (task.version) {
                status.append(
                    createElement(
                        "div",
                        "shipped-version",
                        `SHIPPED • ${task.version}`
                    )
                );
            }

            if (task.shippedDate) {
                status.append(
                    createElement(
                        "div",
                        "shipped-date",
                        task.shippedDate
                    )
                );
            }
            break;

        case "dropped":
            if (task.reason) {
                status.append(
                    createElement(
                        "div",
                        "dropped-reason",
                        task.reason
                    )
                );
            }
   
            if (task.date) {
                status.append(
                    createElement(
                        "div",
                        "dropped-date",
                        task.date
                    )
                );
            }
            break;
    }

    return status;
}

function createCard(task) {
    const config = statusConfig[task.status];

    const card = createElement(
        "article",
        "card"
    );
    card.dataset.id = task.id;

    const content = createElement(
        "div",
        "card-content"
    );

    const category = createElement(
        "div",
        "category"
    );
    category.append(
        createElement(
            "span",
            "",
            `[${config.icon}]`
        ),
        document.createTextNode(
            ` ${config.label}`
        )
    );

    const title = createElement(
        "h2",
        "",
        task.title
    );
    const description = createElement(
        "p",
        "",
        task.description
    );

    const footer = createElement(
        "div",
        "roadmap-footer"
    );
    footer.append(
        createElement(
            "span",
            "",
            task.releaseType || "Alpha Feature"
        )
    );

    const details = createElement(
        "button",
        "details",
        "View Details →"
    );
    
    details.type = "button";
    details.addEventListener("click", () => {
        openDetailsModal(task);
    });

    footer.append(details);

    content.append(category, title, description);
    content.append(createStatus(task), footer);
    card.append(content);

    return card;
}

const modal = document.getElementById("details-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalCategory = document.getElementById("modal-category");
const modalExtra = document.getElementById("modal-extra");
const modalReleaseType = document.getElementById("modal-release-type");

const closeModalButton = document.getElementById("close-modal-btn");
const doneModalButton = document.getElementById("modal-done-btn");

function openDetailsModal(task) {
    
    const config = statusConfig[task.status];

    if (!modal || !config) return;

    modalTitle.textContent = task.title;
    modalDescription.textContent = task.details?.overview || task.description;

    modalCategory.textContent = `${config.icon} ${config.label}`;

    modalReleaseType.textContent = task.releaseType || "Alpha Feature";

    modalExtra.replaceChildren();

    const details = task.details || {};

    if (details.features?.length) {
        const heading = createElement(
            "h3",
            "",
            "Key Features"
        );
        const list = createElement(
            "ul",
            "modal-extra-item"
        );

        details.features.forEach(feature => {
            const item = createElement("li", "", feature);
            list.append(item);
        });

        modalExtra.append(heading, list);
    }

    if (details.updates?.length) {
        const heading = createElement(
            "h3",
            "",
            "Updates"
        );

        const list = createElement(
            "ul",
            "modal-extra-item"
        );

        details.updates.forEach(updates => {
            const item = createElement(
                "li",
                "",
                updates
            );

            list.append(item);
        });

        modalExtra.append(heading, list);
    }

    // Optional development notes
    if (details.notes) {
        const heading = createElement("h3", "", "Additional Notes");
        const notes = createElement(
            "p",
            "modal-extra-item",
            details.notes
        );

        modalExtra.append(heading, notes);
    }

    // Status-specific information
    const statusItems = [];

    if (task.quarter) {
        statusItems.push(["Target Release", task.quarter]);
    }

    if (task.difficulty) {
        statusItems.push(["Difficulty", task.difficulty]);
    }

    if (task.progress !== undefined) {
        statusItems.push(["Progress", `${task.progress}%`]);
    }

    if (task.version) {
        statusItems.push(["Shipped Version", task.version]);
    }

    if (task.shippedDate) {
        statusItems.push(["Shipped Date", task.shippedDate]);
    }

    if (task.reason) {
        statusItems.push(["Reason Dropped", task.reason]);
    }

    if (task.date) {
        statusItems.push(["Date Dropped", task.date]);
    }

    if (task.statusLabel) {
        statusItems.push(["Development Status", task.statusLabel]);
    }

    if (statusItems.length) {
        const heading = createElement("h3", "", "Feature Details");

        const list = createElement("div", "modal-extra-item");

        statusItems.forEach(([label, value]) => {
            const row = createElement("p", "modal-extra-item");
            const strong = createElement("strong", "", `${label}: `);
            const text = document.createTextNode(value);

            row.append(strong, text);
            list.append(row);
        });

        modalExtra.append(heading, list);
    }

        // Show the popup
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeModalButton.focus();
}

function closeDetailsModal() {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

// Close button
closeModalButton?.addEventListener("click", closeDetailsModal);
doneModalButton?.addEventListener("click", closeDetailsModal);

// Close when clicking the backdrop
modal?.querySelector("[data-close-modal]")
    ?.addEventListener("click", event => {
        if (event.target === event.currentTarget) {
            closeDetailsModal();
        }
    });

// Close with Escape
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal?.classList.contains("open")) {
        closeDetailsModal();
    }
});

async function loadRoadmap() {
    try {
        const response = await fetch("./roadmap.json");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const tasks = await response.json();

        Object.values(statusConfig).forEach(config => {
            const container = document.getElementById(config.container);

            if (container) {
                container.replaceChildren();
            }
        });
        tasks
        
            .sort((a, b) => {
                if (a.status !== "progress" || b.status !== "progress") {
                    return 0;
                }

                return b.progress - a.progress;
            })

            .forEach(task => {
                const config = statusConfig[task.status];
                const container = config
                    ? document.getElementById(config.container)
                    : null;

                if (!container) {
                    console.warn(
                        `Unknown status or missing container for: ${task.title}`
                    );
                    return;
                }

                container.append(createCard(task));
            })
        
    } catch (error) {
        console.error("Failed to load roadmap:", error);
    }
}

const banner = document.getElementById("hiatus-banner");
const closeButton = document.getElementById("close-banner-btn");

if (banner && closeButton) {
    closeButton.addEventListener("click", () => {
        banner.classList.add("hidden");
    });
}

loadRoadmap();