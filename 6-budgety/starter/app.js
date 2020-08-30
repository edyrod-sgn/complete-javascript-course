// Budget Controller
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100)
    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(e => sum += e.value);
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    }
    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            // Create new ID
            ID = data.allItems[type].length > 0 ?
                data.allItems[type][data.allItems[type].length - 1].id + 1 : 0;

            // Create item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Push item into the Data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        deleteItem: function (type, ID) {
            var index;
            data.allItems[type].find((e, ndx) => {
                if (e.id === ID) {
                    index = ndx;
                    return true;
                }
            });
            if (index !== undefined) data.allItems[type].splice(index, 1);
        },
        calculateBudget: function () {

            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage spent.
            data.percentage = data.totals.inc > 0 ?
                Math.round((data.totals.exp / data.totals.inc) * 100) : -1;
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(e => e.calcPercentage(data.totals.inc));
        },
        getPercentages: function () {
            return data.allItems.exp.map(e => e.getPercentage());
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },
        testing: function () {
            console.log(data);
        }
    }
})();

//UI Controller
var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumbers = function (num, type) {
        var numSplit;
        num = Math.abs(num);
        numSplit = num.toFixed(2).split('.');
        var edited = numSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return (type === 'exp' ? '-' : '+') + ' ' + edited + '.' + numSplit[1]
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMStrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create the HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"><i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">-%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the place holder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        clearFields: function () {
            var fields, copFields,
                fields = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputValue);
            copFields = Array.from(fields);
            copFields.forEach(e => e.value = "")
            fields[0].focus();
        },
        displayBudget: function (obj) {
            var type = obj.budget >= 0 ? 'inc' : 'exp';
            var displayPer;
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumbers(obj.totalExp, 'exp');
            displayPer = document.querySelector(DOMStrings.percentageLabel);
            obj.percentage > 0 ? displayPer.textContent = obj.percentage + '%' : displayPer.textContent = '---';
        },
        displayPercentages: function (percentages) {
            Array.from(document.querySelectorAll(DOMStrings.itemPercentage)).forEach((ele, ndx) => {
                ele.textContent = percentages[ndx] > 0 ? percentages[ndx] + '%' : '---'
            })
        },
        displayDate: function () {
            var now, month, year;
            const capitalize = (s) => {
                if (typeof s !== 'string') return ''
                return s.charAt(0).toUpperCase() + s.slice(1)
              }
            now = new Date();

            month = capitalize(now.toLocaleString('EN', { month: 'long' }));
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = month + ', ' + year;
        },
        changedType: function () {
            var fields = Array.from(document.querySelectorAll(
                DOMStrings.inputType+','+
                DOMStrings.inputDesc+','+
                DOMStrings.inputValue));
            fields.forEach(e=>e.classList.toggle('red-focus'));
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();



// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var updateBudget = function () {

        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display budget in UI
        UICtrl.displayBudget(budget);

    }
    var updatePercentages = function () {

        // 1. Calculate Percentages
        budgetController.calculatePercentages();

        // 2. Read Percentages from budget controller
        var percentages = budgetController.getPercentages();

        // 3. Display Percentages
        UICtrl.displayPercentages(percentages)
    }
    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value)) {

            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }

    }
    var ctrlDeleteItem = function (event) {
        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1])

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget.
            updateBudget();

            // 4. Update and show percentages
            updatePercentages();
        }
    }
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
        document.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                ctrlAddItem();
            }
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }
    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();