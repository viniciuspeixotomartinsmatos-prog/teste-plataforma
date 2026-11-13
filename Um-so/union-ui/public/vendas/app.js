const showcase = document.querySelector('.showcase');
const effects = Array.from(document.querySelectorAll('.demo-controls button'));
const status = document.querySelector('#demo-status');

effects.forEach((button, index) => {
  button.addEventListener('click', () => {
    showcase.dataset.effect = button.dataset.effect;
    effects.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    showcase.querySelector('.showcase-index').textContent = `0${index + 1} / 02`;
    status.textContent = index === 0 ? 'Brilho aplicado à borda do card.' : 'Contorno animado aplicado à borda do card.';
  });
});

const dialog = document.querySelector('#plan-dialog');
document.querySelectorAll('.plan-action').forEach(button => {
  button.addEventListener('click', () => {
    const { plan, price } = button.dataset;
    dialog.querySelector('#dialog-title').textContent = `Plano ${plan.toLowerCase()}`;
    dialog.querySelector('#dialog-price').textContent = price;
    dialog.querySelector('#dialog-contact').href = `mailto:acesso@nitidohig.com.br?subject=${encodeURIComponent(`Disponibilidade do plano ${plan} do nitido`)}`;
    dialog.showModal();
  });
});
