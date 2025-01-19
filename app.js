document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".owl-item");
  const nextButton = document.getElementById("calc-next");
  const prevButton = document.getElementById("calc-prev");
  const sendButton = document.getElementById("calc-submit");
  const calcSquare = document.querySelector(".calc_square"); // Элемент calc_square
  const setTypeElement = document.querySelector(".set-type");
  const setTimeElement = document.querySelector(".set-time");
  const setDateElement = document.querySelector(".set-date");
  const setPeopleElement = document.querySelector(".set-people");
  const totalAmountElements = document.querySelectorAll("#total-price");
  const setOptionsElement = document.querySelector(".set-options");
  const personInput = document.querySelector(".select-people");
  const timeInput = document.querySelector("#time");
  const dateInput = document.querySelector("#date");
  const owlStage = document.querySelector(".owl-stage");

  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"][data-group="extras"]'
  );
  const costPerPerson = 8.8;
  let currentStep = 0;

  flatpickr("#date", {
    dateFormat: "d/m/Y",
    defaultDate: "today",
    allowInput: true,
  });

  const updateVenueType = () => {
    const selectedRadio = document.querySelector('input[name="type"]:checked');
    if (selectedRadio) {
      setTypeElement.textContent = selectedRadio.value.trim();
    }
  };

  const scrollToActiveCard = () => {
    const activeStep = document.querySelector(".owl-item.active");
    if (activeStep) {
      activeStep.scrollIntoView({
        behavior: "smooth", // Анимация прокрутки
        block: "center", // Центрирование карточки в контейнере
        inline: "center", // Для горизонтальной прокрутки (если используется)
      });
    }
  };

  const updateTotalAmount = () => {
    const numberOfPersons = parseInt(personInput.value) || 0;
    let totalAmount = numberOfPersons * costPerPerson;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const extraCost = parseFloat(
          checkbox.nextElementSibling.querySelector("span").textContent
        );
        totalAmount += extraCost;
      }
    });

    totalAmountElements.forEach((element) => {
      element.textContent = totalAmount.toFixed(2);
    });
  };

  const updateSelectedOptions = () => {
    const selectedOptions = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value.trim());

    setOptionsElement.textContent = selectedOptions.length
      ? selectedOptions.join(", ")
      : "No extra option";
  };

  const updateSummary = () => {
    const selectedTime = timeInput.value;
    setTimeElement.textContent = selectedTime;

    const selectedDate = dateInput.value;
    if (selectedDate) {
      const [day, month, year] = selectedDate.split("/");
      const date = new Date(`${year}-${month}-${day}`);
      const formattedDate = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
      setDateElement.textContent = formattedDate;
    }

    const selectedPeople = personInput.value;
    setPeopleElement.textContent = selectedPeople;
  };
  const moveCalcSquare = () => {
    const activeStep = document.querySelector(".owl-item.active");
    if (activeStep && calcSquare && owlStage) {
      // Получаем размеры и положение активного шага
      const activeRect = activeStep.getBoundingClientRect();
      const stageRect = owlStage.getBoundingClientRect();
      const offsetX = activeRect.left - stageRect.left;

      // Обновляем размеры и позицию calcSquare
      calcSquare.style.width = `${activeRect.width}px`;
      calcSquare.style.height = `${activeRect.height}px`;
      calcSquare.style.transform = `translateX(${offsetX}px)`;

      // Устанавливаем высоту owl-stage
      owlStage.style.height = `${activeStep.offsetHeight}px`;
    }
  };

  const validateStep = (step) => {
    const inputs = steps[step].querySelectorAll("input, select");
    let isValid = true;

    inputs.forEach((input) => {
      const value = input.value.trim();

      // Проверка для текстовых полей, email и чисел
      if (input.required && !value) {
        isValid = false;
        input.classList.add("error");
      } else if (input.type === "email" && input.required) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      } else if (input.type === "number" && input.required) {
        if (isNaN(value) || value <= 0) {
          isValid = false;
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      } else if (input.type === "radio") {
        // Проверка для группы радио-кнопок
        const radioGroup = document.querySelectorAll(
          `input[name="${input.name}"]`
        );
        const isChecked = Array.from(radioGroup).some((radio) => radio.checked);
        if (!isChecked) {
          isValid = false;
          input.closest(".radio-button-group").classList.add("error");
        } else {
          input.closest(".radio-button-group").classList.remove("error");
        }
      } else if (input.type === "checkbox" && input.dataset.group) {
        // Проверка для группы чекбоксов
        const checkboxGroup = document.querySelectorAll(
          `input[data-group="${input.dataset.group}"]`
        );
        const isChecked = Array.from(checkboxGroup).some(
          (checkbox) => checkbox.checked
        );
        if (!isChecked) {
          isValid = false;
          checkboxGroup.forEach((checkbox) => checkbox.classList.add("error"));
        } else {
          checkboxGroup.forEach((checkbox) =>
            checkbox.classList.remove("error")
          );
        }
      } else {
        input.classList.remove("error");
      }
    });

    if (isValid) {
      steps[step].classList.add("completed");
    } else {
      steps[step].classList.remove("completed");
    }

    return isValid;
  };

  const updateStep = () => {
    // Обновляем классы активных шагов
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
    });

    // Обновляем кнопки
    prevButton.classList.toggle("disabled", currentStep === 0);
    nextButton.style.display =
      currentStep === steps.length - 1 ? "none" : "flex";
    sendButton.style.display =
      currentStep === steps.length - 1 ? "flex" : "none";

    // Перемещаем calcSquare и задаем высоту owl-stage
    moveCalcSquare();
  };

  document.querySelectorAll('input[name="type"]').forEach((radio) => {
    radio.addEventListener("change", updateVenueType);
  });

  personInput.addEventListener("change", () => {
    updateTotalAmount();
    updateSelectedOptions();
    updateSummary();
  });

  timeInput.addEventListener("change", updateSummary);
  dateInput.addEventListener("change", updateSummary);

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateTotalAmount();
      updateSelectedOptions();
    });
  });

  const sendOrder = () => {
    // Собираем данные из всех шагов
    const data = {
      date: setDateElement.textContent,
      time: setTimeElement.textContent,
      persons: setPeopleElement.textContent,
      venueType: setTypeElement.textContent,
      options: setOptionsElement.textContent,
      totalAmount: document.querySelector("#total-price").textContent,
      // Данные с Step 5
      name: document.getElementById("name1").value.trim(),
      phone: document.getElementById("phone1").value.trim(),
      email: document.getElementById("email1").value.trim(),
      address: document.getElementById("address1").value.trim(),
      paymentOption: document.getElementById("deposit").value,
      termsAccepted: document.getElementById("terms").checked,
    };

    // Проверяем обязательные поля на последнем шаге
    if (!data.name || !data.phone || !data.email || !data.termsAccepted) {
      alert("Please fill in all required fields and accept the terms.");
      return;
    }

    console.log("Sending order:", data);

    // Отправляем данные на сервер (пример с fetch)
    fetch("/submit-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to submit order");
      })
      .then((result) => {
        alert("Order submitted successfully!");
        console.log("Server response:", result);
      })
      .catch((error) => {
        console.error("Error submitting order:", error);
        alert("Failed to submit order. Please try again.");
      });
  };

  nextButton.addEventListener("click", () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
      }
    } else {
      alert("Please fill in all required fields correctly.");
    }
  });

  prevButton.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateStep();
    }
  });

  sendButton.addEventListener("click", sendOrder);

  updateStep();
  updateTotalAmount();
  updateSelectedOptions();
  updateSummary();

  window.addEventListener("resize", () => {
    moveCalcSquare();
  });
});
