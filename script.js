/* ==========================================================================
   JAVASCRIPT LOGIC FOR ВШТ DIAGNOSTIC APP (EXACT FLOW MATCH)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. STATE VARIABLES ---
  let currentStep = 1;
  
  const userInfo = {
    name: '',
    activity: '',
    reason: '',
    challenges: '',
    income_current: 0,
    income_target: 100000, // target income from step 3
    timeframe: '',
    experience: '',
    inspiration: ''
  };
  
  // 6 Competencies: Ratings from 1 to 5. 0 means unselected.
  const competencyRatings = [0, 0, 0, 0, 0, 0];
  
  // Calculator inputs per period:
  // Period 1: 1st month (1 month)
  // Period 2: 2-3 months (2 months)
  // Period 3: Half-year / 4-6 months (3 months)
  // Period 4: Year / 7-12 months (6 months)
  const calculatorPeriods = {
    1: { tours: 2, price: 250000, addons: 0, commission: 8 },
    2: { tours: 5, price: 250000, addons: 2, commission: 8 },
    3: { tours: 10, price: 250000, addons: 5, commission: 9 },
    4: { tours: 15, price: 250000, addons: 10, commission: 10 }
  };
  
  let activeCalcPeriod = 1;
  let randomBonusMonths = 3;
  let bonusRevealed = false;
  
  // Category names for axes
  const categoryNames = [
    "Знание направлений",
    "Техника бронирования",
    "Продажи и клиенты",
    "Правовые аспекты",
    "Маркетинг и бренд",
    "Сопровождение"
  ];

  const shortCategoryNames = [
    "Направления",
    "Бронирование",
    "Продажи",
    "Право",
    "Маркетинг",
    "Сопровождение"
  ];
  
  // Dynamic description messages for competency ratings (category-specific)
  const ratingDescriptions = {
    1: {
      1: "Не знаю ни стран, ни сезонов, ни типов отдыха",
      2: "Знаю 2–3 популярных направления, часто ошибаюсь в отелях и погоде",
      3: "Подбираю базовые туры (пляж/экскурсии), но не учитываю визы и стыковки",
      4: "Свободно ориентируюсь в топ‑10 направлений, звёздности отелей, питании",
      5: "Легко составляю сложные маршруты (2–3 страны, экзотика, любые нюансы)"
    },
    2: {
      1: "Ни разу не бронировал(а) тур через оператора или агрегатор",
      2: "Зарегистрирован(а) на 1–2 платформах, но боюсь оформлять оплату",
      3: "Бронирую простые туры у одного оператора, не знаю правил аннуляции",
      4: "Уверенно работаю с 2–3 операторами (личные кабинеты, штрафы, ваучеры)",
      5: "Владею разными B2B‑системами, собираю динамические пакеты за 10 минут"
    },
    3: {
      1: "Стесняюсь общаться, не умею выявлять потребности",
      2: "Отвечаю на вопросы, но теряюсь при возражениях («дорого», «подумаю»)",
      3: "Закрываю простых клиентов, сложных сливаю (конверсия ~30%)",
      4: "Закрываю 70% обращений в покупку, работаю с возражениями по системе",
      5: "Допродаю страховки, экскурсии, апгрейд; средний чек выше рынка, клиенты возвращаются"
    },
    4: {
      1: "Путаю загранпаспорт, ОЗП, не знаю, что нужно для выезда",
      2: "Слышал(а) про визы, но не знаю сроки и перечень документов",
      3: "Могу собрать пакет на Шенген или Турцию, но ошибаюсь в анкетах",
      4: "Уверенно оформляю визы, страховки, доверенности на детей для 30+ стран",
      5: "Эксперт по визовым нюансам и туристическому праву (защита от штрафов и отказов)"
    },
    5: {
      1: "Не веду соцсети, клиентов нет, кроме друзей",
      2: "Посты от случая к случаю, без системы и без отзывов",
      3: "Регулярно выкладываю туры, но нет упаковки личного бренда",
      4: "Есть профиль с отзывами, клиенты из соцсетей (30–50% заявок)",
      5: "Таргет, блогеры, воронка продаж — меня знают в регионе, 80% продаж без рекламного бюджета"
    },
    6: {
      1: "Не знаю, что делать при отмене рейса или плохом отеле",
      2: "Могу позвонить оператору, но теряюсь и перекладываю на клиента",
      3: "Знаю контакты поддержки, но не умею фиксировать доказательства и писать претензии",
      4: "Всегда на связи в поездке, решаю мелкие проблемы, правильно составляю жалобы",
      5: "Юридически грамотно выбиваю компенсации, сохраняю репутацию даже при форс‑мажорах"
    }
  };
  
  // Custom recommendations based on rating levels (Low: 1-2, Mid: 3-4, High: 5)
  const recommendationsData = {
    0: { // Навыки (Знание направлений)
      low: "Рекомендуется изучить топ-10 массовых выездных направлений (Турция, ОАЭ, Египет) и ключевые регионы РФ. Разберитесь в сезонности, климате и полетных часах.",
      mid: "Углубите знания по экзотическим направлениям (Мальдивы, Бали, Сейшелы). Освойте технику комбинирования экскурсионных программ и пляжного отдыха.",
      high: "Отличные знания! Сделайте упор на разработку авторских туров повышенной сложности и экспедиционных поездок."
    },
    1: { // Скорость (Техника бронирования)
      low: "Зарегистрируйтесь в B2B-системах основных туроператоров (Anex, Coral, Pegas). Изучите правила поиска, фильтрации цен и штрафные санкции при аннуляциях.",
      mid: "Внедрите в работу CRM-систему (например, 'Мои Документы'), чтобы автоматизировать выставление счетов и отправку документов.",
      high: "Великолепный темп! Вы умеете оперативно собирать индивидуальные динамические пакеты из отдельных авиабилетов и гостиниц."
    },
    2: { // Клиенты (Продажи и общение)
      low: "Изучите базовые скрипты звонков, правила квалификации туристов и выявления их истинных потребностей. Начните с простых заявок.",
      mid: "Освойте методику мягкой отработки возражений ('дорого', 'я подумаю') и техники апсейла (допродажа страховок, улучшение категории номеров).",
      high: "У вас высокий уровень продаж! Сосредоточьтесь на повышении LTV (пожизненной ценности клиента) и разработке программ лояльности."
    },
    3: { // Уверенность (Правовые аспекты)
      low: "Изучите основы ФЗ 'Об основах туристской деятельности' (ФЗ-132). Подготовьте базовые шаблоны договоров реализации турпродукта.",
      mid: "Разберитесь в судебной практике по спорам в туризме. Научитесь грамотно писать ответы на претензии и разграничивать ответственность с оператором.",
      high: "Полная юридическая безопасность! Вы отлично защищены от рисков и форс-мажорных ситуаций в путешествиях."
    },
    4: { // Средний чек (Маркетинг и личный бренд)
      low: "Оформите экспертные профили в соцсетях (VK, Telegram). Разработайте лид-магнит (например, чек-лист по сборам в дорогу) и пишите посты 3 раза в неделю.",
      mid: "Запустите таргетированную рекламу или посевы в местных пабликах. Начните собирать воронку лидов через чат-ботов и полезные гайды.",
      high: "Мощный личный бренд! Вы можете полностью ориентироваться на VIP-сегмент и продавать дорогие пакетные или индивидуальные туры."
    },
    5: { // Доход (Послепродажи)
      low: "Внедрите систему сбора отзывов сразу после возвращения туристов. Ведите базу клиентов с фиксацией дней рождения и годовщин.",
      mid: "Настройте триггерную работу с базой: регулярное информирование о горящих направлениях и поздравления с праздниками.",
      high: "Превосходный клиентский сервис! Большинство ваших клиентов возвращаются повторно и рекомендуют вас друзьям."
    }
  };

  // --- 2. STEP NAVIGATION LOGIC ---
  const stepCards = document.querySelectorAll('.step-card');
  const progressNodes = document.querySelectorAll('.progress-node');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressStepText = document.getElementById('progress-step-text');
  
  function showStep(stepNum) {
    if (stepNum === 13) {
      stepCards.forEach(card => card.classList.remove('active'));
      const step13 = document.getElementById('step-13');
      if (step13) step13.classList.add('active');
      const step14 = document.getElementById('step-14');
      if (step14) step14.classList.remove('active');
      
      // Hide header progress indicator on final screen as in mockup page 13
      document.querySelector('.progress-header').style.display = 'none';
      
      currentStep = 13;
      populateFinalReport();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (stepNum === 14) {
      stepCards.forEach(card => card.classList.remove('active'));
      const step13 = document.getElementById('step-13');
      if (step13) step13.classList.remove('active');
      const step14 = document.getElementById('step-14');
      if (step14) step14.classList.add('active');
      
      // Hide header progress indicator
      document.querySelector('.progress-header').style.display = 'none';
      
      currentStep = 14;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Otherwise show step normally (1 to 12)
    document.querySelector('.progress-header').style.display = 'flex';
    
    stepCards.forEach(card => card.classList.remove('active'));
    document.getElementById(`step-${stepNum}`).classList.add('active');
    
    // Update progress bar percentage
    const progressPercent = ((stepNum - 1) / 11) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    progressStepText.textContent = `${stepNum} из 12`;
    
    // Highlight only current progress node active circle
    progressNodes.forEach(node => {
      const nodeStep = parseInt(node.getAttribute('data-step'));
      if (nodeStep === stepNum) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });
    
    currentStep = stepNum;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hook updates for specific steps
    if (stepNum === 5) {
      calculateDiagnosticResults();
      renderRadarChart('radar-chart-svg', competencyRatings);
    } else if (stepNum === 12) {
      updateCalculatorUI();
    }
  }

  // Next / Back buttons event listeners
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => showStep(2));
  }
  
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nextStep = parseInt(e.target.closest('.btn-next').getAttribute('data-next'));
      showStep(nextStep);
    });
  });

  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prevStep = parseInt(e.target.closest('.btn-back').getAttribute('data-prev'));
      showStep(prevStep);
    });
  });

  // Persistent Tab bar clicks for steps 6-11
  document.querySelectorAll('.tab-btn-p').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepToGo = parseInt(btn.getAttribute('data-go-step'));
      showStep(stepToGo);
    });
  });

  // --- 3. STEP 3: QUESTIONNAIRE VALIDATION & COLLECTION ---
  const btnSubmitForm = document.getElementById('btn-submit-form');
  
  const formFields = [
    { id: 'user-name', errorId: 'name-error', field: 'name', type: 'text' },
    { id: 'user-activity', errorId: 'activity-error', field: 'activity', type: 'text' },
    { id: 'user-reason', errorId: 'reason-error', field: 'reason', type: 'text' },
    { id: 'user-challenges', errorId: 'challenges-error', field: 'challenges', type: 'text' },
    { id: 'user-income-current', errorId: 'income-current-error', field: 'income_current', type: 'number' },
    { id: 'user-income-target', errorId: 'target-error', field: 'income_target', type: 'number' },
    { id: 'user-timeframe', errorId: 'timeframe-error', field: 'timeframe', type: 'text' },
    { id: 'user-experience', errorId: 'experience-error', field: 'experience', type: 'text' },
    { id: 'user-inspiration', errorId: 'inspiration-error', field: 'inspiration', type: 'text' }
  ];

  btnSubmitForm.addEventListener('click', () => {
    formFields.forEach(f => {
      const el = document.getElementById(f.id);
      const val = el.value.trim();
      
      if (f.type === 'number') {
        const numVal = parseFloat(val);
        userInfo[f.field] = isNaN(numVal) ? 0 : numVal;
      } else {
        userInfo[f.field] = val || '';
      }
    });

    showStep(4);
  });

  // --- 4. STEP 4: COMPETENCY TEST LOGIC ---
  const competencyCards = document.querySelectorAll('.competency-card');
  const btnSubmitTest = document.getElementById('btn-submit-test');
  const testProgressText = document.getElementById('test-progress-text');
  const testBarFill = document.getElementById('test-bar-fill');

  competencyCards.forEach(card => {
    const compIndex = parseInt(card.getAttribute('data-comp')) - 1;
    const ratingCircles = card.querySelectorAll('.rating-circle');
    const commentBox = card.querySelector('.comp-comment-box');

    ratingCircles.forEach(circle => {
      circle.addEventListener('click', () => {
        // Toggle selected circles styling
        ratingCircles.forEach(c => c.classList.remove('selected'));
        circle.classList.add('selected');
        
        const ratingVal = parseInt(circle.getAttribute('data-val'));
        competencyRatings[compIndex] = ratingVal;
        
        // Show commentary with blue border (predefined styled class)
        commentBox.textContent = ratingDescriptions[compIndex + 1][ratingVal];
        commentBox.style.borderColor = 'var(--color-primary)';
        commentBox.style.color = 'var(--color-primary)';
        
        updateTestProgress();
      });
    });
  });

  function updateTestProgress() {
    const answeredCount = competencyRatings.filter(val => val > 0).length;
    testProgressText.textContent = `${answeredCount}/6`;
    testBarFill.style.width = `${(answeredCount / 6) * 100}%`;
    
    if (answeredCount === 6) {
      btnSubmitTest.removeAttribute('disabled');
    } else {
      btnSubmitTest.setAttribute('disabled', 'true');
    }
  }

  btnSubmitTest.addEventListener('click', () => {
    showStep(5);
  });

  // --- 4.1 CLICKABLE TOOLS CARDS LOGIC ---
  const toolCards = document.querySelectorAll('.yellow-card-flat');
  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      if (!card.classList.contains('selected')) {
        const stepCard = card.closest('.step-card');
        const currentlySelectedInThisCategory = stepCard ? stepCard.querySelectorAll('.yellow-card-flat.selected').length : 0;
        if (currentlySelectedInThisCategory >= 4) {
          showToast("Вы можете выбрать не более 4 инструментов в одном разделе.", "warning");
          return;
        }
      }
      card.classList.toggle('selected');
    });
  });

  // --- 5. STEP 5: ACCORDION AND RADAR PLOT ---
  const accordionTrigger = document.getElementById('accordion-trigger');
  const accordionContent = document.getElementById('accordion-content');
  
  accordionTrigger.addEventListener('click', () => {
    accordionTrigger.classList.toggle('open');
    accordionContent.classList.toggle('open');
  });

  let averageScoreValue = 0;
  let currentDiagnosis = '';
  let potentialIncomeFromDiag = 0;

  function calculateDiagnosticResults() {
    const sum = competencyRatings.reduce((a, b) => a + b, 0);
    averageScoreValue = parseFloat((sum / 6).toFixed(1));
    
    const avgScoreEl = document.getElementById('average-score');
    avgScoreEl.textContent = averageScoreValue.toFixed(1);
    
    const diagnosisTextEl = document.getElementById('diagnosis-text');
    const diagnosisDescEl = document.getElementById('diagnosis-description');
    
    if (averageScoreValue < 2.5) {
      currentDiagnosis = "Начинающий турагент";
      potentialIncomeFromDiag = 30000;
      diagnosisTextEl.className = "accordion-title text-danger";
      diagnosisDescEl.innerHTML = `
        <strong>Ваш профиль: Начинающий турагент.</strong> Вы находитесь на этапе старта в профессии. У вас есть интерес к путешествиям, но отсутствуют ключевые навыки для заработка: вы пока не ориентируетесь в массовых направлениях, не умеете работать в B2B-системах операторов и оформлять документы. Сейчас вы не готовы продавать туры и зарабатывать на этом, так как любая ошибка может стоить клиенту отдыха, а вам — репутации. Вам необходимо начать с базового обучения: освоить географию туризма, технику бронирования и основы работы с клиентами.
      `;
    } else if (averageScoreValue <= 3.8) {
      currentDiagnosis = "Перспективный тревел-эксперт";
      potentialIncomeFromDiag = 60000;
      diagnosisTextEl.className = "accordion-title text-warning";
      diagnosisDescEl.innerHTML = `
        <strong>Ваш профиль: Перспективный тревел-эксперт.</strong> Вы уже имеете базовое представление о туризме и, возможно, бронировали простые туры. Однако ваш доход сдерживается неуверенностью в продажах сложных маршрутов, страхом перед возражениями («дорого», «подумаю») и отсутствием системы привлечения клиентов (маркетинга). Вы готовы к базовым продажам, но для выхода на стабильный доход от 100 000 руб./мес. вам нужно преодолеть синдром самозванца, автоматизировать работу через CRM, освоить визовые тонкости и начать активно упаковывать личный бренд в соцсетях.
      `;
    } else {
      currentDiagnosis = "Профессиональный эксперт (Профи)";
      potentialIncomeFromDiag = 120000;
      diagnosisTextEl.className = "accordion-title text-success";
      diagnosisDescEl.innerHTML = `
        <strong>Ваш профиль: Профессиональный эксперт (Профи).</strong> Вы полностью готовы к высокому заработку и являетесь экспертом. Вы отлично ориентируетесь в направлениях любой сложности, легко собираете динамические пакеты, умеете допродавать услуги и закрывать 70%+ заявок. Ваши юридические знания защищают вас от штрафов и форс-мазоров. Ваша готовность к масштабированию максимальная. Для дальнейшего роста доходов вам нужно внедрять продвинутый маркетинг (воронки, лидмагниты), работать с базой постоянных клиентов по системе лояльности и, возможно, формировать свою команду или открывать собственное агентство.
      `;
    }
    
    diagnosisTextEl.textContent = currentDiagnosis;
    
    // Populate left side values
    document.getElementById('val-skills').textContent = `${competencyRatings[0]}/5`;
    document.getElementById('val-speed').textContent = `${competencyRatings[1]}/5`;
    document.getElementById('val-clients').textContent = `${competencyRatings[2]}/5`;
    document.getElementById('val-confidence').textContent = `${competencyRatings[3]}/5`;
    document.getElementById('val-check').textContent = `${competencyRatings[4]}/5`;
    document.getElementById('val-income').textContent = `${competencyRatings[5]}/5`;
  }

  // Radar drawing logic
  const indicatorListItems = document.querySelectorAll('#indicators-list li');
  const recBox = document.getElementById('rec-box');
  const recPlaceholder = document.getElementById('rec-placeholder');
  const recDetail = document.getElementById('rec-detail');
  const recTitleSelected = document.getElementById('rec-title-selected');
  const recText = document.getElementById('rec-text');

  function renderRadarChart(svgId, ratings) {
    const svg = document.getElementById(svgId);
    svg.innerHTML = '';
    
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const totalAxes = 6;
    
    // concentric rings
    for (let level = 1; level <= 5; level++) {
      const r = (level / 5) * radius;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', center);
      circle.setAttribute('cy', center);
      circle.setAttribute('r', r);
      circle.setAttribute('class', 'chart-grid-line');
      circle.setAttribute('fill', 'none');
      svg.appendChild(circle);
    }
    
    // axes and polygons coords
    const points = [];
    for (let i = 0; i < totalAxes; i++) {
      const angle = (i * 2 * Math.PI) / totalAxes - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', center);
      line.setAttribute('y1', center);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'chart-axis-line');
      svg.appendChild(line);
      
      const score = ratings[i] || 0;
      const rScore = (score / 5) * radius;
      const px = center + rScore * Math.cos(angle);
      const py = center + rScore * Math.sin(angle);
      points.push({x: px, y: py, score: score, index: i, angle: angle});
      
      // axis label
      const labelDist = radius + 22;
      const lx = center + labelDist * Math.cos(angle);
      const ly = center + labelDist * Math.sin(angle) + 4;
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx);
      text.setAttribute('y', ly);
      text.setAttribute('class', 'chart-axis-label');
      text.textContent = shortCategoryNames[i];
      
      text.addEventListener('mouseenter', () => showRecommendation(i));
      text.addEventListener('mouseleave', hideRecommendation);
      svg.appendChild(text);
    }
    
    // draw polygon
    if (points.length > 0) {
      const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', polyPoints);
      polygon.setAttribute('class', 'chart-radar-polygon');
      svg.appendChild(polygon);
    }
    
    // draw vertices
    points.forEach((p, idx) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      node.setAttribute('cx', p.x);
      node.setAttribute('cy', p.y);
      node.setAttribute('r', p.score > 0 ? 5 : 2);
      node.setAttribute('class', 'chart-radar-node');
      
      node.addEventListener('mouseenter', () => {
        showRecommendation(p.index);
        node.setAttribute('r', 7);
      });
      
      node.addEventListener('mouseleave', () => {
        hideRecommendation();
        node.setAttribute('r', p.score > 0 ? 5 : 2);
      });
      
      svg.appendChild(node);
    });
  }

  function showRecommendation(index) {
    const score = competencyRatings[index];
    const categoryName = categoryNames[index];
    
    indicatorListItems.forEach(item => {
      const itemIdx = parseInt(item.getAttribute('data-index'));
      if (itemIdx === index) {
        item.classList.add('highlighted');
      } else {
        item.classList.remove('highlighted');
      }
    });

    recBox.classList.add('active-recommend');
    recPlaceholder.classList.add('hidden');
    recDetail.classList.remove('hidden');
    
    recTitleSelected.textContent = `${categoryName} (Оценка: ${score}/5)`;
    
    let adviceText = "";
    const advices = recommendationsData[index];
    if (score <= 2) {
      adviceText = advices.low;
    } else if (score <= 4) {
      adviceText = advices.mid;
    } else {
      adviceText = advices.high;
    }
    
    recText.textContent = adviceText;
  }

  function hideRecommendation() {
    indicatorListItems.forEach(item => item.classList.remove('highlighted'));
    recBox.classList.remove('active-recommend');
    recPlaceholder.classList.remove('hidden');
    recDetail.classList.add('hidden');
  }

  indicatorListItems.forEach(item => {
    const idx = parseInt(item.getAttribute('data-index'));
    item.addEventListener('mouseenter', () => {
      showRecommendation(idx);
      const svgNodes = document.querySelectorAll('.chart-radar-node');
      if (svgNodes[idx]) svgNodes[idx].setAttribute('r', 7);
    });
    item.addEventListener('mouseleave', () => {
      hideRecommendation();
      const svgNodes = document.querySelectorAll('.chart-radar-node');
      if (svgNodes[idx]) svgNodes[idx].setAttribute('r', competencyRatings[idx] > 0 ? 5 : 2);
    });
  });

  // --- 6. STEP 12: CALCULATOR LOGIC ---
  const calcPeriodBtns = document.querySelectorAll('.calc-period-btn');
  
  const sliderTours = document.getElementById('input-tours');
  const sliderPrice = document.getElementById('input-tour-price');
  const sliderAddons = document.getElementById('input-addons');
  const sliderCommission = document.getElementById('input-commission');

  const badgeTours = document.getElementById('badge-tours');
  const badgePrice = document.getElementById('badge-tour-price');
  const badgeAddons = document.getElementById('badge-addons');
  const badgeCommission = document.getElementById('badge-commission');

  const resSalesVolume = document.getElementById('res-sales-volume');
  const resMonthlyIncome = document.getElementById('res-monthly-income');
  const resPeriodIncome = document.getElementById('res-period-income');
  const resAnnualTotal = document.getElementById('res-annual-total');
  const calcGoalText = document.getElementById('calc-goal-text');

  calcPeriodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calcPeriodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activeCalcPeriod = parseInt(btn.getAttribute('data-period'));
      loadPeriodValues(activeCalcPeriod);
    });
  });

  function loadPeriodValues(period) {
    const state = calculatorPeriods[period];
    
    sliderTours.value = state.tours;
    sliderPrice.value = state.price;
    sliderAddons.value = state.addons;
    sliderCommission.value = state.commission;
    
    badgeTours.textContent = `${state.tours} шт.`;
    badgePrice.textContent = `${formatNumber(state.price)} руб.`;
    badgeAddons.textContent = `${state.addons} шт.`;
    badgeCommission.textContent = `${state.commission}%`;
    
    calculatePeriodIncome();
  }

  sliderTours.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    badgeTours.textContent = `${val} шт.`;
    calculatorPeriods[activeCalcPeriod].tours = val;
    calculatePeriodIncome();
  });

  sliderPrice.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    badgePrice.textContent = `${formatNumber(val)} руб.`;
    calculatorPeriods[activeCalcPeriod].price = val;
    calculatePeriodIncome();
  });

  sliderAddons.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    badgeAddons.textContent = `${val} шт.`;
    calculatorPeriods[activeCalcPeriod].addons = val;
    calculatePeriodIncome();
  });

  sliderCommission.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    badgeCommission.textContent = `${val}%`;
    calculatorPeriods[activeCalcPeriod].commission = val;
    calculatePeriodIncome();
  });

  function calculatePeriodIncome() {
    const state = calculatorPeriods[activeCalcPeriod];
    const totalSalesVolume = (state.tours * state.price) + (state.addons * 5000);
    
    const finalCommissionRate = state.commission;
    const monthlyIncome = Math.round(totalSalesVolume * (finalCommissionRate / 100));
    
    // Compute cumulative incomes for each stage
    const incomes = {};
    for (let p = 1; p <= 4; p++) {
      const pState = calculatorPeriods[p];
      const pVol = (pState.tours * pState.price) + (pState.addons * 5000);
      const pRate = pState.commission;
      incomes[p] = Math.round(pVol * (pRate / 100));
    }
    
    let periodIncome = 0;
    let labelText = "ЧИСТЫЙ ДОХОД ЗА ПЕРИОД";
    
    if (activeCalcPeriod === 1) {
      periodIncome = incomes[1] * 1;
      labelText = "ЧИСТЫЙ ДОХОД ЗА 1 МЕСЯЦ";
    } else if (activeCalcPeriod === 2) {
      periodIncome = (incomes[1] * 1) + (incomes[2] * 2);
      labelText = "НАКОПЛЕННЫЙ ДОХОД ЗА 3 МЕСЯЦА";
    } else if (activeCalcPeriod === 3) {
      periodIncome = (incomes[1] * 1) + (incomes[2] * 2) + (incomes[3] * 3);
      labelText = "НАКОПЛЕННЫЙ ДОХОД ЗА 6 МЕСЯЦЕВ";
    } else if (activeCalcPeriod === 4) {
      periodIncome = (incomes[1] * 1) + (incomes[2] * 2) + (incomes[3] * 3) + (incomes[4] * 6);
      labelText = "НАКОПЛЕННЫЙ ДОХОД ЗА 12 МЕСЯЦЕВ";
    }
    
    resSalesVolume.textContent = `${formatNumber(totalSalesVolume)} руб.`;
    resMonthlyIncome.textContent = `${formatNumber(monthlyIncome)} руб.`;
    resPeriodIncome.textContent = `${formatNumber(periodIncome)} руб.`;
    
    const lblEl = document.getElementById('res-period-income-label');
    if (lblEl) {
      lblEl.textContent = labelText;
    }
    
    calculateAnnualSum();
    
    // Goal Alert card computation
    const goalTarget = userInfo.income_target;
    if (monthlyIncome >= goalTarget) {
      calcGoalText.innerHTML = `Поздравляем! При таких показателях вы полностью достигаете вашей цели по доходу в <strong>${formatNumber(goalTarget)} руб./мес.</strong>!`;
      document.getElementById('calc-goal-card').style.backgroundColor = 'rgba(72, 187, 120, 0.15)';
    } else {
      const diffNeeded = goalTarget - monthlyIncome;
      const singleTourEarnings = Math.round(state.price * (finalCommissionRate / 100));
      const toursNeeded = Math.ceil(diffNeeded / (singleTourEarnings || 1));
      
      calcGoalText.innerHTML = `Чтобы достичь цели в <strong>${formatNumber(goalTarget)} руб./мес.</strong>, вам нужно продавать еще <strong>${toursNeeded} шт.</strong> туров в месяц при текущем чеке.`;
      document.getElementById('calc-goal-card').style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
    }
  }

  function calculateAnnualSum() {
    let annualSum = 0;
    
    for (let period = 1; period <= 4; period++) {
      const state = calculatorPeriods[period];
      const vol = (state.tours * state.price) + (state.addons * 5000);
      const rate = state.commission;
      const monIncome = vol * (rate / 100);
      
      let mult = 1;
      if (period === 2) mult = 2;
      else if (period === 3) mult = 3;
      else if (period === 4) mult = 6;
      
      annualSum += monIncome * mult;
    }
    
    annualSum = Math.round(annualSum);
    resAnnualTotal.textContent = `${formatNumber(annualSum)} руб.`;
  }

  function updateCalculatorUI() {
    loadPeriodValues(activeCalcPeriod);
  }

  // Next from calculator
  document.getElementById('btn-calc-next').addEventListener('click', () => {
    showStep(13); // show final page
  });

  // --- 7. STEP 13: DIAGNOSTIC CARD SUMMARY ---
  const finalDiagnosisText = document.getElementById('final-diagnosis');
  const finalAvgScoreText = document.getElementById('final-average-score');
  const finalPotentialIncomeText = document.getElementById('final-potential-income');
  const finalBonusText = document.getElementById('final-bonus-text');

  function populateFinalReport() {
    // Generate random months between 1 and 6
    randomBonusMonths = Math.floor(Math.random() * 6) + 1;
    bonusRevealed = false;
    
    // Reset mystery card state
    const mysteryCard = document.getElementById('mystery-bonus-card');
    const boxFront = document.getElementById('mystery-box-front');
    const boxBack = document.getElementById('mystery-box-back');
    const finalBonusIntro = document.getElementById('final-bonus-intro');
    
    if (mysteryCard) {
      mysteryCard.classList.remove('spin-animation');
      boxFront.style.display = 'flex';
      boxBack.style.display = 'none';
      finalBonusIntro.textContent = "Нажмите на подарок слева, чтобы испытать удачу и узнать свой персональный бонус!";
      finalBonusText.textContent = "[Нажмите на карточку подарка, чтобы открыть ваш бонус]";
    }
    
    finalDiagnosisText.textContent = currentDiagnosis;
    finalAvgScoreText.textContent = `${averageScoreValue.toFixed(1)} / 5`;
    
    // Use Month 12 potential monthly income as potential
    const finalState = calculatorPeriods[4];
    const finalVol = (finalState.tours * finalState.price) + (finalState.addons * 5000);
    const finalRate = finalState.commission;
    const finalPeriod4Income = Math.round(finalVol * (finalRate / 100));
    
    finalPotentialIncomeText.textContent = `${formatNumber(finalPeriod4Income)} руб.`;

    // Process and display selected tools on Slide 13 screen
    const selectedCards = document.querySelectorAll('.yellow-card-flat.selected');
    const toolsBox = document.getElementById('final-tools-analysis-box');
    const toolsList = document.getElementById('final-tools-list');
    const toolsAnalysisText = document.getElementById('final-tools-analysis-text');
    
    if (selectedCards.length === 0) {
      toolsBox.style.display = 'none';
    } else {
      toolsBox.style.display = 'block';
      toolsList.innerHTML = '';
      
      selectedCards.forEach(card => {
        const item = document.createElement('div');
        item.style.marginBottom = '6px';
        
        const stepCard = card.closest('.step-card');
        let categoryLabel = '';
        if (stepCard) {
          const stepId = stepCard.id;
          if (stepId === 'step-6') categoryLabel = 'Страноведение';
          else if (stepId === 'step-7') categoryLabel = 'Бронирование';
          else if (stepId === 'step-8') categoryLabel = 'Клиентский сервис';
          else if (stepId === 'step-9') categoryLabel = 'Привлечение клиентов';
          else if (stepId === 'step-10') categoryLabel = 'Продажи';
          else if (stepId === 'step-11') categoryLabel = 'Право';
        }
        
        item.innerHTML = `• <strong>[${categoryLabel}]</strong> ${card.textContent.trim()}`;
        toolsList.appendChild(item);
      });
      
      // Compile dynamic strategy analysis
      const chosenCategories = new Set();
      selectedCards.forEach(card => {
        const stepCard = card.closest('.step-card');
        if (stepCard) chosenCategories.add(stepCard.id);
      });
      
      let analysisParagraphs = [];
      if (chosenCategories.has('step-6')) {
        analysisParagraphs.push("расширение кругозора по направлениям поможет вам привлекать более состоятельных клиентов и собирать сложные индивидуальные туры;");
      }
      if (chosenCategories.has('step-7')) {
        analysisParagraphs.push("освоение систем бронирования ускорит работу и исключит ошибки при выписке билетов и ваучеров;");
      }
      if (chosenCategories.has('step-8')) {
        analysisParagraphs.push("внедрение стандартов поддержки в поездке увеличит процент повторных обращений и рекомендаций;");
      }
      if (chosenCategories.has('step-9')) {
        analysisParagraphs.push("систематический постинг и настройка воронки в соцсетях обеспечат вас постоянным потоком входящих заявок;");
      }
      if (chosenCategories.has('step-10')) {
        analysisParagraphs.push("применение скриптов работы с возражениями («дорого», «подумаю») повысит конверсию из заявок в реальные продажи;");
      }
      if (chosenCategories.has('step-11')) {
        analysisParagraphs.push("знание законов в туризме и правил работы с претензиями обеспечит юридическую безопасность вашего дела.");
      }
      
      const targetIncome = userInfo.income_target || 0;
      const analysisIntro = `Анализ выбранной стратегии: Ваша тактика сфокусирована на развитии ключевых областей. Внедрение выбранных инструментов принесет следующие результаты: ${analysisParagraphs.join(' ')} Это существенно облегчит выход на целевой доход в размере ${formatNumber(targetIncome)} руб. в месяц и снизит процент «слитых» заявок.`;
      
      toolsAnalysisText.textContent = analysisIntro;
    }
  }

  document.getElementById('btn-back-to-wheel').addEventListener('click', () => {
    showStep(5); // Go back to step 5 radar
  });

  const btnWhatNext = document.getElementById('btn-what-next');
  if (btnWhatNext) {
    btnWhatNext.addEventListener('click', () => {
      showStep(14);
    });
  }

  const btnBackToResults = document.getElementById('btn-back-to-results');
  if (btnBackToResults) {
    btnBackToResults.addEventListener('click', () => {
      showStep(13);
    });
  }

  // Mystery Box spin and reveal click listener
  const mysteryCard = document.getElementById('mystery-bonus-card');
  if (mysteryCard) {
    mysteryCard.addEventListener('click', () => {
      if (bonusRevealed) return;
      bonusRevealed = true;
      
      const boxFront = document.getElementById('mystery-box-front');
      const boxBack = document.getElementById('mystery-box-back');
      const revealedNum = document.getElementById('revealed-months-num');
      const revealedLbl = document.getElementById('revealed-months-lbl');
      const finalBonusIntro = document.getElementById('final-bonus-intro');
      
      mysteryCard.classList.add('spin-animation');
      
      // Swap content halfway through the spin animation (600ms)
      setTimeout(() => {
        boxFront.style.display = 'none';
        boxBack.style.display = 'flex';
        revealedNum.textContent = randomBonusMonths;
        
        const word = getMonthWord(randomBonusMonths);
        if (word === 'месяц') {
          revealedLbl.textContent = 'месяц клуба';
        } else if (word === 'месяца') {
          revealedLbl.textContent = 'месяца клуба';
        } else {
          revealedLbl.textContent = 'месяцев клуба';
        }
      }, 600);
      
      // Update text descriptions when spin animation completes (1200ms)
      setTimeout(() => {
        finalBonusIntro.innerHTML = `🎉 Поздравляем! Ваша удача сработала!`;
        finalBonusText.innerHTML = `
          Ваш персональный бонус: <strong>${randomBonusMonths} ${getMonthWord(randomBonusMonths)}</strong> бесплатного доступа к Клубу ВШТ + постоянный доступ к курсу <strong>«ВК и Макс для турагента»</strong>!
        `;
        mysteryCard.classList.remove('spin-animation');
      }, 1200);
    });
  }

  // --- 8. CLIENT-SIDE PDF EXPORT ---
  const btnDownloadPdf = document.getElementById('btn-download-pdf');

  btnDownloadPdf.addEventListener('click', () => {
    if (typeof html2pdf === 'undefined') {
      showToast("Библиотека html2pdf.js не загружена. Пожалуйста, обновите страницу.", "error");
      return;
    }

    const selectedCards = document.querySelectorAll('.yellow-card-flat.selected');

    // Auto-reveal bonus if they click download PDF before opening the gift
    if (!bonusRevealed) {
      bonusRevealed = true;
      const boxFront = document.getElementById('mystery-box-front');
      const boxBack = document.getElementById('mystery-box-back');
      const revealedNum = document.getElementById('revealed-months-num');
      const revealedLbl = document.getElementById('revealed-months-lbl');
      const finalBonusIntro = document.getElementById('final-bonus-intro');
      
      if (boxFront && boxBack && revealedNum && revealedLbl && finalBonusIntro) {
        boxFront.style.display = 'none';
        boxBack.style.display = 'flex';
        revealedNum.textContent = randomBonusMonths;
        
        const word = getMonthWord(randomBonusMonths);
        revealedLbl.textContent = word === 'месяц' ? 'месяц клуба' : word === 'месяца' ? 'месяца клуба' : 'месяцев клуба';
        
        finalBonusIntro.innerHTML = `🎉 Поздравляем! Ваша удача сработала!`;
        finalBonusText.innerHTML = `
          Ваш персональный бонус: <strong>${randomBonusMonths} ${getMonthWord(randomBonusMonths)}</strong> бесплатного доступа к Клубу ВШТ + постоянный доступ к курсу <strong>«ВК и Макс для турагента»</strong>!
        `;
      }
    }
    // Populate print templates values with safe fallbacks
    document.getElementById('pdf-name').textContent = userInfo.name || 'Кандидат';
    document.getElementById('pdf-activity').textContent = userInfo.activity || 'Не указано';
    document.getElementById('pdf-experience').textContent = userInfo.experience || 'Не указано';
    document.getElementById('pdf-target-income').textContent = `${formatNumber(userInfo.income_target || 0)} руб.`;
    
    document.querySelectorAll('#pdf-diagnosis').forEach(el => el.textContent = currentDiagnosis);
    document.getElementById('pdf-avg-score').textContent = `${averageScoreValue.toFixed(1)} / 5`;
    
    const finalState = calculatorPeriods[4];
    const finalVol = (finalState.tours * finalState.price) + (finalState.addons * 5000);
    const finalRate = finalState.commission;
    const finalIncome = Math.round(finalVol * (finalRate / 100));
    document.getElementById('pdf-potential-income-val').textContent = `${formatNumber(finalIncome)} руб.`;
    
    document.getElementById('pdf-score-skills').textContent = `${competencyRatings[0]}/5`;
    document.getElementById('pdf-score-speed').textContent = `${competencyRatings[1]}/5`;
    document.getElementById('pdf-score-clients').textContent = `${competencyRatings[2]}/5`;
    document.getElementById('pdf-score-confidence').textContent = `${competencyRatings[3]}/5`;
    document.getElementById('pdf-score-check').textContent = `${competencyRatings[4]}/5`;
    document.getElementById('pdf-score-income').textContent = `${competencyRatings[5]}/5`;

    renderRadarChart('pdf-radar-svg', competencyRatings);
    
    const pdfRecsList = document.getElementById('pdf-recommendations-list');
    pdfRecsList.innerHTML = '';
    competencyRatings.forEach((rating, i) => {
      const item = document.createElement('div');
      item.className = 'pdf-rec-item';
      const advices = recommendationsData[i];
      let adviceText = rating <= 2 ? advices.low : rating <= 4 ? advices.mid : advices.high;
      item.innerHTML = `<strong>${categoryNames[i]}:</strong> ${adviceText}`;
      pdfRecsList.appendChild(item);
    });

    // Populate selected tools inside PDF template
    const pdfSelectedToolsList = document.getElementById('pdf-selected-tools-list');
    const pdfSelectedToolsAnalysis = document.getElementById('pdf-selected-tools-analysis');
    pdfSelectedToolsList.innerHTML = '';
    
    if (selectedCards.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'pdf-rec-item';
      emptyItem.innerHTML = `<em>Инструменты не выбраны. Вы можете просмотреть полезные инструменты для заработка на сайте.</em>`;
      pdfSelectedToolsList.appendChild(emptyItem);
      pdfSelectedToolsAnalysis.style.display = 'none';
    } else {
      pdfSelectedToolsAnalysis.style.display = 'block';
      selectedCards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'pdf-rec-item';
        
        const stepCard = card.closest('.step-card');
        let categoryLabel = '';
        if (stepCard) {
          const stepId = stepCard.id;
          if (stepId === 'step-6') categoryLabel = 'Страноведение';
          else if (stepId === 'step-7') categoryLabel = 'Бронирование';
          else if (stepId === 'step-8') categoryLabel = 'Клиентский сервис';
          else if (stepId === 'step-9') categoryLabel = 'Привлечение клиентов';
          else if (stepId === 'step-10') categoryLabel = 'Продажи';
          else if (stepId === 'step-11') categoryLabel = 'Право';
        }
        
        item.innerHTML = `• <strong>[${categoryLabel}]</strong> ${card.textContent.trim()}`;
        pdfSelectedToolsList.appendChild(item);
      });

      // Generate identical strategy analysis paragraph for PDF
      const chosenCategories = new Set();
      selectedCards.forEach(card => {
        const stepCard = card.closest('.step-card');
        if (stepCard) chosenCategories.add(stepCard.id);
      });
      
      let analysisParagraphs = [];
      if (chosenCategories.has('step-6')) {
        analysisParagraphs.push("расширение кругозора по направлениям поможет вам привлекать более состоятельных клиентов и собирать сложные индивидуальные туры;");
      }
      if (chosenCategories.has('step-7')) {
        analysisParagraphs.push("освоение систем бронирования ускорит работу и исключит ошибки при выписке билетов и ваучеров;");
      }
      if (chosenCategories.has('step-8')) {
        analysisParagraphs.push("внедрение стандартов поддержки в поездке увеличит процент повторных обращений и рекомендаций;");
      }
      if (chosenCategories.has('step-9')) {
        analysisParagraphs.push("систематический постинг и настройка воронки в соцсетях обеспечат вас постоянным потоком входящих заявок;");
      }
      if (chosenCategories.has('step-10')) {
        analysisParagraphs.push("применение скриптов работы с возражениями («дорого», «подумаю») повысит конверсию из заявок в реальные продажи;");
      }
      if (chosenCategories.has('step-11')) {
        analysisParagraphs.push("знание законов в туризме и правил работы с претензиями обеспечит юридическую безопасность вашего дела.");
      }
      
      const targetIncome = userInfo.income_target || 0;
      const analysisIntro = `Анализ выбранной стратегии: Ваша тактика сфокусирована на развитии ключевых областей. Внедрение выбранных инструментов принесет следующие результаты: ${analysisParagraphs.join(' ')} Это существенно облегчит выход на целевой доход в размере ${formatNumber(targetIncome)} руб. в месяц и снизит процент «слитых» заявок.`;
      
      pdfSelectedToolsAnalysis.textContent = analysisIntro;
    }

    const pdfCalcTbody = document.getElementById('pdf-calc-tbody');
    pdfCalcTbody.innerHTML = '';
    
    let sumForAnnual = 0;
    const periodLabels = {
      1: "1-й месяц (Обучение)",
      2: "2-3 месяцы (Адаптация)",
      3: "4-6 месяцы (Практика)",
      4: "7-12 месяцы (Профи)"
    };
    
    for (let period = 1; period <= 4; period++) {
      const state = calculatorPeriods[period];
      const vol = (state.tours * state.price) + (state.addons * 5000);
      const rate = state.commission;
      const monIncome = vol * (rate / 100);
      let mult = period === 2 ? 2 : period === 3 ? 3 : period === 4 ? 6 : 1;
      sumForAnnual += monIncome * mult;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${periodLabels[period]}</td>
        <td>${state.tours} шт./мес.</td>
        <td>${state.addons} шт./мес.</td>
        <td>${formatNumber(vol)} руб.</td>
        <td>${formatNumber(Math.round(monIncome))} руб.</td>
      `;
      pdfCalcTbody.appendChild(tr);
    }
    
    document.getElementById('pdf-total-annual-earnings').textContent = `${formatNumber(Math.round(sumForAnnual))} руб.`;
    document.getElementById('pdf-pdf-bonus-text').innerHTML = `
      <strong>${randomBonusMonths} ${getMonthWord(randomBonusMonths)}</strong> доступа к Клубу ВШТ + обучающий курс «ВК и Макс для турагента».
    `;
    
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    document.getElementById('pdf-date-today').textContent = `${dd}.${mm}.${yyyy}`;

    const element = document.getElementById('pdf-printable-template');
    element.classList.remove('pdf-template-hidden');
    element.classList.add('pdf-rendered-container');
    
    const nameSanitized = (userInfo.name || 'Кандидат').trim().replace(/\s+/g, '_');
    const opt = {
      margin:       10,
      filename:     `Диагностическая_карта_ВШТ_${nameSanitized}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.add('pdf-template-hidden');
      element.classList.remove('pdf-rendered-container');
    }).catch(err => {
      showToast("Ошибка экспорта PDF. Пожалуйста, попробуйте распечатать через Ctrl+P.", "error");
    });
  });

  // --- 9. UTILITIES ---
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function getMonthWord(number) {
    if (number === 1) return "месяц";
    if (number >= 2 && number <= 4) return "месяца";
    return "месяцев";
  }

  // Premium Toast Notification System
  function showToast(message, type = 'warning') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'warning') icon = '⚠️';
    else if (type === 'error') icon = '❌';
    else if (type === 'success') icon = '✅';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    // Trigger slide-in animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3500);
  }
  
});
