function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

document.getElementById("search-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action to avoid form submission (if applicable)
        sendSearch();
    }
});

document.addEventListener('click', function(event) {
    var button = event.target.closest('button');
    if (button && button.classList.contains('circle-btn') && button.closest('.result-box')) {
        logFeedback(button);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.querySelectorAll('.number-button');

    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove 'selected' class from all buttons
            buttons.forEach(btn => btn.classList.remove('selected'));

            // Add 'selected' class to the clicked button
            button.classList.add('selected');

            // Your logic to handle the selection can go here
            console.log('Selected number of results:', button.value);
        });
    });
});


function logFeedback(button) {
    // Find the parent result-box of the clicked button
    var resultBox = button.closest('.result-box');

    // Get the class code and title from the result box as well as the query
    var classCode = resultBox.querySelector('.class-code').textContent;
    var classTitle = resultBox.querySelector('.class-title').textContent;
    var query = document.getElementById('search-input').value;

    // Determine whether the green or red button was clicked
    var buttonType = button.classList.contains('green') ? 'Green (Thumbs Up)' : 'Red (Thumbs Down)';

    // Log the information
    console.log({
        'Button Pressed':buttonType,
        'Query':query,
        'Class Code':classCode,
        'Class Title:':classTitle,
    })
}

function sendSearch() {
    var query = document.getElementById('search-input').value;
    var upperDivision = document.getElementById('upper-div-checkbox').checked;
    var lowerDivision = document.getElementById('lower-div-checkbox').checked;
    var graduate = document.getElementById('graduate-checkbox').checked;
    var classesToInclude = document.getElementById('departmentsInclude').value;
    var classesToExclude = document.getElementById('departmentsExclude').value;
    // var numberOfResults = document.getElementById('results-number-select').value;
    var selectedButton = document.querySelector('.number-button.selected');
    var numberOfResults = selectedButton ? selectedButton.value : '10'; // Default to 10 if none is selected
    var filterParams = {
        query: query,
        upperDivision: upperDivision,
        lowerDivision: lowerDivision,
        graduate: graduate,
        include: classesToInclude,
        exclude: classesToExclude,
        k: numberOfResults,
    };

    console.log(filterParams)

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterParams),
    })
    .then(response => response.json())
    .then(data => {
        console.log(2)
        display(data); // Call the display function with the filtered data
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function display(data) {
    var resultsDiv = document.getElementById('results');
    console.log(1)
    console.log(data)

    resultsDiv.innerHTML = '';

    resultsDiv.innerHTML += `
        <div class="result-box">
            <span class="class-code">Course Code </span>
            <span class="class-title">Course Title</span>
            <div class="class-description">Course Description</div>
            <div class="class-prerequisites">Course Requirements</div>
            <div class="feedback">Feedback</div>
        </div>`;

    data.forEach(function(item){
        // Assuming each 'item' is an array with three elements
        let classCode = item[0]; // Class code
        let classTitle = item[1]; // Class title
        let classDescription = item[2]; // Class description
        let classPrerequisites = item[3]; // Prereqs

        if (classPrerequisites==null){
            classPrerequisites = "no prequisites required";
        } 

        resultsDiv.innerHTML += `
            <div class="result-box">
                <span class="class-code">${classCode}</span>
                <span class="class-title">${classTitle}</span>
                <div class="class-description">${classDescription}</div>
                <div class="class-prerequisites">${classPrerequisites}</div>
                <div class="feedback">
                    <button class="circle-btn green"><i class="fas fa-thumbs-up"></i></button>
                    <button class="circle-btn red"><i class="fas fa-thumbs-down"></i></button>
                </div>
            </div>`;
    });
}