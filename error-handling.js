
console.log("===== JAVASCRIPT DEBUGGING LAB =====");


// ======================================
// PART 1: CALCULATOR DEBUGGING
// ======================================

function calculateTotal(price, quantity) {

    let total = price * quantity;

    let discount = 100;

    let finalAmount = total - discount;

    console.log("Total:", total);
    console.log("Discount:", discount);
    console.log("Final Amount:", finalAmount);

    return finalAmount;
}

const calculateBtn = document.getElementById("calculateBtn");

calculateBtn.addEventListener("click", function() {

    const price = Number(
        document.getElementById("price").value
    );

    const quantity = Number(
        document.getElementById("quantity").value
    );

    const output = document.getElementById("calculatorOutput");

    if (!Number.isFinite(price) || price <= 0 ||
        !Number.isInteger(quantity) || quantity <= 0) {

        output.textContent = "Enter a valid price and quantity.";
        return;
    }

    const finalAmount = calculateTotal(price, quantity);

    output.textContent =
        `Total: ₹${price * quantity} | Discount: ₹100 | Final Amount: ₹${finalAmount}`;

});


// ======================================
// PART 2: ERROR HANDLING
// ======================================

const errorBtn = document.getElementById("errorBtn");

errorBtn.addEventListener("click", function() {

    const output = document.getElementById("errorOutput");

    try {

        let result = 10 / 0;

        console.log("Result:", result);

        // Deliberate error for practice
        let username = userName;

        console.log(username);

        output.textContent = "No error occurred.";

    } catch (error) {

        console.log("Something went wrong!");
        console.log("Error:", error.message);

        output.textContent = "Caught error: " + error.message;

    } finally {

        console.log("Program execution completed.");

    }

});


// ======================================
// PART 3: STUDENT MARKS CALCULATOR
// ======================================

function calculateStudentMarks(marks) {

    let total = 0;

    // Correct loop condition:
    // i must be less than marks.length

    for (let i = 0; i < marks.length; i++) {

        total = total + marks[i];

        console.log("Current index:", i);
        console.log("Current mark:", marks[i]);
        console.log("Running total:", total);

    }

    let average = total / marks.length;

    console.log("Total Marks:", total);
    console.log("Average:", average);

    return {
        total: total,
        average: average
    };

}

const marksBtn = document.getElementById("marksBtn");

marksBtn.addEventListener("click", function() {

    const marks = [80, 90, 70, 85];

    const result = calculateStudentMarks(marks);

    document.getElementById("marksOutput").textContent =
        `Total Marks: ${result.total} | Average: ${result.average}`;

});


console.log("===== APPLICATION READY =====");
