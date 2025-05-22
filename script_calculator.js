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
// Signature calculator logic for Tailwind-based API docs
// Supports dynamic field addition, signature calculation (HMAC-SHA256), and result display

if (!window.crypto?.subtle) {
  alert('Ваш браузер не поддерживает Web Crypto API для расчёта подписи. Пожалуйста, используйте современный браузер.');
}

// Helper: ArrayBuffer to hex string
function ab2hex(buffer) {
  return Array.from(new Uint8Array(buffer)).map(x => x.toString(16).padStart(2, "0")).join("");
}

// Helper: Calculate HMAC-SHA256 (returns hex)
async function calcSignature(secret, stringToSign) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name: "HMAC", hash: "SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(stringToSign));
  return ab2hex(sig);
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
  const calculatorSection = document.getElementById('signature-calculator');
  const addFieldBtn = document.getElementById('add-field-btn');
  const fieldSelector = document.getElementById('field-selector');
  const optionalFieldsContainer = document.getElementById('optional-fields-container');
  if (addFieldBtn && fieldSelector && optionalFieldsContainer && calculatorSection) {
    const addFieldRow = document.getElementById('add-field-row');
    addFieldBtn.addEventListener('click', () => {
      const val = fieldSelector.value;
      if (!val) return;
      // Prevent duplicates
      if (calculatorSection.querySelector(`[name="${val}"]`)) return;

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
        // Счётчик расположен под инпутом справа
        counterHtml = `<span class="text-gray-400 text-xs ml-auto" data-counter-for="${fieldId}">0/${maxlength}</span>`;
      }

      let fieldHtml = "";
      // --- Используем flex для подсказки, счётчика и крестика строго под инпутом ---
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

      // Вставляем над строкой выбора дополнительного поля
      calculatorSection.insertBefore(div, addFieldRow);

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

  // --- Signature calculation ---
  const calcBtn = document.getElementById('calculate-signature-btn');
  const secretKeyInput = document.getElementById('secret_key');
  const resultEl = document.getElementById('result');
  if (calcBtn && secretKeyInput && resultEl) {
    calcBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { signature, error } = await getSignatureValue();
      if (error) {
        resultEl.textContent = error;
        resultEl.className = "text-red-600";
        return;
      }
      resultEl.textContent = `Signature: ${signature}`;
      resultEl.className = "text-brand-700 font-mono my-2";
    });
  }

  // --- Signature calculation for form submit ---
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // Главное: остановить стандартную отправку

      // Удаляем старое поле подписи, если есть
      const oldSig = paymentForm.querySelector('input[name=signature][type=hidden]');
      if (oldSig) oldSig.remove();

      // Вычисляем подпись
      const { signature, error } = await getSignatureValue();
      if (error) {
        // Показываем ошибку, форму не отправляем
        const resultEl = document.getElementById('result');
        if (resultEl) {
          resultEl.textContent = error;
          resultEl.className = "text-red-600";
        }
        return false;
      }

      // Добавляем скрытое поле в форму
      const sigInput = document.createElement('input');
      sigInput.type = "hidden";
      sigInput.name = "signature";
      sigInput.value = signature;
      paymentForm.appendChild(sigInput);

      // ПРОВЕРКА: Поле действительно добавлено
      // console.log(paymentForm.querySelector('input[name=signature]').value);

      // Теперь отправляем форму программно (разрешено только один раз!)
      paymentForm.submit();
    });
  }

  // --- Helper to get signature value based on current fields ---
  async function getSignatureValue() {
    // Gather all fields in order: merchant, amount, order_id, description, success_url, unix_timestamp + optional
    const fields = ['merchant', 'amount', 'order_id', 'description', 'success_url', 'unix_timestamp'];
    let stringToSign = '';
    for (let name of fields) {
      const el = document.getElementById(name);
      if (!el || !el.value) return { signature: null, error: `Поле ${name} обязательно` };
      stringToSign += el.value;
    }
    // Add optionals (в DOM-порядке сверху вниз)
    const optInputs = calculatorSection.querySelectorAll("input[name],textarea[name],select[name]");
    for (let input of optInputs) {
      // Не включать обязательные поля (merchant, amount и т.п.)
      if (fields.includes(input.name)) continue;
      stringToSign += input.value;
    }
    const secret = secretKeyInput.value;
    if (!secret || !stringToSign) {
      return { signature: null, error: "Введите secret_key и все обязательные поля" };
    }
    try {
      const signature = await calcSignature(secret, stringToSign);
      return { signature, error: null };
    } catch (err) {
      return { signature: null, error: "Ошибка вычисления подписи: " + err };
    }
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
});

// Инициализация счетчиков для всех полей с ограничением длины символов
document.addEventListener('DOMContentLoaded', function () {
  // Статические поля
  document.querySelectorAll('.char-limited').forEach(function (input) {
    let id = input.id;
    let counter = document.querySelector(`[data-counter-for="${id}"]`);
    if (counter) {
      const updateCount = () => {
        counter.textContent = `${input.value.length}/${input.maxLength}`;
      };
      input.addEventListener('input', updateCount);
      updateCount();
    }
  });

  // Для динамических полей, добавляемых JS (например, custom_order_id и пр.)
  const optionalFieldsContainer = document.getElementById('optional-fields-container');
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