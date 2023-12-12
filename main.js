import { centsToStr, Recommender } from "./recommender";
let menuForm;
let errorElt;
let resultsTable;
function displayError(msg) {
    errorElt.innerHTML = msg;
}
function clearError() {
    errorElt.innerHTML = "";
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
        input.value = "1";
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
        const reccer = new Recommender(selectedItems, budget);
        // TODO: finish
    }
}
document.addEventListener("DOMContentLoaded", function () {
    menuForm = document.getElementById("menuForm");
    errorElt = document.getElementById("error");
    resultsTable = document.getElementById("results");
});
