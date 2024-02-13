// Cache frequently accessed DOM elements
const dropdownContent = document.getElementById("dropdownContent");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById('results');

// Toggle dropdown visibility
function toggleDropdown() {
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

document.addEventListener('DOMContentLoaded', function() {
    // Combined event listener for buttons, checkboxes, and text input changes
    dropdownContent.addEventListener('click', function(event) {
        if (event.target.classList.contains('number-button')) {
            const buttons = event.currentTarget.querySelectorAll('.number-button');
            buttons.forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            sendSearch();
        }
    });

    dropdownContent.addEventListener('change', function(event) {
        if (event.target.type === "checkbox") {
            sendSearch();
        }
    });

    // Debounce input event for text areas
    const textAreas = dropdownContent.querySelectorAll('textarea');
    textAreas.forEach(function(textArea) {
        textArea.addEventListener('input', debounce(sendSearch, 500));
    });

    // Enter key press event on search input
    searchInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendSearch();
        }
    });

    // Logging feedback from buttons with delegation
    resultsDiv.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        if (button && button.classList.contains('circle-btn')) {
            // Highlight the button to indicate it has been clicked
            highlightFeedbackButton(button);
            logFeedback(button);
        }
    });
    
    function highlightFeedbackButton(button) {
        // Remove previous highlights if any
        const feedbackButtons = button.closest('.feedback').querySelectorAll('button');
        feedbackButtons.forEach(btn => {
            // Reset to default color or remove custom classes here if needed
            btn.classList.remove('clicked'); // Assuming 'clicked' is a custom class indicating the button was pressed
        });
    
        // Changing color
        button.style.backgroundColor = 'rgb(14, 152, 186)';
    }
});

// Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function logFeedback(button) {
    const resultBox = button.closest('.result-box');
    const classCode = resultBox.querySelector('.class-code').textContent;
    const classTitle = resultBox.querySelector('.class-title').textContent;
    const query = searchInput.value;
    // Additional information
    const feedbackData = gatherFeedbackData(resultBox, button, query);

    // Send the data to the backend
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

function gatherFeedbackData(resultBox, button, query) {
    return {
        Query: query,
        ClassCode: resultBox.querySelector('.class-code').textContent,
        ClassTitle: resultBox.querySelector('.class-title').textContent,
        NumberOfResults: document.querySelector('.number-button.selected').value,
        SpringOnly: document.getElementById('spring-courses-checkbox').checked,
        UpperDivision: document.getElementById('upper-div-checkbox').checked,
        LowerDivision: document.getElementById('lower-div-checkbox').checked,
        Graduate: document.getElementById('graduate-checkbox').checked,
        Include: document.getElementById('departmentsInclude').value,
        Exclude: document.getElementById('departmentsExclude').value,
        ButtonType: button.classList.contains('green') ? 'Green' : 'Red',
    };
}

function sendSearch() {
    const filterParams = {
        query: searchInput.value,
        springOnly: document.getElementById('spring-courses-checkbox').checked,
        upperDivision: document.getElementById('upper-div-checkbox').checked,
        lowerDivision: document.getElementById('lower-div-checkbox').checked,
        graduate: document.getElementById('graduate-checkbox').checked,
        include: document.getElementById('departmentsInclude').value,
        exclude: document.getElementById('departmentsExclude').value,
        k: document.querySelector('.number-button.selected') ? document.querySelector('.number-button.selected').value : '10',
    };

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
    .catch((error) => console.error('Error:', error));
}

function display(data) {
    resultsDiv.innerHTML = `
    <div class="result-box">
        <span class="class-code">Course Code </span>
        <span class="class-title">Course Title</span>
        <div class="class-description">Course Description</div>
        <div class="class-prerequisites">Course Requirements</div>
        <div class="feedback"></div>
    </div>`;
    data.forEach(function(item) {
        resultsDiv.innerHTML += createResultBox(item);
    });
}

function createResultBox(item) {
    const [classCode, classTitle, classDescription, classPrerequisites, capesURL, spring] = item;
    const prerequisitesText = classPrerequisites === null || classPrerequisites === 'none' ? "No requirements." : classPrerequisites;
    const springClass = spring === "T" ? 'spring' : '';

    return `<div class="${springClass ? 'result-box spring' : 'result-box'}">
                <span class="class-code ${springClass}">${classCodeLink(classCode, capesURL, springClass)}</span>
                <span class="class-title ${springClass}">${classTitle}</span>
                <div class="class-description ${springClass}">${classDescription}</div>
                <div class="class-prerequisites ${springClass}">${prerequisitesText}</div>
                <div class="feedback">
                    <button class="circle-btn green"><i class="fas fa-thumbs-up"></i></button>
                    <button class="circle-btn red"><i class="fas fa-thumbs-down"></i></button>
                </div>
            </div>`;
}

function classCodeLink(classCode, capesURL, springClass) {
    return `<a href="${capesURL}" target="_blank" class="custom-link ${springClass}">${classCode}</a>`;
}