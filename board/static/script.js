function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

// Selecting number of results (only 1 can be selected at a time)
document.addEventListener('DOMContentLoaded', function() {
    var buttons = document.querySelectorAll('.number-button');

    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove 'selected' class from all buttons
            buttons.forEach(btn => btn.classList.remove('selected'));

            // Add 'selected' class to the clicked button
            button.classList.add('selected');
        });
    });
});

// Enter also runs search
document.getElementById("search-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default action to avoid form submission (if applicable)
        sendSearch();
    }
});

// Changing filters will run search
document.addEventListener('DOMContentLoaded', function() {
    var dropdownContent = document.getElementById('dropdownContent');

    // Add event listener for checkbox changes
    var checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.addEventListener('change', sendSearch);
    });

    // Add event listener for button clicks within the number-select button group
    var numberButtons = dropdownContent.querySelectorAll('.number-button');
    numberButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            numberButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');

            sendSearch();
        });
    });

    // Add event listener for text input changes with debouncing
    var textAreas = dropdownContent.querySelectorAll('textarea');
    textAreas.forEach(function(textArea) {
        textArea.addEventListener('input', debounce(sendSearch, 500)); // Adjust the delay as needed
    });
});

// Debounce function
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Logging feedback from buttons
document.addEventListener('click', function(event) {
    var button = event.target.closest('button');
    if (button && button.classList.contains('circle-btn') && button.closest('.result-box')) {
        logFeedback(button);
    }
});

function logFeedback(button) {
    // Find the parent result-box of the clicked button
    var resultBox = button.closest('.result-box');

    // Get the class code and title from the result box as well as the query
    var classCode = resultBox.querySelector('.class-code').textContent;
    var classTitle = resultBox.querySelector('.class-title').textContent;
    var query = document.getElementById('search-input').value;
    // additional information
    var springOnly = document.getElementById('spring-courses-checkbox').checked;
    var upperDivision = document.getElementById('upper-div-checkbox').checked;
    var lowerDivision = document.getElementById('lower-div-checkbox').checked;
    var graduate = document.getElementById('graduate-checkbox').checked;
    var classesToInclude = document.getElementById('departmentsInclude').value;
    var classesToExclude = document.getElementById('departmentsExclude').value;
    var numberOfResults = document.querySelector('.number-button.selected').value;

    // Determine whether the green or red button was clicked
    var buttonType = button.classList.contains('green') ? 'Green' : 'Red'; 

    // Change the button color to blue to show it was clicked
    button.style.backgroundColor = 'rgb(14, 152, 186)';

    // Prepare the data to be sent
    var feedbackData = {
        Query: query,
        ClassCode: classCode,
        ClassTitle: classTitle,
        NumberOfResults: numberOfResults,
        SpringOnly: springOnly,
        UpperDivision: upperDivision,
        LowerDivision: lowerDivision,
        Graduate: graduate,
        Include: classesToInclude,
        Exclude: classesToExclude,
        ButtonType: buttonType,
    };
    
    // Send the data to the Flask backend
    fetch('/log-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
    })
    .then(response => response.json())
    .then(data => console.log('Feedback logged:', data))
    .catch((error) => console.error('Error:', error));
}

function sendSearch() {
    var query = document.getElementById('search-input').value;
    var springOnly = document.getElementById('spring-courses-checkbox').checked;
    var upperDivision = document.getElementById('upper-div-checkbox').checked;
    var lowerDivision = document.getElementById('lower-div-checkbox').checked;
    var graduate = document.getElementById('graduate-checkbox').checked;
    var classesToInclude = document.getElementById('departmentsInclude').value;
    var classesToExclude = document.getElementById('departmentsExclude').value;
    var selectedButton = document.querySelector('.number-button.selected');
    var numberOfResults = selectedButton ? selectedButton.value : '10'; // Default to 10 if none is selected
    var filterParams = {
        query: query,
        springOnly: springOnly,
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
        display(data); // Call the display function with the filtered data
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function display(data) {
    // Add the initial entry to the beginning of the data array

    var resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
    <div class="result-box">
        <span class="class-code">Course Code </span>
        <span class="class-title">Course Title</span>
        <div class="class-description">Course Description</div>
        <div class="class-prerequisites">Course Requirements</div>
        <div class="feedback"></div>
    </div>`;
    
    data.forEach(function(item) {
        let classCode = item[0]; 
        let classTitle = item[1]; 
        let classDescription = item[2]; 
        let classPrerequisites = item[3] == null || item[3] == 'none' ? "No requirements." : item[3]; // Simplified prerequisites fallback
        let capesURL = item[4]; 
        let spring = item[5]; 

        let resultBoxClass = spring == "T" ? 'result-box spring' : 'result-box';
        let classCodeLink = `<a href="${capesURL}" target="_blank" class="custom-link ${spring == "T" ? 'spring' : ''}">${classCode}</a>`;

        resultsDiv.innerHTML += `
        <div class="${resultBoxClass}">
            <span class="class-code ${spring == "T" ? 'spring' : ''}">${classCodeLink}</span>
            <span class="class-title ${spring == "T" ? 'spring' : ''}">${classTitle}</span>
            <span class="class-description ${spring == "T" ? 'spring' : ''}">${classDescription}</span>
            <div class="class-prerequisites ${spring == "T" ? 'spring' : ''}">${classPrerequisites}</div>
            <div class="feedback">
                <button class="circle-btn green"><i class="fas fa-thumbs-up"></i></button>
                <button class="circle-btn red"><i class="fas fa-thumbs-down"></i></button>
        </div>`;
    });
}
