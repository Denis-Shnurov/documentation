// Signature calculator logic for Tailwind-based API docs
// Supports dynamic field addition, signature calculation (HMAC-SHA256), and result display

// Polyfill for crypto.subtle in browsers that don't support it (e.g. some mobile Safari)
if (!window.crypto?.subtle) {
  alert('Ваш браузер не поддерживает Web Crypto API для расчёта подписи. Пожалуйста, используйте современный браузер.');
}

// Helper: converts string to ArrayBuffer
function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Helper: ArrayBuffer to hex string
function ab2hex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(x => x.toString(16).padStart(2, "0")).join("");
}

// Dynamic additional fields
document.addEventListener('DOMContentLoaded', function() {
  // --- Dynamic fields ---
  const addFieldBtn = document.getElementById('add-field-btn');
  const fieldSelector = document.getElementById('field-selector');
  const optionalFieldsContainer = document.getElementById('optional-fields-container');
  if (addFieldBtn && fieldSelector && optionalFieldsContainer) {
    addFieldBtn.addEventListener('click', () => {
      const val = fieldSelector.value;
      if (!val) return;
      // Prevent duplicates
      if (optionalFieldsContainer.querySelector(`[name="${val}"]`)) return;
      const label = fieldSelector.options[fieldSelector.selectedIndex].text;
      const div = document.createElement('div');
      div.className = "mb-2";
      div.innerHTML = `<label class="font-semibold">${label}:</label>
        <input name="${val}" type="text" class="form-input rounded-md border-brand-200 bg-brand-50 w-full max-w-xs ml-2 mb-1" />
        <button type="button" class="inline text-brand-400 hover:text-red-400 ml-2 remove-opt-field">&times;</button>`;
      optionalFieldsContainer.appendChild(div);
      div.querySelector('.remove-opt-field').onclick = () => div.remove();
    });
  }

  // --- Signature calculation ---
  const calcBtn = document.getElementById('calculate-signature-btn');
  const secretKeyInput = document.getElementById('secret_key');
  const resultEl = document.getElementById('result');
  if (calcBtn && secretKeyInput && resultEl) {
    calcBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Gather all fields in order: merchant, amount, order_id, description, success_url, unix_timestamp + optional
      const fields = ['merchant', 'amount', 'order_id', 'description', 'success_url', 'unix_timestamp'];
      let stringToSign = '';
      for (let name of fields) {
        const el = document.getElementById(name);
        if (!el || !el.value) return resultEl.textContent = `Поле ${name} обязательно`;
        stringToSign += el.value;
      }
      // Add optionals (in DOM order)
      const optInputs = optionalFieldsContainer.querySelectorAll("input[name]");
      for (let input of optInputs) {
        stringToSign += input.value;
      }
      const secret = secretKeyInput.value;
      if (!secret || !stringToSign) {
        resultEl.textContent = "Введите secret_key и все обязательные поля";
        return;
      }
      // HMAC-SHA256
      try {
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
        const sig = await crypto.subtle.sign("HMAC", key, enc.encode(stringToSign));
        resultEl.textContent = `Signature: ${ab2hex(sig)}`;
        resultEl.className = "text-brand-700 font-mono my-2";
      } catch (err) {
        resultEl.textContent = "Ошибка вычисления подписи: " + err;
        resultEl.className = "text-red-600";
      }
    });
  }
});