// Get_Unix_time
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('set-current-timestamp');
  const input = document.getElementById('unix_timestamp');
  if (btn && input) {
    btn.addEventListener('click', function () {
      input.value = Math.floor(Date.now() / 1000);
    });
  }
});

// ====== Base64 and SHA1 helpers ======
// Base64 encode (UTF-8)
function b64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// SHA1 hex digest
async function sha1Hex(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(x => x.toString(16).padStart(2, "0")).join("");
}

// Новый алгоритм signature — как в Node.js примере из документации
async function calcSignature(secretKey, allFields) {
  // 1. Исключаем signature и пустые значения
  const filtered = Object.entries(allFields)
    .filter(([k, v]) => k !== "signature" && v !== "");
  // 2. Сортируем по ключу
  filtered.sort(([a], [b]) => a.localeCompare(b));
  // 3. Формируем строку key=base64(value)&...
  const joined = filtered.map(([k, v]) => `${k}=${b64(v)}`).join("&");
  // 4. Двойное sha1
  const inner = await sha1Hex(secretKey + joined);
  const outer = await sha1Hex(secretKey + inner);
  return outer;
}

// Получение всех полей формы
function getAllFormFields(form) {
  const data = {};
  // input, select, textarea
  form.querySelectorAll("input[name],select[name],textarea[name]").forEach(el => {
    if (el.type === "checkbox" || el.type === "radio") {
      if (el.checked) data[el.name] = el.value;
    } else {
      data[el.name] = el.value;
    }
  });
  return data;
}

// Lookup table for dynamic fields: { param: {label, maxlength, pattern, tip} }
const FIELD_META = {
  custom_order_id: {
    label: "Custom Order ID",
    maxlength: 50,
    tip: "Строка, максимум 50 символов.",
    pattern: "",
  },
  testing: {
    label: "Testing",
    type: "select",
    tip: "Логическое значение: 1 — тест, 0 — реальный платеж.",
    options: [
      { value: "1", text: "Тестовый платеж (1)" },
      { value: "0", text: "Реальный платеж (0)" },
    ],
  },
  callback_url: {
    label: "Callback URL",
    maxlength: 128,
    tip: "Строка, максимум 128 символов.",
    pattern: "",
  },
  callback_on_failure: {
    label: "Callback on Failure",
    type: "select",
    tip: "Логическое значение: 1 — отправлять, 0 — не отправлять.",
    options: [
      { value: "1", text: "Отправлять (1)" },
      { value: "0", text: "Не отправлять (0)" },
    ],
  },
  client_phone: {
    label: "Client Phone",
    maxlength: 15,
    tip: "Телефон, максимум 15 символов. Пример: +75559091555",
    pattern: "",
    placeholder: "+75559091555",
  },
  client_name: {
    label: "Client Name",
    maxlength: 100,
    tip: "Имя и фамилия, максимум 100 символов.",
    pattern: "",
  },
  client_email: {
    label: "Client Email",
    maxlength: 64,
    tip: "E-mail, максимум 64 символа.",
    pattern: "",
  },
  client_id: {
    label: "Client ID",
    maxlength: 128,
    tip: "Только печатные ASCII символы, максимум 128 символов.",
    pattern: "[\\x20-\\x7E]{1,128}",
  },
  meta: {
    label: "Meta (JSON)",
    maxlength: 1000,
    tip: "JSON-строка.",
    pattern: "",
    textarea: true,
  },
  receipt_contact: {
    label: "Receipt Contact",
    maxlength: 64,
    tip: "E-mail, максимум 64 символа.",
    pattern: "",
  },
  receipt_items: {
    label: "Receipt Items (JSON)",
    maxlength: 1500,
    tip: "JSON-объект с позициями чека.",
    pattern: "",
    textarea: true,
  },
  lifetime: {
    label: "Lifetime",
    maxlength: 10,
    tip: "Время жизни страницы (секунды), только цифры.",
    pattern: "^\\d*$",
    inputmode: "numeric",
  },
  timeout_url: {
    label: "Timeout URL",
    maxlength: 128,
    tip: "Строка, максимум 128 символов.",
    pattern: "",
  },
  salt: {
    label: "Salt",
    maxlength: 32,
    tip: "Только печатные ASCII символы, максимум 32 символа.",
    pattern: "[\\x20-\\x7E]{1,32}",
  },
  start_recurrent: {
    label: "Start Recurrent",
    type: "select",
    tip: "Логическое значение: 1 — рекуррентная транзакция, 0 — не рекуррентная.",
    options: [
      { value: "1", text: "Рекуррентная (1)" },
      { value: "0", text: "Не рекуррентная (0)" },
    ],
  },
  preauth: {
    label: "Preauth",
    type: "select",
    tip: "Логическое значение: 1 — холдирование, 0 — одностадийный платёж.",
    options: [
      { value: "1", text: "Холдирование (1)" },
      { value: "0", text: "Одностадийный платёж (0)" },
    ],
  },
  show_payment_methods: {
    label: "Show Payment Methods",
    maxlength: 100,
    tip: "card — карты, sbp — СБП, yandexpay — YandexPay. Пример: [\"sbp\",\"card\"]",
    pattern: "",
    placeholder: '["sbp","card"]',
  },
  callback_with_receipt: {
    label: "Callback With Receipt",
    type: "select",
    tip: "Логическое значение: 1 — отправлять информацию о чеке, 0 — не отправлять.",
    options: [
      { value: "1", text: "Отправлять (1)" },
      { value: "0", text: "Не отправлять (0)" },
    ],
  },
};

document.addEventListener('DOMContentLoaded', function() {
  // --- Dynamic fields ---
  const paymentForm = document.getElementById('payment-form');
  const addFieldBtn = document.getElementById('add-field-btn');
  const fieldSelector = document.getElementById('field-selector');
  const optionalFieldsContainer = document.getElementById('optional-fields-container');
  // Основные поля должны быть до #optional-fields-container внутри формы!
  if (addFieldBtn && fieldSelector && optionalFieldsContainer && paymentForm) {
    addFieldBtn.addEventListener('click', () => {
      const val = fieldSelector.value;
      if (!val) return;
      // Prevent duplicates
      if (paymentForm.querySelector(`[name="${val}"]`)) return;

      // Meta for field
      const meta = FIELD_META[val] || {};
      const label = meta.label || fieldSelector.options[fieldSelector.selectedIndex].text;
      const tip = meta.tip || "";
      const maxlength = meta.maxlength || "";
      const pattern = meta.pattern || "";
      const inputmode = meta.inputmode || "";
      const placeholder = meta.placeholder || "";
      const textarea = meta.textarea || false;
      const type = meta.type || "text";
      const fieldId = `opt_${val}`;

      // Counter (if maxlength present)
      let counterHtml = "";
      if (maxlength) {
        counterHtml = `<span class="text-gray-400 text-xs ml-auto" data-counter-for="${fieldId}">0/${maxlength}</span>`;
      }

      let fieldHtml = "";
      if (type === "select" && Array.isArray(meta.options)) {
        fieldHtml = `
          <div class="form-group mb-4 w-full relative">
            <label for="${fieldId}" class="block font-semibold mb-1">${label}:</label>
            <select id="${fieldId}" name="${val}" class="form-select border border-gray-300 rounded-md h-10 px-2 w-full max-w-xs mb-1">
              ${meta.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
            </select>
            <div class="flex items-center mt-1">
              <small class="text-gray-500">${tip}</small>
              <div class="flex items-center gap-2 ml-auto">
                ${counterHtml}
                <button type="button" class="text-brand-400 hover:text-red-400 remove-opt-field text-xl px-2 py-0.5" aria-label="Удалить поле" tabindex="0">&times;</button>
              </div>
            </div>
          </div>
        `;
      } else if (textarea) {
        fieldHtml = `
          <div class="form-group mb-4 w-full relative">
            <label for="${fieldId}" class="block font-semibold mb-1">${label}:</label>
            <textarea id="${fieldId}" name="${val}" class="form-input border border-gray-300 rounded-md w-full max-w-xs h-20 px-3 char-limited mb-1"
              ${maxlength ? `maxlength="${maxlength}"` : ''} 
              ${pattern ? `pattern="${pattern}"` : ''}
              placeholder="${placeholder || ''}"></textarea>
            <div class="flex items-center mt-1">
              <small class="text-gray-500">${tip}</small>
              <div class="flex items-center gap-2 ml-auto">
                ${counterHtml}
                <button type="button" class="text-brand-400 hover:text-red-400 remove-opt-field text-xl px-2 py-0.5" aria-label="Удалить поле" tabindex="0">&times;</button>
              </div>
            </div>
          </div>
        `;
      } else {
        fieldHtml = `
          <div class="form-group mb-4 w-full relative">
            <label for="${fieldId}" class="block font-semibold mb-1">${label}:</label>
            <input id="${fieldId}" name="${val}" type="text" class="form-input border border-gray-300 rounded-md w-full h-10 px-3 char-limited mb-1"
              ${maxlength ? `maxlength="${maxlength}"` : ''} 
              ${pattern ? `pattern="${pattern}"` : ''}
              ${inputmode ? `inputmode="${inputmode}"` : ''}
              placeholder="${placeholder || ''}">
            <div class="flex items-center mt-1">
              <small class="text-gray-500">${tip}</small>
              <div class="flex items-center gap-2 ml-auto">
                ${counterHtml}
                <button type="button" class="text-brand-400 hover:text-red-400 remove-opt-field text-xl px-2 py-0.5" aria-label="Удалить поле" tabindex="0">&times;</button>
              </div>
            </div>
          </div>
        `;
      }

      // Create wrapper div for the field
      const div = document.createElement('div');
      div.innerHTML = fieldHtml;

      // Вставляем в контейнер для дополнительных полей (внутри формы)
      optionalFieldsContainer.insertBefore(div, optionalFieldsContainer.firstChild);

      // Remove from dropdown
      fieldSelector.querySelector(`option[value="${val}"]`).disabled = true;
      fieldSelector.value = "";

      // Remove event
      div.querySelector('.remove-opt-field').onclick = () => {
        div.remove();
        // Re-enable in dropdown
        fieldSelector.querySelector(`option[value="${val}"]`).disabled = false;
      };

      // Init char counter for new dynamic field
      if (maxlength) {
        const input = div.querySelector(`#${fieldId}`);
        const counter = div.querySelector(`[data-counter-for="${fieldId}"]`);
        if (input && counter) {
          const updateCounter = () => {
            counter.textContent = `${input.value.length}/${maxlength}`;
          };
          input.addEventListener('input', updateCounter);
          updateCounter();
        }
      }
    });
  }

  // --- Signature calculation for form submit ---
  const secretKeyInput = document.getElementById('secret_key');
  const resultEl = document.getElementById('result');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Удаляем старое поле подписи, если есть
      const oldSig = paymentForm.querySelector('input[name=signature][type=hidden]');
      if (oldSig) oldSig.remove();

      // Собираем все поля и считаем signature
      const fields = getAllFormFields(paymentForm);
      const secretKey = secretKeyInput.value;
      if (!secretKey) {
        if (resultEl) {
          resultEl.textContent = "Введите secret_key";
          resultEl.className = "text-red-600";
        }
        return false;
      }
      const signature = await calcSignature(secretKey, fields);

      // Добавляем скрытое поле signature
      const sigInput = document.createElement('input');
      sigInput.type = "hidden";
      sigInput.name = "signature";
      sigInput.value = signature;
      paymentForm.appendChild(sigInput);

      paymentForm.submit();
    });
  }

  // Кнопка "Рассчитать подпись"
  const calcBtn = document.getElementById('calculate-signature-btn');
  if (calcBtn && secretKeyInput && resultEl && paymentForm) {
    calcBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const fields = getAllFormFields(paymentForm);
      const secretKey = secretKeyInput.value;
      if (!secretKey) {
        resultEl.textContent = "Введите secret_key";
        resultEl.className = "text-red-600";
        return;
      }
      const signature = await calcSignature(secretKey, fields);
      resultEl.textContent = `Signature: ${signature}`;
      resultEl.className = "text-brand-700 font-mono my-2";
    });
  }

  // --- Char counters for static fields ---
  document.querySelectorAll('.char-limited').forEach(function (input) {
    let id = input.id;
    let counter = document.querySelector(`[data-counter-for="${id}"]`);
    if (counter && input.maxLength) {
      const updateCount = () => {
        counter.textContent = `${input.value.length}/${input.maxLength}`;
      };
      input.addEventListener('input', updateCount);
      updateCount();
    }
  });

  // Для динамических полей, добавляемых JS (например, custom_order_id и пр.)
  if (optionalFieldsContainer) {
    const observer = new MutationObserver(function () {
      optionalFieldsContainer.querySelectorAll('.char-limited').forEach(function (input) {
        let id = input.id;
        let counter = optionalFieldsContainer.querySelector(`[data-counter-for="${id}"]`);
        if (counter && !input.hasAttribute('data-counter-initialized')) {
          const updateCount = () => {
            counter.textContent = `${input.value.length}/${input.maxLength}`;
          };
          input.addEventListener('input', updateCount);
          input.setAttribute('data-counter-initialized', '1');
          updateCount();
        }
      });
    });
    observer.observe(optionalFieldsContainer, { childList: true, subtree: true });
  }
});