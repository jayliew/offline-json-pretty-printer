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

            // Handle newlines and tabs based on checkbox state
            if (interpretNewlines) {
                valueStr = valueStr.replace(/\\n/g, '<br />');
                valueStr = valueStr.replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Added tab replacement
            }

            // Add quotes back
            valueStr = `"${valueStr}"`;
        }
        return `<span class="json-value">${valueStr}</span>`;
    }

    if (Array.isArray(obj)) {
        html += '[\n';
        obj.forEach((item, index) => {
            html += `${indent}  ${formatJSON(item, indentLevel + 1, interpretNewlines)}`;
            if (index < obj.length - 1) {
                html += ',\n';
            } else {
                html += '\n';
            }
        });
        html += `${indent}]`;
    } else { // Object
        html += '{\n';
        const entries = Object.entries(obj);
        entries.forEach(([key, value], index) => {
            const currentId = uniqueId++;
            // Escape HTML special characters in keys
            const safeKey = key.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `${indent}  <span class="json-key collapsible" data-id="${currentId}">"${safeKey}"</span>: `;

            if (typeof value === 'object' && value !== null) {
                html += `<span class="json-value collapsible-content" data-id="${currentId}">${formatJSON(value, indentLevel + 1, interpretNewlines)}</span>`;
            } else {
                let valueStr = JSON.stringify(value);
                const valueType = typeof value === 'string' ? 'json-string' :
                                  typeof value === 'number' ? 'json-number' :
                                  typeof value === 'boolean' ? 'json-boolean' :
                                  value === null ? 'json-null' : 'json-value';

                if (typeof value === 'string') {
                    // Remove quotes around the string
                    valueStr = valueStr.substring(1, valueStr.length - 1);
                    // Escape HTML special characters
                    valueStr = valueStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');

                    // Handle newlines and tabs based on checkbox state
                    if (interpretNewlines) {
                        valueStr = valueStr.replace(/\\n/g, '<br />');
                        valueStr = valueStr.replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Added tab replacement
                    }

                    // Add quotes back
                    valueStr = `"${valueStr}"`;
                }
                html += `<span class="${valueType} json-value collapsible-content" data-id="${currentId}">${valueStr}</span>`;
            }

            if (index < entries.length - 1) {
                html += ',\n';
            } else {
                html += '\n';
            }
        });
        html += `${indent}}`;
    }


    return html;
}

function addClickListeners() {
    const keys = document.querySelectorAll('.json-key.collapsible');
    keys.forEach(key => {
        // Remove existing listeners to prevent duplicates if updateOutput is called multiple times
        key.replaceWith(key.cloneNode(true));
    });
    // Re-query after cloning
    document.querySelectorAll('.json-key.collapsible').forEach(key => {
        key.addEventListener('click', function() {
            const content = this.parentElement.querySelector(`.collapsible-content[data-id="${this.dataset.id}"]`);
            if (content) {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? '' : 'none';
                 // Optionally toggle a class for styling expansion state
                this.classList.toggle('collapsed', !isHidden);
            }
        });
         // Initially collapse objects/arrays
        const content = key.parentElement.querySelector(`.collapsible-content[data-id="${key.dataset.id}"]`);
        if (content && (content.textContent.trim().startsWith('{') || content.textContent.trim().startsWith('['))) {
           content.style.display = 'none';
           key.classList.add('collapsed');
        }
    });
}