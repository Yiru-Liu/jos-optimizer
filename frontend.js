import { centsToStr, Recommender } from "./backend.js";
const menu = [
    [150, "hand fruit"],
    [250, "cereal, chips, pop tarts, rice crispy treats, milk"],
    [275, "oatmeal, powerade, sparkling water"],
    [300, "hostess, uncrustables"],
    [325, "juice"],
    [350, "yogurt packs, tea (gold peak, honest, and peace), vitamin water"],
    [425, "fruit salad"]
];
let menuForm;
let errorElt;
let messageElt;
let resultsTable;
function displayMessage(msg) {
    messageElt.replaceChildren(document.createTextNode(msg));
}
function clearMessage() {
    messageElt.innerHTML = "";
}
function displayError(msg) {
    errorElt.replaceChildren(document.createTextNode(msg));
}
function clearError() {
    errorElt.innerHTML = "";
}
function updateTable(rows) {
    const tbl_body = document.createElement("tbody");
    const header_row = document.createElement("tr");
    const desc_th = document.createElement("th");
    desc_th.appendChild(document.createTextNode("Items"));
    const used_th = document.createElement("th");
    used_th.appendChild(document.createTextNode("Amount used"));
    const rem_th = document.createElement("th");
    rem_th.appendChild(document.createTextNode("Amount wasted"));
    const efficiency_th = document.createElement("th");
    efficiency_th.appendChild(document.createTextNode("Efficiency"));
    header_row.appendChild(desc_th);
    header_row.appendChild(used_th);
    header_row.appendChild(rem_th);
    header_row.appendChild(efficiency_th);
    tbl_body.appendChild(header_row);
    rows.forEach((row) => {
        const tbl_row = document.createElement("tr");
        const desc_td = document.createElement("td");
        desc_td.innerHTML = row[0];
        const used_td = document.createElement("td");
        used_td.appendChild(document.createTextNode(row[1]));
        const rem_td = document.createElement("td");
        rem_td.appendChild(document.createTextNode(row[2]));
        const efficiency_td = document.createElement("td");
        efficiency_td.appendChild(document.createTextNode(row[3]));
        tbl_row.appendChild(desc_td);
        tbl_row.appendChild(used_td);
        tbl_row.appendChild(rem_td);
        tbl_row.appendChild(efficiency_td);
        tbl_body.appendChild(tbl_row);
    });
    resultsTable.replaceChildren(tbl_body);
}
function disableInput(input) {
    input.classList.add("disabled-input");
    input.setAttribute("disabled", "disabled");
}
function enableInput(input) {
    input.classList.remove("disabled-input");
    input.removeAttribute("disabled");
}
function loadMenu(menu, submissionProcessor) {
    menuForm.replaceChildren(...menu.map((itemOption) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "item";
        checkbox.value = itemOption[0].toString();
        const itemText = document.createTextNode(centsToStr(itemOption[0]) + " \u2014 " + itemOption[1]);
        const input = document.createElement("input");
        input.type = "number";
        input.name = itemOption[0].toString();
        input.min = "0";
        input.value = "0";
        checkbox.addEventListener("change", function () {
            if (this.checked) {
                enableInput(input);
            }
            else {
                disableInput(input);
            }
        });
        disableInput(input);
        label.appendChild(checkbox);
        label.appendChild(itemText);
        label.appendChild(document.createElement("br"));
        label.appendChild(document.createTextNode("Minimum: "));
        label.appendChild(input);
        return label;
    }));
    const mealSwipesLabel = document.createElement("label");
    mealSwipesLabel.appendChild(document.createTextNode("Meal swipes to use ($11.25 each): "));
    const mealSwipesNum = document.createElement("input");
    mealSwipesNum.type = "number";
    mealSwipesNum.name = "numMealSwipes";
    mealSwipesNum.min = "1";
    mealSwipesNum.max = "4";
    mealSwipesNum.value = "1";
    mealSwipesLabel.appendChild(mealSwipesNum);
    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Calculate";
    menuForm.appendChild(mealSwipesLabel);
    menuForm.appendChild(submitButton);
    menuForm.addEventListener("submit", submissionProcessor);
}
function menuProcessor(event) {
    event.preventDefault();
    clearError();
    clearMessage();
    resultsTable.innerHTML = "";
    const formData = new FormData(menuForm);
    const selectedItems = [];
    const quantities = [];
    formData.getAll("item").forEach((item) => {
        selectedItems.push(parseInt(item));
        quantities.push(parseInt(formData.get(item)));
    });
    const numMealSwipes = formData.get("numMealSwipes");
    const budget = parseInt(numMealSwipes) * 1125;
    console.log('Selected Items:', selectedItems);
    console.log('Quantities:', quantities);
    console.log('Meal swipes:', numMealSwipes);
    console.log('Budget:', budget);
    if (selectedItems.length === 0) {
        displayError("Please select at least one item.");
    }
    else {
        const reccer = new Recommender(selectedItems, quantities, budget);
        const tableRows = reccer.allReports.map((reportItem) => {
            const desc = reccer.cartToStr(reportItem.cart);
            const total = reccer.cartTotal(reportItem.cart);
            const used = centsToStr(total);
            const rem = centsToStr(reccer.budget - total);
            const eff = reportItem.efficiency.toPrecision(3) + "%";
            return [desc, used, rem, eff];
        });
        displayMessage(`${tableRows.length} option${(tableRows.length === 1) ? "" : "s"} found:`);
        updateTable(tableRows);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    menuForm = document.getElementById("menuForm");
    errorElt = document.getElementById("error");
    messageElt = document.getElementById("message");
    resultsTable = document.getElementById("results");
    loadMenu(menu, menuProcessor);
});
