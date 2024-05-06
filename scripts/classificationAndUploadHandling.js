// Set up everything after the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  setupFileUploadListener();
  setupDragAndDrop();

  // Query example containers
  const exampleContainers = document.querySelectorAll(".example-container");

  exampleContainers.forEach((container) => {
    const imgElement = container.querySelector("img");
    const chartContainerId = container.querySelector(".pie-chart").id;
    const loadingIndicator = container.querySelector(".loader");

    // Set image load behavior
    imgElement.onload = () => {
      loadingIndicator.style.display = "block";
      classifyImage(imgElement, loadingIndicator, chartContainerId);
    };

    // Handle cases where the image is already loaded
    if (imgElement.complete) {
      loadingIndicator.style.display = "block";
      classifyImage(imgElement, loadingIndicator, chartContainerId);
    }
  });
});

// Initializes file upload listener
function setupFileUploadListener() {
  document
    .getElementById("file-input")
    .addEventListener("change", function (event) {
      handleFileSelect(event.target.files[0]);
    });

  document
    .querySelector(".upload-area button")
    .addEventListener("click", function () {
      document.getElementById("file-input").click();
    });
}

// Handles file selection and sets up the image display
function handleFileSelect(file) {
  // Check file data type
  if (!file.type.match('image.*')) {
    alert('Please only select images!');
    return;
  }

  // Destroy existing chart if present
  if (window.tryYourselfChart) {
    window.tryYourselfChart.destroy();
  }

  // Remove existing chart container if present
  const existingChartContainer = document.getElementById(
    "chart-container-try-yourself"
  );
  if (existingChartContainer) {
    existingChartContainer.remove();
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imgElement = document.createElement("img");
    imgElement.src = e.target.result;
    imgElement.className =
      "w-full max-w-xs max-h-xs rounded shadow-md justify-center";

    const imageContainer = document.getElementById("image-container");
    imageContainer.innerHTML = "";
    imageContainer.className =
      "flex-1 flex items-center mb-2 mr-4 justify-center";
    imageContainer.appendChild(imgElement);

    // Create and append the classify button
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "ml-3";

    const classifyButton = document.createElement("button");
    classifyButton.textContent = "Classify";
    classifyButton.className =
      "bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl transition duration-300 ease-in-out ml-2";
    classifyButton.onclick = function () {
      this.style.display = "none";
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "loader ml-10";
      buttonContainer.appendChild(loadingIndicator);
      classifyImage(
        imgElement,
        loadingIndicator,
        "chart-container-try-yourself"
      );
    };
    buttonContainer.appendChild(classifyButton);
    imageContainer.appendChild(buttonContainer);
  };
  reader.readAsDataURL(file);
}

// Set up drag and drop functionality
function setupDragAndDrop() {
  const uploadArea = document.querySelector(".upload-area");
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.add("highlight"),
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    uploadArea.addEventListener(
      eventName,
      () => uploadArea.classList.remove("highlight"),
      false
    );
  });

  uploadArea.addEventListener("drop", function (e) {
    handleFileSelect(e.dataTransfer.files[0]);
  });
}

// Uses ML5 to classify images and handle the result
function classifyImage(imgElement, loadingIndicator, chartContainerId) {
  const classifier = ml5.imageClassifier("MobileNet", () => {
    classifier.classify(imgElement, (err, results) => {
      loadingIndicator.style.display = "none";
      if (err) {
        console.error(err);
      } else {
        displayResults(
          results,
          chartContainerId,
          chartContainerId != "chart-container-try-yourself"
        );
      }
    });
  });
}

// Displays classification results in a chart
function displayResults(results, chartContainerId, isExample = false) {
  let chartContainer = document.getElementById(chartContainerId);
  if (!chartContainer) {
    chartContainer = document.createElement("div");
    chartContainer.id = chartContainerId;
    chartContainer.className = isExample
      ? "chart-container w-full"
      : "flex-1 w-1/4 h-1/2 justify-start items-center";

    const resultsContainer = isExample
      ? document.getElementById(chartContainerId).parentNode
      : document.getElementById("try-yourself-container");
    resultsContainer.appendChild(chartContainer);
  }

  let resultChartNaming = isExample
    ? "result-chart-" + chartContainerId
    : "result-chart";
  chartContainer.innerHTML = '<canvas id="' + resultChartNaming + '"></canvas>';

  const ctx = document.getElementById(resultChartNaming).getContext("2d");

  // Prepare data for the chart
  const labels = results.map(
    (result) =>
      `${result.label.split(", ")[0]}: ${parseFloat(
        (result.confidence * 100).toFixed(2)
      )}%`
  );
  const data = results.map((result) =>
    parseFloat((result.confidence * 100).toFixed(2))
  );

  // Include an 'Others' category to fill out the rest of the chart
  const sumOfConfidences = data.reduce((acc, val) => acc + val, 0);
  labels.push("Others: " + (100 - sumOfConfidences).toFixed(2) + "%");
  data.push(100 - sumOfConfidences);

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "rgba(155, 89, 182, 0.6)",
            "rgba(52, 152, 219, 0.6)",
            "rgba(155, 106, 255, 0.6)",
            "rgba(210, 180, 222, 0.6)",
          ],
          borderColor: [
            "rgba(155, 89, 182, 1)",
            "rgba(52, 152, 219, 1)",
            "rgba(155, 106, 255, 1)",
            "rgba(210, 180, 222, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  });
}
