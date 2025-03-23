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
      `http://localhost:5500/interactions?drug=${encodeURIComponent(drugName)}`
    );

    if (!response.ok) {
      resultDiv.innerHTML = "<p>No data found for this drug.</p>";
      return;
    }

    const data = await response.json();

    if (!data.warnings || data.warnings.length === 0) {
      resultDiv.innerHTML = "<p>No known interactions found.</p>";
      return;
    }

    resultDiv.innerHTML = `
      <p><strong>Potential Interactions & Warnings:</strong></p>
      <p>${data.warnings.join("<br><br>")}</p>
    `;
  } catch (error) {
    console.error("Error fetching data:", error);
    resultDiv.innerHTML = "<p>Error fetching data. Please try again later.</p>";
  }
}
