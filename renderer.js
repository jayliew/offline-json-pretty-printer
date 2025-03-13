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
        if (typeof obj === 'string') {
            // Remove quotes around the string
            valueStr = valueStr.substring(1, valueStr.length - 1);
            // Escape HTML special characters
            valueStr = valueStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Handle newlines based on checkbox state
            if (interpretNewlines) {
                valueStr = valueStr.replace(/\\n/g, '<br />');
            }
            
            // Add quotes back
            valueStr = `"${valueStr}"`;
        }
        return `<span class="json-value">${valueStr}</span>`;
    }

    for (const [key, value] of Object.entries(obj)) {
        const currentId = uniqueId++;
        // Escape HTML special characters in keys
        const safeKey = key.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `${indent}<span class="json-key" data-id="${currentId}">${safeKey}</span>: `;
        
        if (typeof value === 'object' && value !== null) {
            html += `\n${formatJSON(value, indentLevel + 1, interpretNewlines)}`;
        } else {
            let valueStr = JSON.stringify(value);
            if (typeof value === 'string') {
                // Remove quotes around the string
                valueStr = valueStr.substring(1, valueStr.length - 1);
                // Escape HTML special characters
                valueStr = valueStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                // Handle newlines based on checkbox state
                if (interpretNewlines) {
                    valueStr = valueStr.replace(/\\n/g, '<br />');
                }
                
                // Add quotes back
                valueStr = `"${valueStr}"`;
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