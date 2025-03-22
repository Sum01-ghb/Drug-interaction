async function checkInteraction() {
  const drugName = document.getElementById("drugInput").value.trim();
  if (!drugName) {
    alert("Please enter a drug name.");
    return;
  }

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "Checking interactions...";

  try {
    const response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
        drugName
      )}"&limit=1`
    );

    if (!response.ok) {
      resultDiv.innerHTML = "<p>No data found for this drug.</p>";
      return;
    }

    const data = await response.json();

    if (
      !data.results ||
      data.results.length === 0 ||
      !data.results[0].warnings
    ) {
      resultDiv.innerHTML = "<p>No known interactions found.</p>";
      return;
    }

    const warnings = data.results[0].warnings.join("<br><br>");

    resultDiv.innerHTML = `
      <p><strong>Potential Interactions & Warnings:</strong></p>
      <p>${warnings}</p>
    `;
  } catch (error) {
    console.error("Error fetching data:", error);
    resultDiv.innerHTML = "<p>Error fetching data. Please try again later.</p>";
  }
}
