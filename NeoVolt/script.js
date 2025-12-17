document.addEventListener("DOMContentLoaded", () => {
  const imagens = document.querySelectorAll(".carrosel");
  const btnNext = document.querySelector(".next");
  const btnPrev = document.querySelector(".prev");

  let index = 0;

  function mostrarImagem(posicao) {
    imagens.forEach((img) => {
      img.style.display = "none";
    });
    imagens[posicao].style.display = "block";
  }

  // Inicializa o carrossel
  mostrarImagem(index);

  btnNext.addEventListener("click", () => {
    index++;
    if (index >= imagens.length) {
      index = 0;
    }
    mostrarImagem(index);
  });

  btnPrev.addEventListener("click", () => {
    index--;
    if (index < 0) {
      index = imagens.length - 1;
    }
    mostrarImagem(index);
  });
});
