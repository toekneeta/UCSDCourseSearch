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

    resultsDiv.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        logFeedback(button)
    });
});

function highlightFeedbackButton(button) {
    button.style.backgroundColor = 'rgb(14, 152, 186)';
};

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

function logFeedback(button = null) {
    const resultBox = button ? button.closest('.result-box') : document.querySelector('.result-box');
    // Event data
    const eventData = gatherEventData(resultBox, button);
    // console.log(eventData)
    // Endpoint URL
    // const endpointUrl = button ? '/log-feedback' : '/log-query';
    const endpointUrl = '/log-feedback';
    // Send the data to the backend
    fetch(endpointUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
    })
    .then(response => response.json())
    .then(data => console.log('Event logged:', data))
    .catch((error) => console.error('Error:', error));
}

function gatherEventData(resultBox, button = null) {
    let buttonType = '';
    if (button) {
        // Determine the button type
        if (button.classList.contains('green')) {
            buttonType = 'Thumbs Up';
            highlightFeedbackButton(button);
        } else if (button.classList.contains('red')) {
            buttonType = 'Thumbs Down';
            highlightFeedbackButton(button);
        } else if (button.dataset.buttonType === 'copy') {
            buttonType = 'Copy';
        }
    }
    const resultIndex = resultBox ? parseInt(resultBox.getAttribute('data-index'), 10) + 1 : -1;
    return {
        Query: searchInput.value, // Assumes `searchInput` is globally accessible
        ClassCode: resultBox ? resultBox.querySelector('.class-code').textContent.trim() : '',
        ClassTitle: resultBox ? resultBox.querySelector('.class-title').textContent.trim() : '',
        NumberOfResults: document.querySelector('.number-button.selected') ? document.querySelector('.number-button.selected').value : '',
        SpringOnly: document.getElementById('spring-courses-checkbox').checked,
        UpperDivision: document.getElementById('upper-div-checkbox').checked,
        LowerDivision: document.getElementById('lower-div-checkbox').checked,
        Graduate: document.getElementById('graduate-checkbox').checked,
        Include: document.getElementById('departmentsInclude').value,
        Exclude: document.getElementById('departmentsExclude').value,
        ButtonType: buttonType, // This will be an empty string if no button is involved
        ResultIndex: resultIndex
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
        logFeedback();
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
        <div class="feedback">Rate</div>
    </div>`;
    data.forEach(function(item, index) {
        const resultHTML = createResultBox(item, index); // Pass index to createResultBox
        resultsDiv.insertAdjacentHTML('beforeend', resultHTML);
    });
}
function createResultBox(item, index) {
    const [classCode, classTitle, classDescription, classPrerequisites, capesURL, spring] = item;
    const prerequisitesText = classPrerequisites === null || classPrerequisites === 'none' ? "No requirements." : classPrerequisites;
    const springClass = spring === "T" ? 'spring' : '';
    return `<div class="${springClass ? 'result-box spring' : 'result-box'}" data-index="${index}">
                <span class="class-code ${springClass}">
                    ${classCodeLink(classCode, capesURL, springClass)}
                    <button class="copy-btn action-btn" data-button-type="copy" data-class-code="${classCode}" title="Copy Class Code">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z"/></svg>
                    </button>
                </span>
                <span class="class-title ${springClass}">${classTitle}</span>
                <div class="class-description ${springClass}">${classDescription}</div>
                <div class="class-prerequisites ${springClass}">${prerequisitesText}</div>
                <div class="feedback">
                    <button class="circle-btn green action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M1 21h4V9H1zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57l.03-.32c0-.41-.17-.79-.44-1.06L14.17 1L7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73z"/></svg>
                    </button>
                    <button class="circle-btn red action-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57l-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2m4 0v12h4V3z"/></svg>
                    </button>
                </div>
            </div>`;
}

function classCodeLink(classCode, capesURL, springClass) {
    return `<a href="${capesURL}" target="_blank" class="custom-link ${springClass}">${classCode}</a>`;
}

document.addEventListener('click', function(e) {
    let target = e.target;
    // Ensure that target is not null and check for the 'copy-btn' class
    while (target && !(target.classList && target.classList.contains('copy-btn'))) {
        target = target.parentNode;
    }

    // Proceed if target is not null and has 'copy-btn' class
    if (target && target.classList.contains('copy-btn')) {
        const classCode = target.getAttribute('data-class-code');
        navigator.clipboard.writeText(classCode).then(() => {
            // Change the SVG icon inside the button to indicate success
            target.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>';
        }).catch(err => {
            console.error('Error copying to clipboard: ', err);
        });
    }
});
