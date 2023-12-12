import { centsToStr, Recommender } from "./recommender";

type ItemOption = [cost: number, description: string];

let menuForm: HTMLFormElement;
let errorElt: HTMLSpanElement;
let resultsTable: HTMLTableElement;

function displayError(msg: string): void {
  errorElt.innerHTML = msg;
}

function clearError(): void {
  errorElt.innerHTML = "";
}

function disableInput(input: HTMLInputElement): void {
  input.classList.add("disabled-input");
  input.setAttribute("disabled", "disabled");
}

function enableInput(input: HTMLInputElement): void {
  input.classList.remove("disabled-input");
  input.removeAttribute("disabled");
}

function loadMenu(menu: Array<ItemOption>,
  submissionProcessor: (event: SubmitEvent) => void): void {
  menuForm.replaceChildren(...menu.map((itemOption) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "item";
    checkbox.value = itemOption[0].toString();
    const itemText = document.createTextNode(
      centsToStr(itemOption[0]) + " \u2014 " + itemOption[1]
    );
    const input = document.createElement("input");
    input.type = "number";
    input.name = itemOption[0].toString();
    input.min = "0";
    input.value = "1";
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        enableInput(input);
      } else {
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
  mealSwipesLabel.appendChild(document.createTextNode(
    "Meal swipes to use ($11.25 each): "
  ));

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

function menuProcessor(event: SubmitEvent): void {
  event.preventDefault();
  clearError();
  resultsTable.innerHTML = "";

  const formData = new FormData(menuForm);
  const selectedItems: Array<number> = [];
  const quantities: Array<number> = [];
  formData.getAll("item").forEach((item) => {
    selectedItems.push(parseInt(item as string));
    quantities.push(parseInt(formData.get(item as string) as string));
  });

  const numMealSwipes = formData.get("numMealSwipes") as string;
  const budget = parseInt(numMealSwipes) * 1125;
  console.log('Selected Items:', selectedItems);
  console.log('Quantities:', quantities);
  console.log('Meal swipes:', numMealSwipes);
  console.log('Budget:', budget);

  if (selectedItems.length === 0) {
    displayError("Please select at least one item.");
  } else {
    const reccer = new Recommender(selectedItems, budget);
    // TODO: finish
  }
}

document.addEventListener("DOMContentLoaded", function () {
  menuForm = <HTMLFormElement>document.getElementById("menuForm");
  errorElt = <HTMLSpanElement>document.getElementById("error");
  resultsTable = <HTMLTableElement>document.getElementById("results");
})
