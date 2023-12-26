// Get the lists
const emergencyList = document.getElementById('emergencyList');
const sameDayList = document.getElementById('sameDayList');

// Add click event listeners to the lists
emergencyList.addEventListener('click', handleItemClick);
sameDayList.addEventListener('click', handleItemClick);

function handleItemClick(event) {
    // Check if the clicked element is an anchor
    if (event.target.tagName === 'A') {
        // Get the href attribute of the clicked anchor
        const clickedItem = event.target.getAttribute('href');
        alert(`Pressed item: ${clickedItem}`);
    }
}

// Function to add items to the list
function addItemToList(listId, link, text) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.textContent = text;
    anchor.target = "_blank"
    listItem.appendChild(anchor);
    list.appendChild(listItem);
}

let isTimerUpdated = false;

// Add items to the Emergency list
addItemToList('emergencyList', 'https://www.google.com', 'Google');
addItemToList('emergencyList', 'https://www.example.com', 'Example');

// Add items to the Same Day list
addItemToList('sameDayList', 'https://www.apple.com', 'Apple');
addItemToList('sameDayList', 'https://www.microsoft.com', 'Microsoft');


document.getElementById('timeLink').addEventListener('click', onTimeClick);

function onTimeClick() {
    if (!isTimerUpdated) {
        isTimerUpdated = true;
        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls-container');
        controlsContainer.setAttribute('id','timerId');
    
        // Create a new input control
        const inputControl = document.createElement('input');
        inputControl.placeholder = 'Enter time...';
        inputControl.type = 'text'; // Use 'text' to allow pattern validation
        inputControl.value = 10;
    
        // Validate and sanitize input on each change
        inputControl.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, ''); // Allow only numeric input
        });
    
        // Create a div for vertical alignment
        const inputButtonsContainer = document.createElement('div');
    
        // Create two buttons (check and cross)
        const checkButton = document.createElement('button');
        checkButton.innerHTML = 'Save';
        checkButton.classList.add('button-save'); // Add a class for styling
        checkButton.addEventListener('click', onTimerSave);
    
        const crossButton = document.createElement('button');
        crossButton.innerHTML = 'Cancel';
        crossButton.classList.add('button-cancel'); // Add a class for styling
        crossButton.addEventListener('click', onTimerCancel);
    
        // Append the input control to the container
        controlsContainer.appendChild(inputControl);
    
        // Append buttons to the buttons container
        inputButtonsContainer.appendChild(checkButton);
        inputButtonsContainer.appendChild(crossButton);
    
        // Append the buttons container to the main container
        controlsContainer.appendChild(inputButtonsContainer);
    
        // Append the container to the body
        document.body.appendChild(controlsContainer);
    
        // Disable other controls
        disableControls();
    } else {
        document.getElementById('timerId').style.display = 'block';
        disableControls();
    }
}

function onTimerSave() {
    document.getElementById('timerId').style.display = 'none';
    enableControls();
}

function onTimerCancel() {
    document.getElementById('timerId').style.display = 'none';
    enableControls();
}


function disableControls() {
    // Disable other controls as needed
    document.getElementById('activitiesSection').style.display = 'none';
    document.getElementById('nav').style.display = 'none';
}

function enableControls() {
    // Enable other controls as needed
    document.getElementById('activitiesSection').style.display = 'block';
    document.getElementById('nav').style.display = 'block';
}