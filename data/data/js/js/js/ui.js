const topicsContainer = document.getElementById("topics-container");
const statsContainer = document.getElementById("stats-container");
const tipText = document.getElementById("tip-text");
const categoryFilter = document.getElementById("category-filter");


export function showLoading() {
    topicsContainer.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl p-10 text-center shadow-sm">
            <div class="text-4xl mb-3">
                ⏳
            </div>

            <p class="text-lg font-medium text-slate-700">
                Loading your study plan...
            </p>
        </div>
    `;
}


export function showError(message) {
    topicsContainer.innerHTML = `
        <div class="col-span-full bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
            <div class="text-4xl mb-3">
                ⚠️
            </div>

            <h2 class="text-xl font-bold text-red-800 mb-2">
                Could not load your study plan.
            </h2>

            <p class="text-red-700 mb-5">
                ${message}
            </p>

            <button
                id="retry-button"
                type="button"
                class="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-lg"
            >
                Try Again
            </button>
        </div>
    `;
}


export function showEmpty() {
    topicsContainer.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl p-10 text-center shadow-sm">
            <div class="text-4xl mb-3">
                🔎
            </div>

            <h2 class="text-xl font-bold text-slate-800">
                No topics found.
            </h2>

            <p class="text-slate-500 mt-2">
                Try another search or category.
            </p>
        </div>
    `;
}


export function renderTip(tip) {
    tipText.textContent = tip;
}


export function renderCategories(categories, selectedCategory) {
    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;

    for (const category of categories) {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    }

    categoryFilter.value = selectedCategory;
}


export function renderStats(stats) {
    statsContainer.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm p-5">
            <p class="text-sm text-slate-500">
                Total Topics
            </p>

            <p class="text-3xl font-bold text-slate-900 mt-2">
                ${stats.total}
            </p>
        </div>


        <div class="bg-white rounded-2xl shadow-sm p-5">
            <p class="text-sm text-slate-500">
                Completed
            </p>

            <p class="text-3xl font-bold text-green-600 mt-2">
                ${stats.completed}
            </p>
        </div>


        <div class="bg-white rounded-2xl shadow-sm p-5">
            <p class="text-sm text-slate-500">
                Completion
            </p>

            <p class="text-3xl font-bold text-blue-600 mt-2">
                ${stats.percentage}%
            </p>
        </div>


        <div class="bg-white rounded-2xl shadow-sm p-5">
            <p class="text-sm text-slate-500">
                Avg Difficulty
            </p>

            <p class="text-3xl font-bold text-purple-600 mt-2">
                ${stats.averageDifficulty}
            </p>
        </div>
    `;
}


function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


export function renderTopics(topics) {
    if (topics.length === 0) {
        showEmpty();
        return;
    }

    topicsContainer.innerHTML = topics.map((topic) => {
        const difficulty = Number(topic.difficulty);

        const difficultyLabel =
            difficulty === 1 ? "Very Easy" :
            difficulty === 2 ? "Easy" :
            difficulty === 3 ? "Medium" :
            difficulty === 4 ? "Hard" :
            "Very Hard";


        const completeButtonText = topic.completed
            ? "↩ Mark as Incomplete"
            : "✓ Mark Complete";


        const completeButtonClass = topic.completed
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-blue-600 text-white hover:bg-blue-700";


        const deleteButton = topic.custom
            ? `
                <button
                    type="button"
                    data-action="delete"
                    data-id="${topic.id}"
                    class="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                >
                    Delete
                </button>
            `
            : "";


        return `
            <article
                class="bg-white rounded-2xl shadow-sm p-5 border border-slate-100"
            >

                <div class="flex items-start justify-between gap-3">

                    <div>
                        <span class="inline-block text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                            ${escapeHTML(topic.category)}
                        </span>

                        <h3 class="text-xl font-bold text-slate-900 mt-3">
                            ${escapeHTML(topic.title)}
                        </h3>
                    </div>


                    ${
                        topic.completed
                            ? `<span class="text-green-600 text-xl">✓</span>`
                            : ""
                    }

                </div>


                <p class="text-slate-600 mt-3 leading-relaxed">
                    ${escapeHTML(topic.description)}
                </p>


                <div class="grid grid-cols-2 gap-3 mt-5">

                    <div class="bg-slate-50 rounded-lg p-3">

                        <p class="text-xs text-slate-500">
                            Difficulty
                        </p>

                        <p class="font-semibold text-slate-800 mt-1">
                            ${difficultyLabel} (${difficulty}/5)
                        </p>

                    </div>


                    <div class="bg-slate-50 rounded-lg p-3">

                        <p class="text-xs text-slate-500">
                            Duration
                        </p>

                        <p class="font-semibold text-slate-800 mt-1">
                            ${Number(topic.duration)} min
                        </p>

                    </div>

                </div>


                <div class="flex flex-wrap gap-2 mt-5">

                    <button
                        type="button"
                        data-action="toggle"
                        data-id="${topic.id}"
                        class="px-4 py-2 rounded-lg ${completeButtonClass} font-semibold"
                    >
                        ${completeButtonText}
                    </button>


                    ${deleteButton}

                </div>

            </article>
        `;
    }).join("");
}
