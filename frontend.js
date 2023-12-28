import { centsToStr, Recommender } from "./backend.js";
const JOS_MENU = [
    [150, "hand fruit"],
    [250, "cereal, chips, pop tarts, rice crispy treats, milk"],
    [275, "oatmeal, powerade, sparkling water"],
    [300, "hostess, uncrustables"],
    [325, "juice"],
    [350, "yogurt packs, tea (gold peak, honest, and peace), vitamin water"],
    [425, "fruit salad"]
];
let mainElt;
let menuForm;
let errorElt;
let messageElt;
let resultsTable;
function sizeMain() {
    const availableWidth = document.documentElement.clientWidth;
    if (availableWidth < 500) {
        mainElt.style.width = "484px";
        mainElt.style.transform = `scale(${availableWidth / 500})`;
        console.log(availableWidth / 500);
    }
    else {
        mainElt.removeAttribute("style");
        mainElt.style.minWidth = "484px";
    }
}
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
    const tblBody = document.createElement("tbody");
    const headerRow = document.createElement("tr");
    const descTh = document.createElement("th");
    descTh.appendChild(document.createTextNode("Items"));
    const usedTh = document.createElement("th");
    usedTh.appendChild(document.createTextNode("Amount used"));
    const remTh = document.createElement("th");
    remTh.appendChild(document.createTextNode("Amount wasted"));
    const efficiencyTh = document.createElement("th");
    efficiencyTh.appendChild(document.createTextNode("Efficiency"));
    headerRow.appendChild(descTh);
    headerRow.appendChild(usedTh);
    headerRow.appendChild(remTh);
    headerRow.appendChild(efficiencyTh);
    tblBody.appendChild(headerRow);
    rows.forEach((row) => {
        const tblRow = document.createElement("tr");
        const descTd = document.createElement("td");
        descTd.innerHTML = row[0];
        const usedTd = document.createElement("td");
        usedTd.appendChild(document.createTextNode(row[1]));
        const remTd = document.createElement("td");
        remTd.appendChild(document.createTextNode(row[2]));
        const efficiencyTd = document.createElement("td");
        efficiencyTd.appendChild(document.createTextNode(row[3]));
        tblRow.appendChild(descTd);
        tblRow.appendChild(usedTd);
        tblRow.appendChild(remTd);
        tblRow.appendChild(efficiencyTd);
        tblBody.appendChild(tblRow);
    });
    resultsTable.replaceChildren(tblBody);
}
function clearTable() {
    resultsTable.innerHTML = "";
}
function disableInput(input) {
    input.classList.add("disabled-input");
    input.setAttribute("disabled", "disabled");
}
function enableInput(input) {
    input.classList.remove("disabled-input");
    input.removeAttribute("disabled");
}
function displayJosMenu(fieldset) {
    const itemsLegend = document.createElement("legend");
    itemsLegend.appendChild(document.createTextNode("Jo's Items"));
    const itemSelections = JOS_MENU.map((itemOption) => {
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
        input.required = true;
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
    });
    const mealSwipesLabel = document.createElement("label");
    mealSwipesLabel.appendChild(document.createTextNode("Meal swipes to use ($11.25 each): "));
    const mealSwipesNum = document.createElement("input");
    mealSwipesNum.type = "number";
    mealSwipesNum.name = "numMealSwipes";
    mealSwipesNum.min = "1";
    mealSwipesNum.max = "4";
    mealSwipesNum.value = "1";
    mealSwipesLabel.appendChild(mealSwipesNum);
    fieldset.replaceChildren(itemsLegend, ...itemSelections, mealSwipesLabel);
}
function createCurrencyInput(name) {
    const currencyInput = document.createElement("input");
    currencyInput.type = "number";
    currencyInput.name = name;
    currencyInput.classList.add("currencyInput");
    currencyInput.min = "0.01";
    currencyInput.step = "0.01";
    currencyInput.required = true;
    currencyInput.placeholder = "1234.56";
    return currencyInput;
}
function displayCustomMenuEditor(fieldset) {
    const itemsLegend = document.createElement("legend");
    itemsLegend.appendChild(document.createTextNode("Custom Items"));
    const priceCategoriesLabel = document.createElement("label");
    priceCategoriesLabel.appendChild(document.createTextNode("Price categories:"));
    const addNewPriceButton = document.createElement("input");
    addNewPriceButton.type = "button";
    addNewPriceButton.value = "Add new price category";
    addNewPriceButton.style.display = "block";
    priceCategoriesLabel.appendChild(addNewPriceButton);
    const budgetLabel = document.createElement("label");
    const budgetInput = createCurrencyInput("budget");
    budgetLabel.replaceChildren(document.createTextNode("Budget: $"), budgetInput);
    fieldset.replaceChildren(itemsLegend, priceCategoriesLabel, budgetLabel);
    function addNewPriceCategory() {
        const priceCategoryDiv = document.createElement("div");
        priceCategoryDiv.classList.add("priceCategory");
        const priceInput = createCurrencyInput("price");
        const minInput = document.createElement("input");
        minInput.type = "number";
        minInput.name = "minQuantity";
        minInput.min = "0";
        minInput.value = "0";
        minInput.required = true;
        const removeButton = document.createElement("input");
        removeButton.type = "button";
        removeButton.value = "Remove";
        removeButton.style.float = "right";
        removeButton.addEventListener("click", () => {
            priceCategoryDiv.remove();
        });
        priceCategoryDiv.replaceChildren(document.createTextNode("$"), priceInput, document.createTextNode("\u2003Minimum: "), minInput, removeButton);
        priceCategoriesLabel.insertBefore(priceCategoryDiv, addNewPriceButton);
    }
    addNewPriceButton.addEventListener("click", addNewPriceCategory);
}
function loadMenu(submissionProcessor) {
    const menuSelectorFieldset = document.createElement("fieldset");
    const menuSelectorLegend = document.createElement("legend");
    menuSelectorLegend.appendChild(document.createTextNode("Item Options"));
    menuSelectorFieldset.appendChild(menuSelectorLegend);
    const josItemsDiv = document.createElement("div");
    const josItemsInput = document.createElement("input");
    josItemsInput.type = "radio";
    josItemsInput.id = "josItems";
    josItemsInput.name = "menuSelector";
    josItemsInput.value = "josItems";
    josItemsInput.checked = true;
    const josItemsLabel = document.createElement("label");
    josItemsLabel.setAttribute("for", "josItems");
    josItemsLabel.appendChild(document.createTextNode("Jo's Items"));
    josItemsDiv.append(josItemsInput, josItemsLabel);
    const customItemsDiv = document.createElement("div");
    const customItemsInput = document.createElement("input");
    customItemsInput.type = "radio";
    customItemsInput.id = "customItems";
    customItemsInput.name = "menuSelector";
    customItemsInput.value = "customItems";
    const customItemsLabel = document.createElement("label");
    customItemsLabel.setAttribute("for", "customItems");
    customItemsLabel.appendChild(document.createTextNode("Custom Items"));
    customItemsDiv.append(customItemsInput, customItemsLabel);
    menuSelectorFieldset.append(josItemsDiv, customItemsDiv);
    menuForm.appendChild(menuSelectorFieldset);
    const itemsFieldset = document.createElement("fieldset");
    josItemsInput.addEventListener("change", function () {
        if (this.checked) {
            clearError();
            clearMessage();
            clearTable();
            displayJosMenu(itemsFieldset);
        }
    });
    displayJosMenu(itemsFieldset);
    customItemsInput.addEventListener("change", function () {
        if (this.checked) {
            clearError();
            clearMessage();
            clearTable();
            displayCustomMenuEditor(itemsFieldset);
        }
    });
    const submitButton = document.createElement("input");
    submitButton.type = "submit";
    submitButton.value = "Calculate";
    menuForm.appendChild(itemsFieldset);
    menuForm.appendChild(submitButton);
    menuForm.addEventListener("submit", submissionProcessor);
}
function menuProcessor(event) {
    event.preventDefault();
    clearError();
    clearMessage();
    clearTable();
    let prices;
    let minimums;
    let budget;
    const formData = new FormData(menuForm);
    const currentForm = formData.get("menuSelector");
    if (currentForm === "josItems") {
        console.log("Jo's Items form used.");
        prices = [];
        minimums = [];
        formData.getAll("item").forEach((item) => {
            prices.push(parseInt(item));
            minimums.push(parseInt(formData.get(item)));
        });
        const numMealSwipes = formData.get("numMealSwipes");
        budget = parseInt(numMealSwipes) * 1125;
        if (prices.length === 0) {
            displayError("Please select at least one item.");
            return;
        }
    }
    else if (currentForm === "customItems") {
        console.log("Custom items form used.");
        const pricesRaw = formData.getAll("price");
        if (pricesRaw.length === 0) {
            displayError("Please add at least one price category.");
            return;
        }
        prices = pricesRaw.map(p => Math.round(parseFloat(p) * 100));
        minimums = formData.getAll("minQuantity").map(m => parseInt(m));
        prices.map((p, i) => [p, minimums[i]]).sort((a, b) => a[0] - b[0])
            .forEach((pair, i) => {
            prices[i] = pair[0];
            minimums[i] = pair[1];
        });
        budget = Math.round(parseFloat(formData.get("budget")) * 100);
    }
    else {
        throw new Error("Invalid form selected");
    }
    console.log("prices: ", prices);
    console.log("minimums: ", minimums);
    console.log("budget: ", budget);
    calcAndDisplayRecs(prices, minimums, budget);
}
function xNoun(quantity, noun) {
    return `${quantity} ${noun}${(quantity === 1) ? "" : "s"}`;
}
function calcAndDisplayRecs(priceCategories, mins, budget) {
    const reccer = new Recommender(priceCategories, mins, budget);
    const tableRows = reccer.allReports.map((reportItem) => {
        const desc = reccer.cartToStr(reportItem.cart);
        const total = reccer.cartTotal(reportItem.cart);
        const used = centsToStr(total);
        const rem = centsToStr(reccer.budget - total);
        const eff = reportItem.efficiency.toPrecision(3) + "%";
        return [desc, used, rem, eff];
    });
    displayMessage(`${xNoun(tableRows.length, "option")} found:`);
    updateTable(tableRows);
}
document.addEventListener("DOMContentLoaded", function () {
    mainElt = document.getElementsByTagName("main")[0];
    menuForm = document.getElementById("menuForm");
    errorElt = document.getElementById("error");
    messageElt = document.getElementById("message");
    resultsTable = document.getElementById("results");
    sizeMain();
    window.addEventListener("resize", sizeMain);
    loadMenu(menuProcessor);
});
