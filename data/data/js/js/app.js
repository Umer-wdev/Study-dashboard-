import { loadDashboardData } from "./api.js";

import {
    showLoading,
    showError,
    renderTip,
    renderCategories,
    renderStats,
    renderTopics
} from "./ui.js";


const STORAGE_KEY = "studyDashboardData";


const state = {
    topics: [],
    tip: "",
    search: "",
    category: "all",
    sort: "newest"
};


const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const taskForm = document.getElementById("task-form");
const topicsContainer = document.getElementById("topics-container");


function loadSavedData() {
    try {
        const savedData = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (!savedData) {
            return {
                completedIds: [],
                customTopics: []
            };
        }

        return {
            completedIds: savedData.completedIds || [],
            customTopics: savedData.customTopics || []
        };

    } catch (error) {
        console.error("Could not read saved data:", error);

        return {
            completedIds: [],
            customTopics: []
        };
    }
}


function applySavedData(topics) {
    const savedData = loadSavedData();

    const completedIds = savedData.completedIds.map(
        (id) => String(id)
    );

    const savedTopics = topics.map((topic) => ({
        ...topic,
        completed: completedIds.includes(String(topic.id))
            ? true
            : topic.completed
    }));

    return [
        ...savedTopics,
        ...savedData.customTopics
    ];
}


function saveData() {
    const completedIds = state.topics
        .filter((topic) => topic.completed)
        .map((topic) => topic.id);

    const customTopics = state.topics.filter(
        (topic) => topic.custom === true
    );

    const dataToSave = {
        completedIds,
        customTopics
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dataToSave)
    );
}


function getCategories() {
    return [
        ...new Set(
            state.topics.map((topic) => topic.category)
        )
    ].sort();
}


function getVisibleTopics() {
    const searchText = state.search.toLowerCase().trim();

    const visibleTopics = state.topics.filter((topic) => {
        const matchesSearch =
            topic.title.toLowerCase().includes(searchText) ||
            topic.description.toLowerCase().includes(searchText);

        const matchesCategory =
            state.category === "all" ||
            topic.category === state.category;

        return matchesSearch && matchesCategory;
    });


    const sortedTopics = [...visibleTopics];


    if (state.sort === "easiest") {
        sortedTopics.sort(
            (a, b) => Number(a.difficulty) - Number(b.difficulty)
        );
    }


    if (state.sort === "hardest") {
        sortedTopics.sort(
            (a, b) => Number(b.difficulty) - Number(a.difficulty)
        );
    }


    if (state.sort === "shortest") {
        sortedTopics.sort(
            (a, b) => Number(a.duration) - Number(b.duration)
        );
    }


    if (state.sort === "longest") {
        sortedTopics.sort(
            (a, b) => Number(b.duration) - Number(a.duration)
        );
    }


    if (state.sort === "newest") {
        sortedTopics.sort(
            (a, b) => Number(b.id) - Number(a.id)
        );
    }


    return sortedTopics;
}


function calculateStats(topics) {
    const total = topics.length;

    const completed = topics.filter(
        (topic) => topic.completed
    ).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const totalDifficulty = topics.reduce(
        (sum, topic) => sum + Number(topic.difficulty),
        0
    );

    const averageDifficulty = total === 0
        ? "0.0"
        : (totalDifficulty / total).toFixed(1);

    return {
        total,
        completed,
        percentage,
        averageDifficulty
    };
}


function renderDashboard() {
    const visibleTopics = getVisibleTopics();

    const stats = calculateStats(visibleTopics);

    renderStats(stats);
    renderTopics(visibleTopics);
}


function handleSearch(event) {
    state.search = event.target.value;

    renderDashboard();
}


function handleCategoryChange(event) {
    state.category = event.target.value;

    renderDashboard();
}


function handleSortChange(event) {
    state.sort = event.target.value;

    renderDashboard();
}


function handleTopicClick(event) {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const topicId = button.dataset.id;


    const topic = state.topics.find(
        (item) => String(item.id) === String(topicId)
    );


    if (!topic) {
        return;
    }


    if (action === "toggle") {
        topic.completed = !topic.completed;

        saveData();
        renderDashboard();
    }


    if (action === "delete") {
        if (!topic.custom) {
            return;
        }

        state.topics = state.topics.filter(
            (item) => String(item.id) !== String(topicId)
        );

        saveData();
        renderDashboard();
    }
}


function handleAddTask(event) {
    event.preventDefault();


    const title = document.getElementById("task-title").value.trim();
    const category = document.getElementById("task-category").value;
    const duration = Number(
        document.getElementById("task-duration").value
    );
    const difficulty = Number(
        document.getElementById("task-difficulty").value
    );
    const description = document
        .getElementById("task-description")
        .value
        .trim();


    if (
        !title ||
        !category ||
        !duration ||
        !difficulty ||
        !description
    ) {
        return;
    }


    const newTopic = {
        id: Date.now(),
        title,
        category,
        difficulty,
        duration,
        completed: false,
        description,
        custom: true
    };


    state.topics.push(newTopic);


    saveData();


    taskForm.reset();


    renderCategories(
        getCategories(),
        state.category
    );

    renderDashboard();
}


async function initializeDashboard() {
    showLoading();

    try {
        const data = await loadDashboardData();

        state.topics = applySavedData(data.topics);
        state.tip = data.tip.tip;

        renderTip(state.tip);

        renderCategories(
            getCategories(),
            state.category
        );

        renderDashboard();

    } catch (error) {
        console.error(error);

        showError(
            error.message ||
            "Please check your data files and try again."
        );
    }
}


searchInput.addEventListener(
    "input",
    handleSearch
);


categoryFilter.addEventListener(
    "change",
    handleCategoryChange
);


sortSelect.addEventListener(
    "change",
    handleSortChange
);


taskForm.addEventListener(
    "submit",
    handleAddTask
);


topicsContainer.addEventListener(
    "click",
    handleTopicClick
);


document.addEventListener("click", (event) => {
    if (event.target.id === "retry-button") {
        initializeDashboard();
    }
});


initializeDashboard();
