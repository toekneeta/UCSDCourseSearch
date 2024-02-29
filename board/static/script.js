const dropdownContent = document.getElementById("dropdownContent")
  , searchInput = document.getElementById("search-input")
  , resultsDiv = document.getElementById("results");
function toggleDropdown() {
    dropdownContent.style.display = "block" === dropdownContent.style.display ? "none" : "block"
}
function highlightFeedbackButton(e) {
    e.style.backgroundColor = "rgb(14, 152, 186)"
}
function debounce(e, t, n) {
    let c;
    return function() {
        const o = this
          , s = arguments
          , l = n && !c;
        clearTimeout(c),
        c = setTimeout((function() {
            c = null,
            n || e.apply(o, s)
        }
        ), t),
        l && e.apply(o, s)
    }
}
function logFeedback(e=null) {
    // console.log('logged')
    const t = gatherEventData(e ? e.closest(".result-box") : document.querySelector(".result-box"), e);
    fetch("/log-feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(t)
    }).then((e=>e.json())).catch((e=>console.error("Error:", e)))
}
function gatherEventData(e, t=null, l=null) {
    let n = "";
    t && (t.classList.contains("green") ? (n = "Thumbs Up",
    highlightFeedbackButton(t)) : t.classList.contains("red") ? (n = "Thumbs Down",
    highlightFeedbackButton(t)) : "copy" === t.dataset.buttonType && (n = "Copy"));
    if (l){
        n = "Link Clicked"
    };
    const c = e ? parseInt(e.getAttribute("data-index"), 10) + 1 : -1;
    
    return {
        Query: searchInput.value,
        ClassCode: e ? e.querySelector(".class-code").textContent.trim() : "",
        ClassTitle: e ? e.querySelector(".class-title").textContent.trim() : "",
        NumberOfResults: document.querySelector(".number-button.selected") ? document.querySelector(".number-button.selected").value : "",
        SpringOnly: document.getElementById("spring-courses-checkbox").checked,
        UpperDivision: document.getElementById("upper-div-checkbox").checked,
        LowerDivision: document.getElementById("lower-div-checkbox").checked,
        Graduate: document.getElementById("graduate-checkbox").checked,
        Include: document.getElementById("departmentsInclude").value,
        Exclude: document.getElementById("departmentsExclude").value,
        ButtonType: n,
        ResultIndex: c,
    };
};

function sendSearch() {
    if (!searchInput.value.trim())
        return;
    const e = {
        query: searchInput.value,
        springOnly: document.getElementById("spring-courses-checkbox").checked,
        upperDivision: document.getElementById("upper-div-checkbox").checked,
        lowerDivision: document.getElementById("lower-div-checkbox").checked,
        graduate: document.getElementById("graduate-checkbox").checked,
        include: document.getElementById("departmentsInclude").value,
        exclude: document.getElementById("departmentsExclude").value,
        k: document.querySelector(".number-button.selected") ? document.querySelector(".number-button.selected").value : "10"
    };
    fetch("/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(e)
    }).then((e=>e.json())).then((e=>{
        display(e),
        logFeedback()
    }
    )).catch((e=>console.error("Error:", e)))
}
function display(e) {
    resultsDiv.innerHTML = '\n    <div class="result-box">\n        <span class="class-code">Course Code </span>\n        <span class="class-title">Course Title</span>\n        <div class="class-description">Course Description</div>\n        <div class="class-prerequisites">Course Requirements</div>\n        <div class="feedback">Relevant Result?</div>\n    </div>',
    e.forEach((function(e, t) {
        const n = createResultBox(e, t);
        resultsDiv.insertAdjacentHTML("beforeend", n)
    }
    ))
}
function createResultBox(e, t) {
    const [n,c,o,s,l,a] = e
      , r = null === s || "none" === s ? "No requirements." : s
      , d = "T" === a ? "spring" : "";
    return `<div class="${d ? "result-box spring" : "result-box"}" data-index="${t}">\n                <span class="class-code ${d}">\n                    ${classCodeLink(n, l, d)}\n                    <button class="copy-btn action-btn" data-button-type="copy" data-class-code="${n}" title="Copy Class Code">\n                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M216 28H88a12 12 0 0 0-12 12v36H40a12 12 0 0 0-12 12v128a12 12 0 0 0 12 12h128a12 12 0 0 0 12-12v-36h36a12 12 0 0 0 12-12V40a12 12 0 0 0-12-12m-60 176H52V100h104Zm48-48h-24V88a12 12 0 0 0-12-12h-68V52h104Z"/></svg>\n                    </button>\n                </span>\n                <span class="class-title ${d}">${c}</span>\n                <div class="class-description ${d}">${o}</div>\n                <div class="class-prerequisites ${d}">${r}</div>\n                <div class="feedback">\n                    <button class="circle-btn green action-btn">\n                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M1 21h4V9H1zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57l.03-.32c0-.41-.17-.79-.44-1.06L14.17 1L7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73z"/></svg>\n                    </button>\n                    <button class="circle-btn red action-btn">\n                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="white" d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57l-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2m4 0v12h4V3z"/></svg>\n                    </button>\n                </div>\n            </div>`
}
function classCodeLink(e, t, n) {
    return `<a href="${t}" target="_blank" class="custom-link ${n}">${e}</a>`
}
function copyTextFallback(e, t) {
    const n = document.createElement("textarea");
    n.style.position = "fixed",
    n.style.top = "0",
    n.style.left = "-9999px",
    n.style.opacity = "0",
    n.setAttribute("readonly", ""),
    n.value = e,
    document.body.appendChild(n),
    n.select(),
    n.setSelectionRange(0, 99999);
    try {
        document.execCommand("copy") && (t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>')
    } catch (e) {
        console.error("Fallback: Oops, unable to copy", e)
    }
    document.body.removeChild(n)
}
document.addEventListener("DOMContentLoaded", (function() {
    dropdownContent.addEventListener("click", (function(e) {
        if (e.target.classList.contains("number-button")) {
            e.currentTarget.querySelectorAll(".number-button").forEach((e=>e.classList.remove("selected"))),
            e.target.classList.add("selected"),
            sendSearch()
        }
    }
    )),
    dropdownContent.addEventListener("change", (function(e) {
        "checkbox" === e.target.type && sendSearch()
    }
    ));
    dropdownContent.querySelectorAll("textarea").forEach((function(e) {
        e.addEventListener("input", debounce(sendSearch, 500))
    }
    )),
    searchInput.addEventListener("keypress", (function(e) {
        "Enter" === e.key && (e.preventDefault(),
        sendSearch())
    }
    )),
    resultsDiv.addEventListener("click", (function(e) {
        logFeedback(e.target.closest("button"))
    }
    ))
}
)),
document.querySelectorAll('.custom-link').forEach(link => {
    link.addEventListener('click', function(e) {
        logFeedback(this);
    });
});
document.addEventListener("click", (function(e) {
    let t = e.target;
    for (; t && (!t.classList || !t.classList.contains("copy-btn")); )
        t = t.parentNode;
    if (t && t.classList.contains("copy-btn")) {
        const e = t.getAttribute("data-class-code");
        navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(e).then((()=>{
            t.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/></svg>'
        }
        )).catch((n=>{
            copyTextFallback(e, t)
        }
        )) : copyTextFallback(e, t)
    }
}));
