const METHOD_FIELD_RULES = {
  one_stage_payment: {
    requiredFields: ['merchant', 'amount', 'order_id', 'description', 'success_url', 'unix_timestamp'],
    optionalFields: ['custom_order_id', 'testing', 'callback_url', 'callback_on_failure', 'client_phone', 'client_name', 'client_email', 'client_id', 'meta', 'receipt_contact', 'receipt_items', 'lifetime', 'timeout_url', 'salt', 'start_recurrent', 'preauth', 'show_payment_methods', 'callback_with_receipt']
  },
  hold: {
    requiredFields: ['merchant', 'transaction', 'amount', 'unix_timestamp'],
    optionalFields: ['salt', 'receipt_contact', 'receipt_items']
  },
  recurrent: {
    requiredFields: ['merchant', 'first_recurrent_transaction', 'amount', 'order_id', 'description', 'receipt_items', 'unix_timestamp'],
    optionalFields: ['custom_order_id', 'testing', 'callback_url', 'client_phone', 'client_name', 'client_email', 'client_id', 'meta', 'receipt_contact', 'salt', 'start_recurrent', 'preauth', 'show_payment_methods', 'callback_with_receipt']
  },
  invoice_link: {
    requiredFields: ['merchant', 'amount', 'description', 'unix_timestamp', 'success_url'],
    optionalFields: ['testing', 'client_email', 'client_name', 'custom_order_id', 'lifetime', 'send_letter', 'receipt_contact', 'receipt_items', 'salt', 'reusable', 'callback_url', 'callback_on_failure', 'start_recurrent', 'show_payment_methods', 'preauth']
  },
  refund: {
    requiredFields: ['merchant', 'amount', 'transaction', 'unix_timestamp'],
    optionalFields: ['salt', 'refund_items']
  },
  transaction_info: {
    requiredFields: ['merchant', 'transaction_id', 'unix_timestamp'],
    optionalFields: ['salt']
  },
  transactions_list: {
    requiredFields: ['merchant', 'unix_timestamp', 'date_from', 'date_to'],
    optionalFields: ['state', 'testing', 'salt']
  },
  sbp_qr_link: {
    requiredFields: ['merchant', 'amount', 'order_id', 'description', 'unix_timestamp'],
    optionalFields: ['custom_order_id', 'callback_url', 'callback_on_failure', 'client_phone', 'client_name', 'client_email', 'client_id', 'meta', 'receipt_contact', 'receipt_items', 'salt', 'qr_image', 'qr_lifetime']
  },
  invoice_info: {
    requiredFields: ['merchant', 'id', 'unix_timestamp'],
    optionalFields: ['salt']
  }
};

const FIELD_META = {
  custom_order_id: { label: "Custom Order ID", maxlength: 50, tip: "Строка, максимум 50 символов." },
  testing: {
    label: "Testing", type: "select", tip: "Логическое значение: 1 — тест, 0 — реальный платеж.",
    options: [{ value: "", text: "--Select--" }, { value: "1", text: "Test Payment" }, { value: "0", text: "Real Payment" }]
  },
  callback_url: { label: "Callback URL", maxlength: 128, tip: "Строка, максимум 128 символов." },
  callback_on_failure: {
    label: "Callback on Failure", type: "select", tip: "Логическое значение: 1 — отправлять, 0 — не отправлять.",
    options: [{ value: "1", text: "Отправлять (1)" }, { value: "0", text: "Не отправлять (0)" }]
  },
  client_phone: { label: "Client Phone", maxlength: 15, tip: "Телефон, максимум 15 символов. Пример: +75559091555", placeholder: "+75559091555" },
  client_name: { label: "Client Name", maxlength: 100, tip: "Имя и фамилия клиента, максимум 100 символов." },
  client_email: { label: "Client Email", maxlength: 64, tip: "E-mail клиента, максимум 64 символа." },
  client_id: { label: "Client ID", maxlength: 128, tip: "Только печатные ASCII символы, максимум 128 символов.", pattern: "[\\x20-\\x7E]{1,128}" },
  meta: { label: "Meta (JSON)", maxlength: 1000, tip: "JSON-строка.", textarea: true },
  receipt_contact: { label: "Receipt Contact", maxlength: 64, tip: "E-mail получателя чека." },
  receipt_items: { label: "Receipt Items", maxlength: 1500, tip: "JSON-объект с позициями чека.", textarea: true },
  lifetime: { label: "Lifetime", maxlength: 10, tip: "Время жизни страницы (в секундах), только цифры.", pattern: "^\\d*$", inputmode: "numeric", type: "number" },
  timeout_url: { label: "Timeout URL", maxlength: 128, tip: "Строка, максимум 128 символов." },
  salt: { label: "Salt", maxlength: 32, tip: "Только печатные ASCII символы, максимум 32 символа.", pattern: "[\\x20-\\x7E]{1,32}" },
  start_recurrent: {
    label: "Start Recurrent", type: "select", tip: "1 — рекуррентная транзакция, 0 — нет.",
    options: [{ value: "", text: "--Select--" }, { value: "1", text: "Yes" }, { value: "0", text: "No" }]
  },
  preauth: {
    label: "Preauth", type: "select", tip: "1 — холдирование, 0 — одностадийный платёж.",
    options: [{ value: "", text: "--Select--" }, { value: "1", text: "Yes" }, { value: "0", text: "No" }]
  },
  show_payment_methods: {
    label: "Show Payment Methods", maxlength: 100, tip: "card — карты, sbp — СБП, yandexpay — YandexPay. Пример: [\"sbp\",\"card\"]", placeholder: '["sbp","card"]'
  },
  callback_with_receipt: {
    label: "Callback With Receipt", type: "select", tip: "1 — отправлять информацию о чеке, 0 — не отправлять.",
    options: [{ value: "1", text: "Отправлять (1)" }, { value: "0", text: "Не отправлять (0)" }]
  },
  send_letter: {
    label: "Send Letter", type: "select", tip: "1 — отправлять письмо, 0 — не отправлять.",
    options: [{ value: "1", text: "Отправлять (1)" }, { value: "0", text: "Не отправлять (0)" }]
  },
  reusable: {
    label: "Reusable", type: "select", tip: "1 — многоразовая ссылка, 0 — одноразовая.",
    options: [{ value: "1", text: "Многоразовая (1)" }, { value: "0", text: "Одноразовая (0)" }]
  },
  qr_image: {
    label: "QR Image", type: "select", tip: "1 — вернуть изображение QR, 0 — вернуть ссылку.",
    options: [{ value: "1", text: "Изображение (1)" }, { value: "0", text: "Ссылка (0)" }]
  },
  qr_lifetime: { label: "QR Lifetime", maxlength: 10, tip: "Время жизни QR-кода (в секундах), только цифры.", pattern: "^\\d*$", inputmode: "numeric" },
  state: { label: "State", maxlength: 50, tip: "Состояние транзакции, максимум 50 символов." },
  refund_items: { label: "Refund Items (JSON)", maxlength: 1500, tip: "JSON-объект с позициями возврата.", textarea: true },
  merchant: { label: "Merchant", tip: "Идентификатор мерчанта." },
  amount: { label: "Amount", tip: "Сумма платежа, только цифры.", pattern: "^\\d*$", inputmode: "numeric" },
  order_id: { label: "Order ID", tip: "Идентификатор заказа." },
  description: { label: "Description", tip: "Описание платежа." },
  success_url: { label: "Success URL", tip: "URL для перенаправления после успешного платежа." },
  unix_timestamp: { label: "Unix Timestamp", tip: "Временная метка в формате Unix.", pattern: "^\\d{10,}$", inputmode: "numeric" },
  transaction: { label: "Transaction", tip: "Идентификатор транзакции." },
  first_recurrent_transaction: { label: "First Recurrent Transaction", tip: "Идентификатор первой рекуррентной транзакции." },
  transaction_id: { label: "Transaction ID", tip: "Идентификатор транзакции." },
  date_from: { label: "Date From", tip: "Начальная дата в формате ISO8601 (например, 2018-01-31T00:00:00.123+04:00)." },
  date_to: { label: "Date To", tip: "Конечная дата в формате ISO8601 (например, 2018-01-31T00:00:00.123+04:00)." },
  id: { label: "ID", tip: "Идентификатор." }
};

// Хэширование через Web Crypto API
async function sha1(str) {
  try {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    console.error('Ошибка SHA-1:', e);
    throw new Error('Ошибка при вычислении SHA-1');
  }
}

// Кодирование в Base64
function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}

// Функция для вычисления подписи
async function calcSignature(secretKey, params, currentMethod) {
  if (!secretKey) throw new Error('Секретный ключ не указан');
  if (!params || Object.keys(params).length === 0) throw new Error('Параметры не указаны');
  if (!currentMethod || !METHOD_FIELD_RULES[currentMethod]) throw new Error('Метод не выбран или неизвестен');

  // Логирование исходных параметров
  console.log('Исходные параметры для расчёта сигнатуры:', params);

  // Получаем разрешённые поля для текущего метода
  const allowedFields = [...METHOD_FIELD_RULES[currentMethod].requiredFields, ...METHOD_FIELD_RULES[currentMethod].optionalFields];

  // Фильтруем параметры
  const filteredParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== 'signature' && allowedFields.includes(key)) {
      filteredParams[key] = value;
    }
  });

  // Логирование отфильтрованных параметров
  console.log('Используемые параметры для расчёта сигнатуры:', filteredParams);

  if (Object.keys(filteredParams).length === 0) throw new Error('Нет заполненных параметров для расчёта сигнатуры');

  // Кодируем параметры в Base64
  const encodedParams = Object.entries(filteredParams).reduce((acc, [key, value]) => {
    acc[key] = encodeBase64(value);
    return acc;
  }, {});

  // Сортируем ключи и формируем строку параметров
  const sortedKeys = Object.keys(encodedParams).sort();
  const paramsString = sortedKeys.map(key => `${key}=${encodedParams[key]}`).join('&');

  console.log('Собранная строка параметров:', paramsString);

  // Первый хэш SHA-1
  const hash1 = await sha1(paramsString);
  console.log('Первый хэш SHA-1:', hash1);

  // Второй хэш SHA-1
  const finalSignature = await sha1(secretKey + hash1);
  console.log('Финальная сигнатура:', finalSignature);

  // Добавляем поле signature в форму
  createInputField('hidden', 'signature', finalSignature, 'payment-form');

  return finalSignature;
}

// Функция для создания динамического поля ввода
function createInputField(type, name, value, formId) {
  // Удаляем существующее поле signature, если оно есть
  const existingInput = document.querySelector(`#${formId} [name="${name}"]`);
  if (existingInput) existingInput.remove();

  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  input.value = value;
  document.getElementById(formId).appendChild(input);
}

function getAllFormFields(formElement) {
  const formData = new FormData(formElement);
  const data = {};
  formData.forEach((value, key) => {
    if (value) data[key] = value;
  });
  return data;
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function validateISO8601(dateStr) {
  const pattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
  return pattern.test(dateStr);
}

function validateUnixTimestamp(timestamp) {
  const pattern = /^\d{10,}$/;
  return pattern.test(timestamp);
}

// Валидация формы
function validateForm() {
  const amount = document.getElementById('amount')?.value || '';
  const unixTimestamp = document.getElementById('unix_timestamp')?.value || '';
  const clientEmail = document.querySelector('[name="client_email"]')?.value || '';
  const callbackUrl = document.querySelector('[name="callback_url"]')?.value || '';
  const timeoutUrl = document.querySelector('[name="timeout_url"]')?.value || '';

  if (amount && !/^\d*$/.test(amount)) {
    throw new Error('Amount must contain only digits.');
  }

  if (unixTimestamp && !validateUnixTimestamp(unixTimestamp)) {
    throw new Error('Unix Timestamp should contain only digits and be at least 10 digits (e.g., 1716369160).');
  }

  if (clientEmail && !/^[\w.-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(clientEmail)) {
    throw new Error('Client Email is not valid.');
  }

  if (callbackUrl && !/^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(callbackUrl)) {
    throw new Error('Callback URL must be a valid URL.');
  }

  if (timeoutUrl && !/^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(timeoutUrl)) {
    throw new Error('Timeout URL must be a valid URL.');
  }

  return true;
}

// Функция добавления обязательного поля
function addRequiredField(fieldName) {
  const field = FIELD_META[fieldName];
  if (!field) return;

  const paymentForm = document.getElementById('payment-form');
  // Проверяем, не существует ли уже поле с таким именем
  if (paymentForm.querySelector(`[name="${fieldName}"]`)) return;

  const group = document.createElement('div');
  group.className = 'form-group mb-4 w-full';

  const label = document.createElement('label');
  label.className = 'font-medium';
  label.textContent = field.label;
  group.appendChild(label);

  let input;
  if (field.type === 'select') {
    input = document.createElement('select');
    input.className = 'form-select border border-gray-300 rounded-md h-12 px-4 w-full';
    input.name = fieldName;
    input.required = true;
    field.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.text;
      input.appendChild(opt);
    });
  } else if (field.type === 'textarea') {
    input = document.createElement('textarea');
    input.className = 'form-input border border-gray-300 h-20 px-4 w-full rounded-md';
    input.name = fieldName;
    input.required = true;
    if (field.maxlength) input.maxLength = field.maxlength;
  } else if (field.type === 'number') {
    input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-input border border-gray-300 h-12 px-4 w-full rounded-md';
    input.name = fieldName;
    input.required = true;
    if (field.maxlength) input.maxLength = field.maxlength;
  } else {
    input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input border border-gray-300 h-12 px-4 w-full rounded-md';
    input.name = fieldName;
    input.required = true;
    if (field.maxlength) input.maxLength = field.maxlength;
    if (field.pattern) input.pattern = field.pattern;
    if (field.inputmode) input.inputMode = field.inputmode;
    if (field.placeholder) input.placeholder = field.placeholder;
  }
  input.id = fieldName; // Устанавливаем id для упрощения поиска
  group.appendChild(input);

  const div = document.createElement('div');
  div.className = 'flex justify-between mt-1';
  const small = document.createElement('small');
  small.className = 'text-gray-500 text-sm';
  small.textContent = field.tip || '';
  div.appendChild(small);

  if (field.maxlength) {
    const counterSpan = document.createElement('span');
    counterSpan.className = 'text-gray-400 text-sm';
    counterSpan.dataset.counterFor = fieldName;
    counterSpan.textContent = `0/${field.maxlength}`;
    div.appendChild(counterSpan);
    initializeCounter(input, counterSpan);
  }

  group.appendChild(div);
  paymentForm.appendChild(group);
}

function updateFormByMethod(method) {
  const resultEl = document.getElementById('result');
  const submitBtn = document.querySelector('button[type="submit"]');
  const paymentForm = document.getElementById('payment-form');

  if (!METHOD_FIELD_RULES[method]) {
    resultEl.textContent = 'Ошибка: Выберите метод платежа';
    resultEl.className = 'mt-4 text-lg text-red-600';
    document.querySelectorAll('.form-group').forEach(group => {
      const input = group.querySelector('input, select, textarea');
      if (!input || !input.name) return;
      if (['secret_key', 'method-selector', 'merchant'].includes(input.id)) {
        group.classList.remove('hidden');
        input.required = ['secret_key', 'merchant'].includes(input.id);
      } else {
        group.classList.add('hidden');
        input.required = false;
      }
    });
    updateFieldSelectorOptions([]);
    if (submitBtn) submitBtn.classList.add('hidden');
    return;
  }

  const rules = METHOD_FIELD_RULES[method];
  console.log('Обновление формы для метода:', method, 'Правила:', rules);

  // Добавляем все обязательные поля, если их нет в форме
  rules.requiredFields.forEach(fieldName => {
    addRequiredField(fieldName);
  });

  // Удаляем динамически добавленные поля, которые не входят в новые правила
  paymentForm.querySelectorAll('.form-group').forEach(group => {
    const input = group.querySelector('input, select, textarea');
    if (!input || !input.name) return;
    const fieldName = input.name;
    if (!['secret_key', 'method-selector', 'merchant'].includes(input.id) && !rules.requiredFields.includes(fieldName) && !rules.optionalFields.includes(fieldName)) {
      group.remove();
    }
  });

  // Обновляем отображение всех полей
  document.querySelectorAll('.form-group').forEach(group => {
    const input = group.querySelector('input, select, textarea');
    if (!input || !input.name) return;

    const fieldName = input.name;
    const isRequired = rules.requiredFields.includes(fieldName);
    const isOptional = rules.optionalFields.includes(fieldName);

    if (['secret_key', 'method-selector', 'merchant'].includes(input.id)) {
      group.classList.remove('hidden');
      input.required = ['secret_key', 'merchant'].includes(input.id);
    } else if (isRequired || isOptional) {
      group.classList.remove('hidden');
      input.required = isRequired;
    } else {
      group.classList.add('hidden');
      input.required = false;
    }
    console.log(`Поле ${fieldName}: hidden=${group.classList.contains('hidden')}, required=${input.required}`);
  });

  if (submitBtn) {
    if (method === 'one_stage_payment') {
      submitBtn.classList.remove('hidden');
    } else {
      submitBtn.classList.add('hidden');
    }
  }

  updateFieldSelectorOptions(rules.optionalFields);
  resultEl.textContent = '';
}

function updateFieldSelectorOptions(optionalFields) {
  const selector = document.getElementById('field-selector');
  if (!selector) return;
  selector.innerHTML = '<option value="">--Выберите дополнительное поле--</option>';
  optionalFields.forEach(key => {
    const meta = FIELD_META[key];
    if (!meta) return;
    const option = document.createElement('option');
    option.value = key;
    option.textContent = meta.label || key;
    if (document.querySelector(`[name="${key}"]`)) {
      option.disabled = true;
    }
    selector.appendChild(option);
  });
}

function initializeCounter(input, counter) {
  if (!input || !counter || !input.maxLength) return;
  const updateCounter = () => {
    counter.textContent = `${input.value.length}/${input.maxLength}`;
  };
  input.addEventListener('input', updateCounter);
  updateCounter();
}

// Функция добавления нового поля
function addField(fieldName) {
  const field = FIELD_META[fieldName];
  const paymentForm = document.getElementById('payment-form');
  const currentMethod = document.getElementById('method-selector').value;
  const rules = METHOD_FIELD_RULES[currentMethod];

  // Проверяем, разрешено ли поле для текущего метода
  if (!rules.requiredFields.includes(fieldName) && !rules.optionalFields.includes(fieldName)) {
    console.warn(`Поле ${fieldName} не разрешено для метода ${currentMethod}`);
    return;
  }

  const group = document.createElement('div');
  group.className = 'form-group mb-4 w-full';

  const label = document.createElement('label');
  label.className = 'font-medium';
  label.textContent = field.label;
  group.appendChild(label);

  let input;
  if (field.type === 'select') {
    input = document.createElement('select');
    input.className = 'form-select border border-gray-300 rounded-md h-12 px-4 w-full';
    input.name = fieldName;
    input.required = rules.requiredFields.includes(fieldName);
    field.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.text;
      input.appendChild(opt);
    });
  } else if (field.type === 'textarea') {
    input = document.createElement('textarea');
    input.className = 'form-input border border-gray-300 h-20 px-4 w-full rounded-md';
    input.name = fieldName;
    input.required = rules.requiredFields.includes(fieldName);
    if (field.maxlength) input.maxLength = field.maxlength;
  } else if (field.type === 'number') {
    input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-input border border-gray-300 h-12 px-4 w-full rounded-md';
    input.name = fieldName;
    input.required = rules.requiredFields.includes(fieldName);
    if (field.maxlength) input.maxLength = field.maxlength;
  } else {
    input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input border border-gray-300 h-12 px-4 w-full rounded-md';
    input.name = fieldName;
    input.required = rules.requiredFields.includes(fieldName);
    if (field.maxlength) input.maxLength = field.maxlength;
    if (field.pattern) input.pattern = field.pattern;
    if (field.inputmode) input.inputMode = field.inputmode;
    if (field.placeholder) input.placeholder = field.placeholder;
  }
  group.appendChild(input);

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Удалить';
  removeButton.className = 'remove-btn text-red-600 cursor-pointer ml-2';
  removeButton.addEventListener('click', () => {
    group.remove();
    resetFieldSelector(fieldName);
  });

  group.appendChild(removeButton);
  const div = document.createElement('div');
  div.className = 'flex justify-between mt-1';
  const small = document.createElement('small');
  small.className = 'text-gray-500 text-sm';
  small.textContent = field.tip || '';
  div.appendChild(small);

  if (field.maxlength) {
    const counterSpan = document.createElement('span');
    counterSpan.className = 'text-gray-400 text-sm';
    counterSpan.dataset.counterFor = input.id || fieldName;
    counterSpan.textContent = `0/${field.maxlength}`;
    div.appendChild(counterSpan);
    initializeCounter(input, counterSpan);
  }

  group.appendChild(div);
  paymentForm.appendChild(group);
}

// Удаление опции из селектора
function removeOption(selector, value) {
  const option = Array.from(selector.options).find(opt => opt.value === value);
  if (option) {
    selector.remove(option.index);
  }
}

// Сброс селектора поля
function resetFieldSelector(fieldName) {
  const fieldSelector = document.getElementById('field-selector');
  const option = document.createElement('option');
  option.value = fieldName;
  option.textContent = FIELD_META[fieldName]?.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  fieldSelector.add(option);
}

document.addEventListener('DOMContentLoaded', () => {
  const methodSelector = document.getElementById('method-selector');
  const addFieldBtn = document.getElementById('add-field-btn');
  const fieldSelector = document.getElementById('field-selector');
  const paymentForm = document.getElementById('payment-form');
  const calcBtn = document.getElementById('calculate-signature-btn');
  const resultEl = document.getElementById('result');
  const secretKeyInput = document.getElementById('secret_key');
  const setTimestampBtn = document.getElementById('set-current-timestamp');
  const unixTimestampInput = document.getElementById('unix_timestamp');
  const resetFormBtn = document.getElementById('reset-form-btn');

  if (!methodSelector || !paymentForm) {
    console.error('Критическая ошибка: Не найдены method-selector или payment-form');
    resultEl.textContent = 'Ошибка: Форма не инициализирована';
    resultEl.className = 'mt-4 text-lg text-red-600';
    return;
  }

  const formAction = document.getElementById('signature-calculator').dataset.action || 'https://pay.modulbank.ru/pay';
  paymentForm.action = formAction;

  methodSelector.addEventListener('change', () => {
    console.log('Выбран метод:', methodSelector.value);
    // Удаляем все динамические поля перед обновлением
    paymentForm.querySelectorAll('.form-group').forEach(group => {
      const input = group.querySelector('input, select, textarea');
      if (input && !['secret_key', 'method-selector', 'merchant', 'amount', 'order_id', 'description', 'success_url', 'unix_timestamp', 'transaction', 'transaction_id', 'date_from', 'date_to', 'id', 'first_recurrent_transaction'].includes(input.name)) {
        group.remove();
      }
    });
    updateFieldSelectorOptions(METHOD_FIELD_RULES[methodSelector.value]?.optionalFields || []);
    updateFormByMethod(methodSelector.value);
  });

  updateFormByMethod('one_stage_payment');

  if (addFieldBtn && fieldSelector && paymentForm) {
    addFieldBtn.addEventListener('click', () => {
      const selectedFieldName = fieldSelector.value;

      if (selectedFieldName && FIELD_META[selectedFieldName]) {
        addField(selectedFieldName);
        removeOption(fieldSelector, selectedFieldName);
      } else {
        resultEl.textContent = 'Выберите поле для добавления.';
        resultEl.className = 'mt-4 text-lg text-red-600';
      }
    });

    paymentForm.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-btn')) {
        const fieldGroup = event.target.closest('.form-group');
        if (fieldGroup) {
          const fieldName = fieldGroup.querySelector('input, select, textarea').name;
          fieldGroup.remove();
          resetFieldSelector(fieldName);
        }
      }
    });
  }

  if (calcBtn && paymentForm && secretKeyInput && resultEl) {
    calcBtn.addEventListener('click', async () => {
      try {
        const secretKey = secretKeyInput.value;
        if (!secretKey) throw new Error('Введите secret_key');

        const currentMethod = methodSelector.value;
        const fields = getAllFormFields(paymentForm);

        // Валидация unix_timestamp
        const unixTimestamp = fields.unix_timestamp;
        if (!unixTimestamp || !validateUnixTimestamp(unixTimestamp)) {
          throw new Error('Поле Unix Timestamp должно содержать только цифры и быть не менее 10 символов (например, 1716369160)');
        }

        // Валидация date_from и date_to для метода transactions_list
        if (currentMethod === 'transactions_list') {
          const dateFrom = fields.date_from;
          const dateTo = fields.date_to;
          if (!dateFrom || !validateISO8601(dateFrom)) {
            throw new Error('Поле Date From должно быть в формате ISO8601:2004 (например, 2018-01-31T00:00:00.123+04:00)');
          }
          if (!dateTo || !validateISO8601(dateTo)) {
            throw new Error('Поле Date To должно быть в формате ISO8601:2004 (например, 2018-01-31T00:00:00.123+04:00)');
          }
        }

        for (const [key, value] of Object.entries(fields)) {
          if (['meta', 'receipt_items', 'refund_items'].includes(key) && value && !isValidJSON(value)) {
            throw new Error(`Ошибка: Поле ${FIELD_META[key].label} содержит невалидный JSON`);
          }
        }

        const signature = await calcSignature(secretKey, fields, currentMethod);
        resultEl.textContent = `signature: ${signature}`;
        resultEl.className = 'mt-4 text-lg text-blue-600 font-mono';
      } catch (error) {
        resultEl.textContent = error.message;
        resultEl.className = 'mt-4 text-lg text-red-600';
      }
    });
  }

  if (paymentForm && secretKeyInput) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentMethod = methodSelector.value;
      if (currentMethod !== 'one_stage_payment') {
        resultEl.textContent = 'Отправка платежа доступна только для метода "Одностадийный платеж"';
        resultEl.className = 'mt-4 text-lg text-red-600';
        return;
      }

      try {
        // Валидация формы
        if (!validateForm()) return;

        const secretKey = secretKeyInput.value;
        if (!secretKey) throw new Error('Введите secret_key');

        // Собираем все поля формы
        const allFields = getAllFormFields(paymentForm);

        // Получаем правила для текущего метода
        const rules = METHOD_FIELD_RULES[currentMethod];
        const allowedFields = [...rules.requiredFields, ...rules.optionalFields];

        // Фильтруем только поля, разрешенные для текущего метода
        const fields = Object.fromEntries(
          Object.entries(allFields).filter(([key, value]) =>
            allowedFields.includes(key) && value !== ""
          )
        );

        // Рассчитываем сигнатуру (уже добавляет поле signature в форму)
        const signature = await calcSignature(secretKey, fields, currentMethod);

        // Создаем временную форму для отправки
        const tempForm = document.createElement('form');
        tempForm.action = formAction;
        tempForm.method = 'POST';
        tempForm.target = '_blank';
        tempForm.style.display = 'none';

        // Добавляем только отфильтрованные поля
        for (const [key, value] of Object.entries(fields)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          tempForm.appendChild(input);
        }

        // Добавляем поле signature
        const sigInput = document.createElement('input');
        sigInput.type = 'hidden';
        sigInput.name = 'signature';
        sigInput.value = signature;
        tempForm.appendChild(sigInput);

        // Логируем данные для отладки
        console.log('Отправляемые поля:', fields);
        console.log('Рассчитанная сигнатура:', signature);

        // Добавляем временную форму в документ и отправляем
        document.body.appendChild(tempForm);
        tempForm.submit();
        document.body.removeChild(tempForm);

        // Показываем сообщение об успешной отправке
        resultEl.textContent = 'Платёж отправлен в новой вкладке';
        resultEl.className = 'mt-4 text-lg text-green-600';
      } catch (error) {
        resultEl.textContent = error.message;
        resultEl.className = 'mt-4 text-lg text-red-600';
      }
    });
  }

  if (resetFormBtn && paymentForm && fieldSelector) {
    resetFormBtn.addEventListener('click', () => {
      // Сбрасываем все поля формы
      paymentForm.querySelectorAll('input[name], select[name], textarea[name]').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = false;
        } else if (el.tagName === 'SELECT') {
          el.selectedIndex = 0;
        } else {
          el.value = '';
        }
      });

      // Удаляем все динамические поля
      paymentForm.querySelectorAll('.form-group').forEach(group => {
        const input = group.querySelector('input, select, textarea');
        if (input && !['secret_key', 'method-selector', 'merchant', 'amount', 'order_id', 'description', 'success_url', 'unix_timestamp', 'transaction', 'transaction_id', 'date_from', 'date_to', 'id', 'first_recurrent_transaction'].includes(input.name)) {
          group.remove();
        }
      });

      // Сбрасываем селектор дополнительных полей
      updateFieldSelectorOptions(METHOD_FIELD_RULES[methodSelector.value]?.optionalFields || []);

      // Добавляем обязательные поля для текущего метода
      const currentMethod = methodSelector.value;
      if (METHOD_FIELD_RULES[currentMethod]) {
        METHOD_FIELD_RULES[currentMethod].requiredFields.forEach(fieldName => {
          addRequiredField(fieldName);
        });
      }

      // Очищаем результат
      resultEl.textContent = '';
      resultEl.className = 'mt-4 text-lg';

      console.log('Форма сброшена');
    });
  }

  if (setTimestampBtn && unixTimestampInput) {
    setTimestampBtn.addEventListener('click', () => {
      unixTimestampInput.value = Math.floor(Date.now() / 1000);
    });
  }

  document.querySelectorAll('.char-limited').forEach(input => {
    const counter = document.querySelector(`[data-counter-for="${input.id}"]`);
    initializeCounter(input, counter);
  });
});