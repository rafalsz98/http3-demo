// Embedded JS here
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function changeBoxColor() {
  const box = document.getElementById("box");
  const timestampText = document.getElementById("timestampText");

  box.style.backgroundColor = getRandomColor();
  timestampText.textContent = new Date().toLocaleTimeString();
}
