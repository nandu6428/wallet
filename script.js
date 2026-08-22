document.addEventListener("DOMContentLoaded", function () {


    /* =================================
       STORAGE
    ================================= */

    function getExpenses() {

        return JSON.parse(
            localStorage.getItem("expenses")
        ) || [];

    }


    function saveExpenses(expenses) {

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

    }



    /* =================================
       HOME PAGE
    ================================= */

    const popup =
        document.getElementById("popup");

    const openPopup =
        document.getElementById("openPopup");

    const openPopup2 =
        document.getElementById("openPopup2");

    const closePopup =
        document.getElementById("closePopup");

    const expenseForm =
        document.getElementById("expenseForm");

    const expenseList =
        document.getElementById("expenseList");



    /* OPEN HOME POPUP */

    function showPopup() {

        if (popup) {
            popup.classList.add("show");
        }

    }



    /* CLOSE HOME POPUP */

    function hidePopup() {

        if (popup) {
            popup.classList.remove("show");
        }

    }



    if (openPopup) {

        openPopup.addEventListener(
            "click",
            showPopup
        );

    }



    if (openPopup2) {

        openPopup2.addEventListener(
            "click",
            showPopup
        );

    }



    if (closePopup) {

        closePopup.addEventListener(
            "click",
            hidePopup
        );

    }



    if (popup) {

        popup.addEventListener(
            "click",
            function (event) {

                if (event.target === popup) {
                    hidePopup();
                }

            }
        );

    }



    /* =================================
       DISPLAY HOME EXPENSES
    ================================= */

    function displayExpenses() {

        if (!expenseList) {
            return;
        }


        const expenses = getExpenses();

        expenseList.innerHTML = "";



        if (expenses.length === 0) {

            const message =
                document.createElement("p");

            message.textContent =
                "No expenses yet.";

            message.style.color = "#9ca3af";

            message.style.fontSize = "14px";

            expenseList.appendChild(message);

            return;

        }



        expenses.forEach(function (expense) {


            const row =
                document.createElement("div");

            row.className =
                "home-expense-row";



            const button =
                document.createElement("button");

            button.className =
                "expense-item";

            button.textContent =
                expense.name;



            button.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "expense.html?id=" +
                        expense.id;

                }
            );



            /* DELETE ENTIRE TAB */

            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-tab";

            deleteButton.textContent =
                "🗑";



            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();


                    const confirmed =
                        confirm(
                            "Delete the entire \"" +
                            expense.name +
                            "\" tab?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    const updatedExpenses =
                        getExpenses().filter(
                            function (item) {

                                return item.id !==
                                       expense.id;

                            }
                        );


                    saveExpenses(
                        updatedExpenses
                    );


                    displayExpenses();

                }
            );



            row.appendChild(button);

            row.appendChild(deleteButton);

            expenseList.appendChild(row);

        });

    }



    /* =================================
       ADD NEW TAB FROM HOME
    ================================= */

    if (expenseForm) {

        expenseForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "expenseName"
                        )
                        .value
                        .trim();


                const amount =
                    document
                        .getElementById(
                            "expenseAmount"
                        )
                        .value;


                const date =
                    document
                        .getElementById(
                            "expenseDate"
                        )
                        .value;


                const description =
                    document
                        .getElementById(
                            "expenseDescription"
                        )
                        .value
                        .trim();



                if (!name || !amount || !date) {

                    alert(
                        "Please fill in all required fields."
                    );

                    return;

                }



                const newExpense = {

                    id: Date.now(),

                    name: name,

                    amount: Number(amount),

                    date: date,

                    description: description,

                    entries: []

                };



                const expenses =
                    getExpenses();


                expenses.push(
                    newExpense
                );


                saveExpenses(
                    expenses
                );


                expenseForm.reset();


                hidePopup();


                displayExpenses();

            }
        );

    }



    displayExpenses();



    /* =================================
       SELECTED EXPENSE PAGE
    ================================= */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const expenseId =
        urlParams.get("id");



    if (expenseId) {


        const expenses =
            getExpenses();


        const selectedExpense =
            expenses.find(
                function (expense) {

                    return String(
                        expense.id
                    ) === String(
                        expenseId
                    );

                }
            );



        if (!selectedExpense) {

            alert(
                "Expense could not be found."
            );

            window.location.href =
                "index.html";

            return;

        }



        /* Make sure entries exists */

        if (!Array.isArray(
            selectedExpense.entries
        )) {

            selectedExpense.entries = [];

        }



        /* =================================
           SHOW SELECTED EXPENSE
        ================================= */

        const title =
            document.getElementById(
                "expenseTitle"
            );


        const name =
            document.getElementById(
                "selectedName"
            );


        const amount =
            document.getElementById(
                "selectedAmount"
            );


        const date =
            document.getElementById(
                "selectedDate"
            );


        const description =
            document.getElementById(
                "selectedDescription"
            );



        if (title) {

            title.textContent =
                selectedExpense.name;

        }



        if (name) {

            name.textContent =
                selectedExpense.name;

        }



        if (date) {

            date.textContent =
                selectedExpense.date;

        }



        if (description) {

            description.textContent =
                selectedExpense.description ||
                "No description";

        }



        /* =================================
           DISPLAY ENTRIES
        ================================= */

        const entriesContainer =
            document.getElementById(
                "expenseEntries"
            );


        function displayEntries() {


            if (!entriesContainer) {
                return;
            }


            entriesContainer.innerHTML = "";



            if (
                selectedExpense.entries.length === 0
            ) {

                const empty =
                    document.createElement("p");

                empty.className =
                    "empty-entries";

                empty.textContent =
                    "No expenses added yet.";

                entriesContainer.appendChild(
                    empty
                );

            }



            let total =
                selectedExpense.amount;



            selectedExpense.entries.forEach(
                function (entry) {


                    total +=
                        Number(entry.amount);



                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "expense-entry";



                    const info =
                        document.createElement(
                            "div"
                        );

                    info.className =
                        "entry-info";



                    const entryAmount =
                        document.createElement(
                            "div"
                        );

                    entryAmount.className =
                        "entry-amount";

                    entryAmount.textContent =
                        "₹" +
                        Number(
                            entry.amount
                        ).toLocaleString(
                            "en-IN"
                        );



                    const entryDate =
                        document.createElement(
                            "div"
                        );

                    entryDate.className =
                        "entry-date";

                    entryDate.textContent =
                        entry.date;



                    const entryDescription =
                        document.createElement(
                            "div"
                        );

                    entryDescription.className =
                        "entry-description";

                    entryDescription.textContent =
                        entry.description ||
                        "No description";



                    info.appendChild(
                        entryAmount
                    );

                    info.appendChild(
                        entryDate
                    );

                    info.appendChild(
                        entryDescription
                    );



                    /* DELETE INDIVIDUAL ENTRY */

                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.className =
                        "delete-entry";

                    deleteButton.textContent =
                        "🗑";



                    deleteButton.addEventListener(
                        "click",
                        function () {


                            const confirmed =
                                confirm(
                                    "Delete this expense?"
                                );


                            if (!confirmed) {
                                return;
                            }



                            selectedExpense.entries =
                                selectedExpense.entries
                                    .filter(
                                        function (
                                            item
                                        ) {

                                            return item.id !==
                                                   entry.id;

                                        }
                                    );



                            const allExpenses =
                                getExpenses();


                            const index =
                                allExpenses.findIndex(
                                    function (
                                        item
                                    ) {

                                        return item.id ===
                                               selectedExpense.id;

                                    }
                                );



                            if (index !== -1) {

                                allExpenses[index] =
                                    selectedExpense;

                                saveExpenses(
                                    allExpenses
                                );

                            }



                            displayEntries();

                        }
                    );



                    row.appendChild(info);

                    row.appendChild(
                        deleteButton
                    );

                    entriesContainer.appendChild(
                        row
                    );

                }
            );



            /* UPDATE TOTAL */

            if (amount) {

                amount.textContent =
                    "₹" +
                    total.toLocaleString(
                        "en-IN"
                    );

            }

        }



        displayEntries();



        /* =================================
           ADD EXPENSE POPUP
        ================================= */

        const detailPopup =
            document.getElementById(
                "detailPopup"
            );


        const addDetailButton =
            document.getElementById(
                "addDetailButton"
            );


        const closeDetailPopup =
            document.getElementById(
                "closeDetailPopup"
            );


        const detailForm =
            document.getElementById(
                "detailForm"
            );



        function showDetailPopup() {

            if (detailPopup) {

                detailPopup.classList.add(
                    "show"
                );

            }

        }



        function hideDetailPopup() {

            if (detailPopup) {

                detailPopup.classList.remove(
                    "show"
                );

            }

        }



        if (addDetailButton) {

            addDetailButton.addEventListener(
                "click",
                showDetailPopup
            );

        }



        if (closeDetailPopup) {

            closeDetailPopup.addEventListener(
                "click",
                hideDetailPopup
            );

        }



        if (detailPopup) {

            detailPopup.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        detailPopup
                    ) {

                        hideDetailPopup();

                    }

                }
            );

        }



        /* =================================
           SAVE NEW EXPENSE ENTRY
        ================================= */

        if (detailForm) {

            detailForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();



                    const detailAmount =
                        document
                            .getElementById(
                                "detailAmount"
                            )
                            .value;


                    const detailDate =
                        document
                            .getElementById(
                                "detailDate"
                            )
                            .value;


                    const detailDescription =
                        document
                            .getElementById(
                                "detailDescription"
                            )
                            .value
                            .trim();



                    if (
                        !detailAmount ||
                        !detailDate
                    ) {

                        alert(
                            "Please enter the amount and date."
                        );

                        return;

                    }



                    const newEntry = {

                        id: Date.now(),

                        amount:
                            Number(
                                detailAmount
                            ),

                        date:
                            detailDate,

                        description:
                            detailDescription

                    };



                    selectedExpense.entries.push(
                        newEntry
                    );



                    const allExpenses =
                        getExpenses();


                    const index =
                        allExpenses.findIndex(
                            function (item) {

                                return item.id ===
                                       selectedExpense.id;

                            }
                        );



                    if (index !== -1) {

                        allExpenses[index] =
                            selectedExpense;

                        saveExpenses(
                            allExpenses
                        );

                    }



                    detailForm.reset();

                    hideDetailPopup();

                    displayEntries();

                }
            );

        }

    }

});