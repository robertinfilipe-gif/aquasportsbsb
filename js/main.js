/* =========================================================
   Aqua Sports · Landing page
   ========================================================= */

// ID do Pixel do Meta (Gerenciador de Eventos > Fontes de dados).
// Enquanto estiver 'SEU_PIXEL_AQUI', o Pixel não carrega e os eventos só aparecem no console.
const PIXEL_ID = 'SEU_PIXEL_AQUI';

// ID do projeto no Microsoft Clarity (clarity.microsoft.com > Settings > Overview > Project ID).
// Enquanto estiver 'SEU_CLARITY_AQUI', o Clarity não carrega.
const CLARITY_ID = 'SEU_CLARITY_AQUI';

// Aviso de cookies informativo: Pixel e Clarity carregam ao abrir a página.
// Quando a pessoa clica em "Entendi", isso fica guardado no localStorage com esta chave
// e a faixa não aparece mais naquele navegador.
const CHAVE_COOKIES = 'aqua_cookies';

// WhatsApp: número e mensagens em um único lugar.
// A chave é o valor de data-origem do botão; origens sem mensagem própria usam "padrao".
const WHATSAPP = {
  numero: '5561998639187',
  mensagens: {
    padrao: 'Olá! Vim pelo site e quero agendar minha aula experimental gratuita.',
    bebe: 'Olá! Vim pelo site e quero agendar a aula experimental gratuita de Natação Bebê.',
    infantil: 'Olá! Vim pelo site e quero agendar a aula experimental gratuita de Natação Infantil.',
    adulto: 'Olá! Vim pelo site e quero agendar a aula experimental gratuita de Natação Adulto.',
    aperfeicoamento: 'Olá! Vim pelo site e quero agendar a aula experimental gratuita de Aperfeiçoamento.'
  }
};

const UTM_CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/* ---------- Pixel do Meta e Clarity ---------- */
function carregarPixel() {
  if (!PIXEL_ID || PIXEL_ID === 'SEU_PIXEL_AQUI') {
    console.info('[Pixel] ID não preenchido: Pixel não carregado.');
    return;
  }
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

function carregarClarity() {
  if (!CLARITY_ID || CLARITY_ID === 'SEU_CLARITY_AQUI') {
    console.info('[Clarity] ID não preenchido: Clarity não carregado.');
    return;
  }
  /* eslint-disable */
  (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script',CLARITY_ID);
  /* eslint-enable */
}

carregarPixel();
carregarClarity();

// Envia um evento ao Pixel se ele estiver carregado (ID preenchido).
function rastrear(evento, dados) {
  if (typeof window.fbq === 'function') {
    window.fbq('track', evento, dados);
  } else {
    console.info('[Pixel não carregado]', evento, dados);
  }
}

/* ---------- UTMs ---------- */
// Lê as UTMs da URL e guarda na sessão, para não perder se a pessoa navegar pela página.
function lerUtms() {
  const params = new URLSearchParams(window.location.search);
  let utms = {};
  UTM_CHAVES.forEach(function (chave) {
    if (params.get(chave)) utms[chave] = params.get(chave);
  });
  try {
    if (Object.keys(utms).length) {
      sessionStorage.setItem('aqua_utms', JSON.stringify(utms));
    } else {
      utms = JSON.parse(sessionStorage.getItem('aqua_utms')) || {};
    }
  } catch (e) { /* sessionStorage bloqueado: segue só com a URL */ }
  return utms;
}
const UTMS = lerUtms();

/* ---------- Links do WhatsApp ---------- */
function linkWhatsApp(origem) {
  const texto = WHATSAPP.mensagens[origem] || WHATSAPP.mensagens.padrao;
  return 'https://wa.me/' + WHATSAPP.numero + '?text=' + encodeURIComponent(texto);
}

document.querySelectorAll('[data-origem]').forEach(function (botao) {
  botao.href = linkWhatsApp(botao.dataset.origem);
});

// Um único listener para todos os botões de WhatsApp.
document.addEventListener('click', function (evento) {
  const botao = evento.target.closest('[data-origem]');
  if (!botao) return;
  rastrear('Contact', Object.assign({ content_name: botao.dataset.origem }, UTMS));
});

/* ---------- Aviso de cookies (informativo) ---------- */
function avisoJaVisto() {
  try { return localStorage.getItem(CHAVE_COOKIES) === 'entendi'; } catch (e) { return false; }
}
function marcarAvisoVisto() {
  try { localStorage.setItem(CHAVE_COOKIES, 'entendi'); } catch (e) { /* localStorage bloqueado: a faixa volta a aparecer na próxima visita */ }
}

(function iniciarAvisoCookies() {
  if (avisoJaVisto()) return;
  // O link da política vem do <link rel="privacy-policy"> de cada página.
  const linkPolitica = document.querySelector('link[rel="privacy-policy"]');
  const urlPolitica = linkPolitica ? linkPolitica.getAttribute('href') : 'privacidade.html';

  const faixa = document.createElement('div');
  faixa.className = 'cookies';
  faixa.setAttribute('role', 'region');
  faixa.setAttribute('aria-label', 'Aviso de cookies');
  faixa.innerHTML =
    '<p class="cookies__texto">Usamos cookies para melhorar sua experiência e medir nossos anúncios.</p>' +
    '<div class="cookies__acoes">' +
      '<button type="button" class="btn btn--branco btn--sm" data-cookies-entendi>Entendi</button>' +
      '<a class="btn btn--contorno-claro btn--sm" href="' + urlPolitica + '">Ver política</a>' +
    '</div>';
  document.body.appendChild(faixa);

  faixa.querySelector('[data-cookies-entendi]').addEventListener('click', function () {
    marcarAvisoVisto();
    faixa.remove();
  });
})();

/* ---------- Menu hambúrguer ---------- */
(function iniciarMenu() {
  const botao = document.querySelector('.topo__toggle');
  const menu = document.getElementById('menu');
  if (!botao || !menu) return;

  function definir(aberto) {
    menu.classList.toggle('aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  botao.addEventListener('click', function () {
    definir(botao.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) definir(false);
  });
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menu.classList.contains('aberto')) {
      definir(false);
      botao.focus();
    }
  });
})();
