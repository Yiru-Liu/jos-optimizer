"use strict";

class TableMaker {
    elt;
    max_now;
    report;

    /**
     * Creates a TableMaker.
     * @param {string} id the id of the table in the HTML
     * @param {Array<Immutable.Record>} report table to display
     * @param {number} max_now maximum number of rows to display
     */
    constructor(id, report, max_now) {
        this.elt = document.getElementById(id);
        this.report = report;
        this.max_now = max_now;
    }

    make() {
        const tbl_body = document.createElement("tbody");
        for (let row_i = 0; row_i < this.max_now; row_i++) {
            const current_row = this.report[row_i];
            if (current_row === undefined) {
                break;
            }
            const tbl_row = document.createElement("tr");
            const cart_td = document.createElement("td");
            cart_td.appendChild(document.createTextNode(
                cart_to_str(current_row["cart"])));
            const used_td = document.createElement("td");
            used_td.appendChild(document.createTextNode(
                centsToStr(current_row["used"])));
            const remaining_td = document.createElement("td");
            remaining_td.appendChild(document.createTextNode(
                centsToStr(current_row["remaining"])));
            const efficiency_td = document.createElement("td");
            efficiency_td.appendChild(document.createTextNode(
                current_row["efficiency"].toPrecision(3) + "%"));
            tbl_row.appendChild(cart_td);
            tbl_row.appendChild(used_td);
            tbl_row.appendChild(remaining_td);
            tbl_row.appendChild(efficiency_td);
            tbl_body.appendChild(tbl_row);
        }
        this.elt.replaceChildren(tbl_body);
    }
}

class ItemOption {
    cost;
    description;

    constructor(cost, description) {
        this.cost = cost;
        this.description = description;
    }
}

const menu = [
    new ItemOption(150, "hand fruit"),
    new ItemOption(250, "cereal, chips, pop tarts, rice crispy treats, milk"),
    new ItemOption(275, "oatmeal, powerade, sparkling water"),
    new ItemOption(300, "hostess, uncrustables"),
    new ItemOption(325, "juice"),
    new ItemOption(350,
        "yogurt packs, tea (gold peak, honest, and peace), vitamin water"),
    new ItemOption(425, "fruit salad")
];

const menuForm = document.getElementById("menuForm");

menu.forEach((itemOption) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "item";
    checkbox.value = itemOption.cost;
    label.appendChild(checkbox);
    const itemText = document.createTextNode(
        centsToStr(itemOption.cost) + " \u2014 " + itemOption.description
    );
    label.appendChild(itemText);
    label.appendChild(document.createElement("br"));
    label.appendChild(document.createTextNode("Minimum: "));
    const input = document.createElement("input");
    input.type = "number";
    input.name = itemOption.cost;
    input.min = "0";
    input.value = "1";
    label.appendChild(input);
    menuForm.appendChild(label);
})

const mealSwipesLabel = document.createElement("label");
mealSwipesLabel.appendChild(document.createTextNode(
    "Meal swipes to use: "
))
const mealSwipesNum = document.createElement("input");
mealSwipesNum.type = "number";
mealSwipesNum.name = "numMealSwipes";
mealSwipesNum.min = "1";
mealSwipesNum.value = "1";
mealSwipesLabel.appendChild(mealSwipesNum);
menuForm.appendChild(mealSwipesLabel);

const submitButton = document.createElement("input");
submitButton.type = "submit";
submitButton.value = "Calculate";
menuForm.appendChild(submitButton);

menuForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(menuForm);
    const selectedItems = [];
    const quantities = [];
    formData.getAll('item').forEach((item) => {
        selectedItems.push(parseInt(item));
        quantities.push(parseInt(formData.get(item)));
    });

    const numMealSwipes = formData.get("numMealSwipes");
    const budget = numMealSwipes * 1125;
    console.log('Selected Items:', selectedItems);
    console.log('Quantities:', quantities);
    console.log('Meal swipes:', numMealSwipes);
    console.log('Budget:', budget);

    const purch_reccer =
        new PurchaseRecommender(Immutable.Set(selectedItems), budget);
    const report = purch_reccer.carts_report();
    console.log(report);

    const tableMaker = new TableMaker("results", report, Number.MAX_SAFE_INTEGER);
    tableMaker.make();
});

document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        const correspondingInput = checkbox.parentNode.querySelector('input[type="number"]');
        if (!checkbox.checked) {
            correspondingInput.classList.add('disabled-input');
            correspondingInput.setAttribute('disabled', 'disabled');
        }
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                correspondingInput.classList.remove('disabled-input');
                correspondingInput.removeAttribute('disabled');
            } else {
                correspondingInput.classList.add('disabled-input');
                correspondingInput.setAttribute('disabled', 'disabled');
            }
        });
    });
});
