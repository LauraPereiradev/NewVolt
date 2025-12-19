document.addEventListener("DOMContentLoaded", () => {
  // (Carrossel removido) - código desnecessário eliminado

  // Envio para WhatsApp a partir do formulário de contato
  const form = document.getElementById('whatsapp-form');
  // Máscaras e validação: CPF e Telefone
  const cpfInput = document.getElementById('cpf');
  const telefoneInput = document.getElementById('telefone');

  function onlyDigits(value) {
    return value.replace(/\D/g, '');
  }

  function maskCPF(e) {
    let v = onlyDigits(e.target.value).slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    e.target.value = v;
  }

  function maskPhone(e) {
    let v = onlyDigits(e.target.value).slice(0, 11);
    if (v.length > 2 && v.length <= 6) {
      v = v.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    } else if (v.length > 6) {
      v = v.replace(/(\d{2})(\d{1,5})(\d{0,4})/, '($1) $2-$3');
    }
    e.target.value = v;
  }

  if (cpfInput) cpfInput.addEventListener('input', maskCPF);
  if (telefoneInput) telefoneInput.addEventListener('input', maskPhone);

  // Inline error helpers
  function clearAllErrors() {
    ['nome','cpf','email','telefone'].forEach(id => {
      const el = document.getElementById('err-' + id);
      if (el) el.textContent = '';
    });
  }

  function setFieldError(fieldId, message) {
    const el = document.getElementById('err-' + fieldId);
    if (el) el.textContent = message;
  }

  // Validação completa de CPF (algoritmo dos dígitos verificadores)
  function validateCPFdigits(cpf) {
    // cpf: apenas dígitos, length = 11
    if (!cpf || cpf.length !== 11) return false;
    // rejeita sequências repetidas
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calc = (t) => {
      let sum = 0;
      for (let i = 0; i < t; i++) sum += parseInt(cpf.charAt(i)) * (t + 1 - i);
      const d = (sum * 10) % 11;
      return d === 10 ? 0 : d;
    };

    const d1 = calc(9);
    const d2 = calc(10);
    return d1 === parseInt(cpf.charAt(9)) && d2 === parseInt(cpf.charAt(10));
  }
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('nome').value.trim();
      const cpf = document.getElementById('cpf').value.trim();
      const email = document.getElementById('email').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const mensagem = document.getElementById('mensagem').value.trim() || 'quero falar com atendente';

      const consentCheckbox = document.getElementById('consent');

      // Verifica consentimento LGPD
      if (!consentCheckbox || !consentCheckbox.checked) {
        alert('Por favor, leia e concorde com a Política de Privacidade (LGPD) antes de enviar.');
        // abre o modal LGPD automaticamente
        const modal = document.getElementById('lgpd-modal');
        if (modal) modal.setAttribute('aria-hidden', 'false');
        return;
      }

      // Limpa erros anteriores
      clearAllErrors();

      // Validações simples e melhoradas (com erros inline)
      if (!nome) { setFieldError('nome', 'Nome é obrigatório.'); }
      if (!cpf) { setFieldError('cpf', 'CPF é obrigatório.'); }
      if (!email) { setFieldError('email', 'E-mail é obrigatório.'); }
      if (!telefone) { setFieldError('telefone', 'Telefone é obrigatório.'); }
      if (!nome || !cpf || !email || !telefone) return;

      // Valida email simples
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) { setFieldError('email', 'Informe um e-mail válido.'); return; }

      // Valida CPF (11 dígitos e algoritmo)
      const cpfDigits = onlyDigits(cpf);
      if (cpfDigits.length !== 11 || !validateCPFdigits(cpfDigits)) { setFieldError('cpf', 'CPF inválido.'); return; }

      // Valida telefone (aceita 10 a 13 dígitos — com ou sem código do país)
      const phoneDigits = onlyDigits(telefone);
      if (!(phoneDigits.length >= 10 && phoneDigits.length <= 13)) { setFieldError('telefone', 'Telefone inválido. Inclua DDD (ex: 71) e número.'); return; }

      // Número da empresa para envio (com código do país BR = 55)
      const companyPhone = '55' + '71992172443'; // 71 + 992172443

      // Monta mensagem
      const text = `Nome: ${nome}\nCPF: ${cpf}\nEmail: ${email}\nTelefone: ${telefone}\nMensagem: ${mensagem}`;

      const encoded = encodeURIComponent(text);
      const waAppUrl = `whatsapp://send?phone=${companyPhone}&text=${encoded}`;
      const waWebUrl = `https://api.whatsapp.com/send?phone=${companyPhone}&text=${encoded}`;

      // Tenta abrir o app do WhatsApp (protocolo whatsapp://). Se não responder, abre fallback web.
      try {
        // Navega para o deep link — em mobile isso tende a abrir o app
        window.location.href = waAppUrl;

        // Se o app não abrir, após 600ms abrimos o WhatsApp web em nova aba (fallback)
        setTimeout(() => {
          window.open(waWebUrl, '_blank');
        }, 600);
      } catch (err) {
        // Se qualquer erro, abre o fallback web
        window.open(waWebUrl, '_blank');
      }
    });
  }

  // LGPD modal: abrir/fechar e aceitar
  const lgpdBtn = document.querySelector('.lgpd-btn');
  const lgpdModal = document.getElementById('lgpd-modal');
  const lgpdCloseButtons = document.querySelectorAll('.modal-close');
  const modalAccept = document.querySelector('.modal-accept');
  const consentCheckboxEl = document.getElementById('consent');

  if (lgpdBtn && lgpdModal) {
    lgpdBtn.addEventListener('click', () => {
      lgpdModal.setAttribute('aria-hidden', 'false');
    });
  }

  lgpdCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (lgpdModal) lgpdModal.setAttribute('aria-hidden', 'true');
    });
  });

  if (modalAccept) {
    modalAccept.addEventListener('click', () => {
      if (consentCheckboxEl) consentCheckboxEl.checked = true;
      if (lgpdModal) lgpdModal.setAttribute('aria-hidden', 'true');
    });
  }
});
