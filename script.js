// Fun color-changing background!
const colors = [
  "linear-gradient(135deg, #222 0%, #333 100%)",
  "linear-gradient(135deg, #2e003e 0%, #120078 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)",
  "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)"
];
let currentColor = 0;

document.getElementById('colorBtn').addEventListener('click', () => {
  currentColor = (currentColor + 1) % colors.length;
  document.body.style.background = colors[currentColor];
});
