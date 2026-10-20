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
        "a",
        "details",
        "View Details →"
    );
    details.href = task.detailsUrl || "#";

    if (task.detailsUrl) {
        details.target = "_blank";
        details.rel = "noopener noreferrer";
    }

    footer.append(details);

    content.append(category, title, description);
    content.append(createStatus(task), footer);
    card.append(content);

    return card;
}

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

        tasks.forEach(task => {
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
        });
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