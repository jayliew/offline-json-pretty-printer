let uniqueId = 0;
let lastJsonObj = null;

document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const interpretNewlines = document.getElementById('interpretNewlines');
    const submitBtn = document.getElementById('submitBtn');

    jsonInput.addEventListener('input', updateOutput);
    interpretNewlines.addEventListener('change', updateOutput);
    submitBtn.addEventListener('click', updateOutput);
});

function updateOutput() {
    const input = document.getElementById('jsonInput').value;
    const output = document.getElementById('output');
    const interpretNewlines = document.getElementById('interpretNewlines').checked;
    uniqueId = 0;
    
    if (!input.trim()) {
        output.innerHTML = '';
        return;
    }

    try {
        const jsonObj = JSON.parse(input);
        lastJsonObj = jsonObj;
        output.innerHTML = formatJSON(jsonObj, 0, interpretNewlines);
        addClickListeners();
    } catch (e) {
        output.innerHTML = 'Invalid JSON: ' + e.message;
        output.style.color = 'red';
    }
}

function formatJSON(obj, indentLevel, interpretNewlines) {
    const indent = '  '.repeat(indentLevel);
    let html = '';

    if (typeof obj !== 'object' || obj === null) {
        let valueStr = JSON.stringify(obj);
        if (interpretNewlines && typeof obj === 'string') {
            valueStr = `"${obj.replace(/\n/g, '<br>')}"`;
        }
        return `<span class="json-value">${valueStr}</span>`;
    }

    for (const [key, value] of Object.entries(obj)) {
        const currentId = uniqueId++;
        html += `${indent}<span class="json-key" data-id="${currentId}">${key}</span>: `;
        
        if (typeof value === 'object' && value !== null) {
            html += `\n${formatJSON(value, indentLevel + 1, interpretNewlines)}`;
        } else {
            let valueStr = JSON.stringify(value);
            if (interpretNewlines && typeof value === 'string') {
                valueStr = `"${value.replace(/\n/g, '<br>')}"`;
            }
            html += `<span class="json-value" data-id="${currentId}">${valueStr}</span>\n`;
        }
    }

    return html;
}

function addClickListeners() {
    const keys = document.getElementsByClassName('json-key');
    Array.from(keys).forEach(key => {
        key.addEventListener('click', function() {
            const value = this.parentElement.querySelector(`.json-value[data-id="${this.dataset.id}"]`);
            if (value) {
                value.classList.toggle('hidden');
            }
        });
    });
}