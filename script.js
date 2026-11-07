document.addEventListener("DOMContentLoaded", function () {
    const CATEGORY_MAP = {
        transport: { label: "Transport", icon: "🚗" },
        food: { label: "Food", icon: "🍔" },
        grocery: { label: "Grocery", icon: "🛒" },
        household: { label: "Household", icon: "🏠" },
        personal: { label: "Personal", icon: "👤" },
        school: { label: "School", icon: "📚" },
        health: { label: "Health", icon: "🏥" },
        shopping: { label: "Shopping", icon: "🛍️" },
        entertainment: { label: "Entertainment", icon: "🎮" },
        others: { label: "Others", icon: "📌" }
    };

    function getExpenses() {
        try {
            const stored = JSON.parse(localStorage.getItem("expenses"));
            return Array.isArray(stored) ? stored : [];
        } catch (error) {
            return [];
        }
    }

    function saveExpenses(expenses) {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    function categoryInfo(category) {
        return CATEGORY_MAP[category] || CATEGORY_MAP.others;
    }

    function money(value) {
        return "₹" + Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    }

    function createAnalysisView(title, records, includeTabName) {
        const wrapper = document.createElement("main");
        wrapper.className = "analysis-page";

        const heading = document.createElement("div");
        heading.className = "analysis-heading";

        const titleElement = document.createElement("h2");
        titleElement.textContent = title;

        const subtitle = document.createElement("p");
        subtitle.textContent = "Your expenses grouped by category, from highest to lowest.";

        heading.append(titleElement, subtitle);
        wrapper.appendChild(heading);

        const grouped = {};
        Object.keys(CATEGORY_MAP).forEach(key => grouped[key] = []);

        records.forEach(record => {
            const key = CATEGORY_MAP[record.category] ? record.category : "others";
            grouped[key].push(record);
        });

        const totals = Object.keys(CATEGORY_MAP).map(key => ({
            key,
            total: grouped[key].reduce((sum, item) => sum + Number(item.amount || 0), 0),
            items: grouped[key]
        })).filter(group => group.items.length > 0)
          .sort((a, b) => b.total - a.total);

        if (totals.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-entries analysis-empty";
            empty.textContent = "No expense entries have been added yet.";
            wrapper.appendChild(empty);
            return wrapper;
        }

        totals.forEach(group => {
            const info = categoryInfo(group.key);
            const details = document.createElement("details");
            details.className = "category-analysis-item";

            const summary = document.createElement("summary");
            const categoryName = document.createElement("span");
            categoryName.className = "analysis-category-name";
            categoryName.textContent = info.icon + " " + info.label;

            const total = document.createElement("strong");
            total.className = "analysis-category-total";
            total.textContent = money(group.total);

            summary.append(categoryName, total);
            details.appendChild(summary);

            group.items
                .slice()
                .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
                .forEach(item => {
                    const row = document.createElement("div");
                    row.className = "analysis-entry-row";

                    const left = document.createElement("div");
                    left.className = "analysis-entry-info";

                    const description = document.createElement("strong");
                    description.textContent = item.description || "No description";

                    const date = document.createElement("span");
                    date.textContent = item.date || "No date";

                    left.append(description, date);

                    if (includeTabName) {
                        const tab = document.createElement("span");
                        tab.className = "analysis-tab-name";
                        tab.textContent = "Tab: " + (item.tabName || "Untitled");
                        left.appendChild(tab);
                    }

                    const amount = document.createElement("strong");
                    amount.className = "analysis-entry-amount";
                    amount.textContent = money(item.amount);

                    row.append(left, amount);
                    details.appendChild(row);
                });

            wrapper.appendChild(details);
        });

        return wrapper;
    }

    const params = new URLSearchParams(window.location.search);
    const expenseId = params.get("id");
    const isHomeAnalysis = params.get("analysis") === "all";
    const isTabAnalysis = params.get("analysis") === "tab";

    /* HOME PAGE */
    const popup = document.getElementById("popup");
    const openPopup = document.getElementById("openPopup");
    const openPopup2 = document.getElementById("openPopup2");
    const closePopup = document.getElementById("closePopup");
    const expenseForm = document.getElementById("expenseForm");
    const expenseList = document.getElementById("expenseList");

    function showPopup() {
        if (popup) popup.classList.add("show");
    }

    function hidePopup() {
        if (popup) popup.classList.remove("show");
    }

    if (openPopup) openPopup.addEventListener("click", showPopup);
    if (openPopup2) openPopup2.addEventListener("click", showPopup);
    if (closePopup) closePopup.addEventListener("click", hidePopup);

    if (popup) {
        popup.addEventListener("click", event => {
            if (event.target === popup) hidePopup();
        });
    }

    function displayExpenses() {
        if (!expenseList) return;
        const expenses = getExpenses();
        expenseList.innerHTML = "";

        if (expenses.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No expenses yet.";
            message.style.color = "#9ca3af";
            message.style.fontSize = "14px";
            expenseList.appendChild(message);
            return;
        }

        expenses.forEach(expense => {
            const row = document.createElement("div");
            row.className = "home-expense-row";

            const button = document.createElement("button");
            button.className = "expense-item";
            button.textContent = expense.name;
            button.addEventListener("click", () => {
                window.location.href = "expense.html?id=" + encodeURIComponent(expense.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-tab";
            deleteButton.textContent = "🗑";
            deleteButton.setAttribute("aria-label", "Delete " + expense.name);
            deleteButton.addEventListener("click", event => {
                event.stopPropagation();
                if (!confirm('Delete the entire "' + expense.name + '" tab?')) return;
                saveExpenses(getExpenses().filter(item => String(item.id) !== String(expense.id)));
                displayExpenses();
            });

            row.append(button, deleteButton);
            expenseList.appendChild(row);
        });
    }

    if (expenseForm) {
        expenseForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = document.getElementById("expenseName").value.trim();
            if (!name) {
                alert("Please enter a name for this tab.");
                return;
            }

            const expenses = getExpenses();
            expenses.push({
                id: Date.now(),
                name,
                amount: 0,
                entries: []
            });
            saveExpenses(expenses);
            expenseForm.reset();
            hidePopup();
            displayExpenses();
        });
    }

    displayExpenses();

    const homeAnalysisButton = document.getElementById("homeAnalysisButton");
    if (homeAnalysisButton) {
        homeAnalysisButton.addEventListener("click", () => {
            window.location.href = isHomeAnalysis ? "index.html" : "index.html?analysis=all";
        });
    }

    if (isHomeAnalysis && !expenseId) {
        const homeContainer = document.querySelector(".home-container");
        if (homeContainer) homeContainer.style.display = "none";

        const button = document.getElementById("homeAnalysisButton");
        if (button) button.textContent = "← Home";

        const allRecords = [];
        getExpenses().forEach(tab => {
            (Array.isArray(tab.entries) ? tab.entries : []).forEach(entry => {
                allRecords.push({
                    ...entry,
                    category: entry.category || "others",
                    tabName: tab.name
                });
            });
        });

        const view = createAnalysisView("All Expenses — Category Analysis", allRecords, true);
        const topbar = document.querySelector(".topbar");
        if (topbar) topbar.insertAdjacentElement("afterend", view);
    }

    /* INDIVIDUAL EXPENSE PAGE */
    if (expenseId) {
        const expenses = getExpenses();
        const selectedExpense = expenses.find(expense => String(expense.id) === String(expenseId));

        if (!selectedExpense) {
            alert("Expense could not be found.");
            window.location.href = "index.html";
            return;
        }

        if (!Array.isArray(selectedExpense.entries)) selectedExpense.entries = [];

        const title = document.getElementById("expenseTitle");
        const name = document.getElementById("selectedName");
        const amount = document.getElementById("selectedAmount");
        if (title) title.textContent = selectedExpense.name;
        if (name) name.textContent = selectedExpense.name;

        function persistSelectedExpense() {
            const allExpenses = getExpenses();
            const index = allExpenses.findIndex(item => String(item.id) === String(selectedExpense.id));
            if (index !== -1) {
                allExpenses[index] = selectedExpense;
                saveExpenses(allExpenses);
            }
        }

        function displayEntries() {
            const entriesContainer = document.getElementById("expenseEntries");
            if (!entriesContainer) return;
            entriesContainer.innerHTML = "";

            if (selectedExpense.entries.length === 0) {
                const empty = document.createElement("p");
                empty.className = "empty-entries";
                empty.textContent = "No expenses added yet.";
                entriesContainer.appendChild(empty);
            }

            // A tab is only a container. Its total includes actual expense entries only.
            let total = 0;

            selectedExpense.entries.forEach(entry => {
                total += Number(entry.amount || 0);

                const row = document.createElement("div");
                row.className = "expense-entry";

                const info = document.createElement("div");
                info.className = "entry-info";

                const entryAmount = document.createElement("div");
                entryAmount.className = "entry-amount";
                entryAmount.textContent = (CATEGORY_MAP[entry.category] || CATEGORY_MAP.others).icon +
                    "  " + money(entry.amount);

                const entryDate = document.createElement("div");
                entryDate.className = "entry-date";
                entryDate.textContent = entry.date || "No date";

                const entryDescription = document.createElement("div");
                entryDescription.className = "entry-description";
                entryDescription.textContent = entry.description || "No description";

                info.append(entryAmount, entryDate, entryDescription);

                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-entry";
                deleteButton.textContent = "🗑";
                deleteButton.setAttribute("aria-label", "Delete expense");
                deleteButton.addEventListener("click", () => {
                    if (!confirm("Delete this expense?")) return;
                    selectedExpense.entries = selectedExpense.entries.filter(item => item.id !== entry.id);
                    persistSelectedExpense();
                    displayEntries();
                });

                row.append(info, deleteButton);
                entriesContainer.appendChild(row);
            });

            if (amount) amount.textContent = money(total);
        }

        displayEntries();

        const tabAnalysisButton = document.getElementById("tabAnalysisButton");
        if (tabAnalysisButton) {
            tabAnalysisButton.addEventListener("click", () => {
                window.location.href = isTabAnalysis
                    ? "expense.html?id=" + encodeURIComponent(expenseId)
                    : "expense.html?id=" + encodeURIComponent(expenseId) + "&analysis=tab";
            });
        }

        if (isTabAnalysis) {
            const expensePage = document.querySelector(".expense-page");
            const popupElement = document.getElementById("detailPopup");
            if (expensePage) expensePage.style.display = "none";
            if (popupElement) popupElement.style.display = "none";

            if (tabAnalysisButton) tabAnalysisButton.textContent = "← Expenses";

            const records = selectedExpense.entries.map(entry => ({
                ...entry,
                category: entry.category || "others"
            }));
            const view = createAnalysisView(selectedExpense.name + " — Category Analysis", records, false);
            const topbar = document.querySelector(".topbar");
            if (topbar) topbar.insertAdjacentElement("afterend", view);
        }

        /* ADD AN EXPENSE ENTRY */
        const detailPopup = document.getElementById("detailPopup");
        const addDetailButton = document.getElementById("addDetailButton");
        const closeDetailPopup = document.getElementById("closeDetailPopup");
        const detailForm = document.getElementById("detailForm");

        function showDetailPopup() {
            if (detailPopup) detailPopup.classList.add("show");
        }

        function hideDetailPopup() {
            if (detailPopup) detailPopup.classList.remove("show");
        }

        if (addDetailButton) addDetailButton.addEventListener("click", showDetailPopup);
        if (closeDetailPopup) closeDetailPopup.addEventListener("click", hideDetailPopup);

        if (detailPopup) {
            detailPopup.addEventListener("click", event => {
                if (event.target === detailPopup) hideDetailPopup();
            });
        }

        if (detailForm) {
            detailForm.addEventListener("submit", event => {
                event.preventDefault();

                const detailAmount = document.getElementById("detailAmount").value;
                const detailDate = document.getElementById("detailDate").value;
                const detailDescription = document.getElementById("detailDescription").value.trim();
                const detailCategory = document.getElementById("detailCategory").value;

                if (!detailAmount || !detailDate) {
                    alert("Please enter the amount and date.");
                    return;
                }

                selectedExpense.entries.push({
                    id: Date.now(),
                    amount: Number(detailAmount),
                    date: detailDate,
                    description: detailDescription,
                    category: CATEGORY_MAP[detailCategory] ? detailCategory : "others"
                });

                persistSelectedExpense();
                detailForm.reset();
                const categorySelect = document.getElementById("detailCategory");
                if (categorySelect) categorySelect.value = "others";
                hideDetailPopup();
                displayEntries();
            });
        }
    }
});
