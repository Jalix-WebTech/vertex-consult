/* ============================================================
   VERTEX CONSULT — PREMIUM ARCHITECTURE JAVASCRIPT
   Developer: Jalixon | https://jalixon.vercel.app/
   ============================================================ */

(() => {
  'use strict';

  /* ========== UTILITIES ========== */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /**
   * Sanitize string to prevent XSS when inserting into DOM.
   * Uses textContent then reads innerHTML — all HTML becomes inert text.
   */
  const sanitize = (str) => { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; };

  /**
   * Debounce for scroll/resize handlers to reduce repaints.
   */
  const debounce = (fn, d = 100) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; };

  // Secure all external links automatically
  $$('a[target="_blank"]').forEach(a => {
    if (!a.rel.includes('noopener')) a.setAttribute('rel', 'noopener noreferrer');
  });

  /* ========== TOAST SYSTEM (non-blocking, accessible) ========== */
  const toastContainer = $('#toastContainer');
  const toast = (msg, type = 'default', duration = 4000) => {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', default: 'fa-circle-info' };
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.default}"></i><div class="toast-text">${sanitize(msg)}</div>`;
    toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, duration);
  };

  /* ========== SPLASH SCREEN ========== */
  const splashBar = $('#splashBar');
  const splashPct = $('#splashPercent');
  let pct = 0;
  const pctTimer = setInterval(() => {
    pct = Math.min(pct + Math.random() * 9, 100);
    splashBar.style.width = pct + '%';
    splashPct.textContent = Math.floor(pct) + '%';
    if (pct >= 100) clearInterval(pctTimer);
  }, 180);

  window.addEventListener('load', () => {
    setTimeout(() => {
      pct = 100; splashBar.style.width = '100%'; splashPct.textContent = '100%';
      setTimeout(() => {
        $('#splash').classList.add('hidden');
        setTimeout(() => initCounters(), 400);
      }, 300);
    }, 2400);
  });

  /* ========== THEME (persisted) ========== */
  const themeToggle = $('#themeToggle');
  const themeIcon = $('#themeIcon');
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    themeIcon.className = t === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    try { localStorage.setItem('vc-theme', t); } catch (e) { /* ignore storage errors */ }
  };
  try { applyTheme(localStorage.getItem('vc-theme') || 'dark'); } catch (e) { applyTheme('dark'); }
  themeToggle.addEventListener('click', () =>
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
  );

  /* ========== NAVIGATION ========== */
  const navbar = $('#navbar'), navMenu = $('#navMenu'), menuToggle = $('#menuToggle'), backdrop = $('#navBackdrop');
  const closeMenu = () => {
    navMenu.classList.remove('open');
    backdrop.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  menuToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    backdrop.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open);
  });
  backdrop.addEventListener('click', closeMenu);
  $$('.nav-menu a').forEach(a => a.addEventListener('click', closeMenu));

  const onScroll = debounce(() => {
    // Sticky style
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    // Active section highlight
    let current = '';
    $$('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    $$('.nav-menu a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    // Back to top
    $('#backTop').classList.toggle('show', window.scrollY > 600);
    // Progress bar
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    $('#progressBar').style.width = (docH > 0 ? (window.scrollY / docH * 100) : 0) + '%';
  }, 20);
  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', onScroll);

  $('#backTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Hero parallax
  const heroBg = $('#heroBg');
  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY < window.innerHeight) heroBg.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }, 10));

  /* ========== CUSTOM CURSOR (desktop) ========== */
  const cDot = $('.cursor-dot'), cRing = $('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cDot.style.left = mx + 'px'; cDot.style.top = my + 'px';
  });
  const animCursor = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    cRing.style.left = rx + 'px'; cRing.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  };
  animCursor();
  document.querySelectorAll('a, button, input, select, textarea, .portfolio-item, .service-card, .value-card, .contact-card, .testimonial-nav, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cRing.classList.remove('hover'));
  });

  /* ========== ANIMATED COUNTERS ========== */
  const counters = $$('.stat-num');
  let countersStarted = false;
  function initCounters() {
    if (countersStarted) return; countersStarted = true;
    counters.forEach(el => {
      const tgt = parseInt(el.dataset.target, 10);
      let cur = 0; const step = Math.max(1, Math.ceil(tgt / 60));
      const tick = () => {
        cur += step;
        if (cur >= tgt) { el.textContent = tgt + '+'; return; }
        el.textContent = cur;
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  /* ========== SCROLL REVEAL ========== */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  const aboutSec = $('#about');
  if (aboutSec) {
    const ao = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { initCounters(); ao.disconnect(); } });
    }, { threshold: 0.3 });
    ao.observe(aboutSec);
  }

  /* ========== PORTFOLIO DATA + RENDERING ==========
     Images served from Pexels CDN — no local download required.
     To use your own images, replace any URL with 'assets/images/yourfile.jpg'
  ========================================================= */
  const PEX = 'https://images.pexels.com/photos/';
  const portfolioData = [
    { cat: 'residential', title: 'The Aurora Residence',      img: PEX + '8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'commercial',  title: 'Skyline Tower',             img: PEX + '33719016/pexels-photo-33719016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900' },
    { cat: 'interior',    title: 'Marble Atrium',             img: PEX + '14011664/pexels-photo-14011664.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'residential', title: 'Palm Grove Villa',          img: PEX + '2771935/pexels-photo-2771935.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'exterior',    title: 'Geometric Facade',          img: PEX + '18506889/pexels-photo-18506889.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900' },
    { cat: 'landscape',   title: 'Central Park Promenade',    img: PEX + '7546611/pexels-photo-7546611.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'urban',       title: 'Metro District Plan',       img: PEX + '12836765/pexels-photo-12836765.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'commercial',  title: 'Corporate Glass Tower',     img: PEX + '33719770/pexels-photo-33719770.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900' },
    { cat: 'interior',    title: 'Grand Foyer',               img: PEX + '8092431/pexels-photo-8092431.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900' },
    { cat: 'exterior',    title: 'Crystal Reflections',       img: PEX + '3709404/pexels-photo-3709404.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'landscape',   title: 'Hedge Symmetry',            img: PEX + '36713682/pexels-photo-36713682.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900' },
    { cat: 'residential', title: 'Urban Loft Interior',       img: PEX + '7722168/pexels-photo-7722168.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'interior',    title: 'Classic Wood Panel Study',  img: PEX + '8141957/pexels-photo-8141957.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'urban',       title: 'City Business Quarter',     img: PEX + '16473129/pexels-photo-16473129.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' },
    { cat: 'commercial',  title: 'Batumi Glass Apartments',   img: PEX + '14989324/pexels-photo-14989324.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900' },
    { cat: 'landscape',   title: 'Baku Green Promenade',      img: PEX + '37149144/pexels-photo-37149144.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200' }
  ];

  const grid = $('#portfolioGrid');
  let currentSet = portfolioData;
  const renderPortfolio = (filter = 'all') => {
    currentSet = filter === 'all' ? portfolioData : portfolioData.filter(p => p.cat === filter);
    grid.innerHTML = currentSet.map((p, i) => `
      <a class="portfolio-item" href="${sanitize(p.img)}" data-idx="${i}" data-cat="${sanitize(p.cat)}" data-title="${sanitize(p.title)}">
        <img src="${sanitize(p.img)}" alt="${sanitize(p.title)} - Vertex Consult architecture project" loading="lazy" />
        <div class="portfolio-overlay">
          <div><span class="portfolio-cat">${sanitize(p.cat)}</span><div class="portfolio-title">${sanitize(p.title)}</div></div>
          <span class="portfolio-view-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
        </div>
      </a>`).join('');
    $$('.portfolio-item', grid).forEach(el => el.addEventListener('click', (ev) => {
      ev.preventDefault(); openLightbox(parseInt(el.dataset.idx));
    }));
  };
  renderPortfolio();

  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPortfolio(btn.dataset.filter);
  }));

  /* ========== LIGHTBOX ========== */
  const lb = $('#lightbox'), lbImg = $('#lbImage'), lbCap = $('#lbCaption'), lbCnt = $('#lbCounter');
  let lbIdx = 0;
  function openLightbox(i) {
    lbIdx = ((i % currentSet.length) + currentSet.length) % currentSet.length;
    lbImg.src = currentSet[lbIdx].img;
    lbImg.alt = currentSet[lbIdx].title;
    lbCap.textContent = currentSet[lbIdx].title;
    lbCnt.textContent = `${lbIdx + 1} / ${currentSet.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', (e) => { e.stopPropagation(); openLightbox(lbIdx - 1); });
  $('#lbNext').addEventListener('click', (e) => { e.stopPropagation(); openLightbox(lbIdx + 1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lbIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(lbIdx + 1);
  });

  /* ========== TESTIMONIALS CAROUSEL ========== */
  const testimonials = [
    { name: 'Chief Okon E.', company: 'Property Developer', text: 'Vertex Consult transformed my vision into a masterpiece. Their attention to detail is simply unmatched in the industry — every corner, every material speaks of intent and excellence.', initials: 'OE' },
    { name: 'Dr. Mrs. Amara O.', company: 'Lagoon Hospitals', text: 'Working with Vertex was an extraordinary experience. They delivered our medical facility on time and exceeded every design expectation. World-class professionalism from start to finish.', initials: 'AO' },
    { name: 'Engr. Musa Ibrahim', company: 'Abuja Heights Ltd', text: 'The technical precision and creative brilliance of Vertex Consult set them apart. They are the gold standard of African architecture — a true partner in every sense.', initials: 'MI' },
    { name: 'Mrs. Funmilayo A.', company: 'Private Client', text: 'Our family home designed by Vertex is nothing short of a sanctuary. Every space tells a story of elegance, comfort, and soul. We feel privileged to live in their creation.', initials: 'FA' },
    { name: 'Hon. Commissioner', company: 'Ministry of Works', text: 'Vertex Consult delivered our civic project with the professionalism of a world-class firm. They are a credit to the Nigerian built industry and a benchmark for others.', initials: 'HC' }
  ];
  const track = $('#testimonialsTrack'), dotsC = $('#testimonialDots');
  let tIndex = 0;
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">"</div>
      <div class="testimonial-stars">${'★'.repeat(5)}</div>
      <p class="testimonial-text">${sanitize(t.text)}</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${sanitize(t.initials)}</div>
        <div><div class="testimonial-name">${sanitize(t.name)}</div><div class="testimonial-company">${sanitize(t.company)}</div></div>
      </div>
    </div>`).join('');
  dotsC.innerHTML = testimonials.map((_, i) => `<button data-i="${i}" aria-label="Go to testimonial ${i + 1}"></button>`).join('');
  const dots = $$('button', dotsC);
  const goT = (i) => {
    tIndex = ((i % testimonials.length) + testimonials.length) % testimonials.length;
    track.style.transform = `translateX(-${tIndex * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle('active', di === tIndex));
  };
  dots.forEach(d => d.addEventListener('click', () => goT(parseInt(d.dataset.i))));
  $('#tPrev').addEventListener('click', () => goT(tIndex - 1));
  $('#tNext').addEventListener('click', () => goT(tIndex + 1));
  goT(0);
  let autoT = setInterval(() => goT(tIndex + 1), 7000);
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoT));
  track.parentElement.addEventListener('mouseleave', () => { autoT = setInterval(() => goT(tIndex + 1), 7000); });

  /* ========== BOOKING FORM (WhatsApp redirect) ========== */
  const bookingForm = $('#bookingForm');
  const setFieldState = (field, isValid) => {
    field.classList.toggle('valid', isValid);
    field.classList.toggle('error', !isValid);
  };
  ['bName', 'bPhone', 'bEmail', 'bType'].forEach(id => {
    const f = $('#' + id);
    f.addEventListener('blur', () => {
      if (!f.value.trim()) { f.classList.remove('valid', 'error'); return; }
      if (id === 'bEmail') setFieldState(f, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      else setFieldState(f, f.value.trim().length >= 2);
    });
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#bName').value.trim();
    const phone = $('#bPhone').value.trim();
    const email = $('#bEmail').value.trim();
    const type = $('#bType').value;
    const budget = $('#bBudget').value;
    const date = $('#bDate').value;
    const msg = $('#bMsg').value.trim();

    if (!name || !phone || !email || !type) { toast('Please fill in all required fields marked with *', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Please enter a valid email address', 'error'); return; }
    if (phone.length < 7) { toast('Please enter a valid phone number', 'error'); return; }

    const text =
`*NEW CONSULTATION BOOKING — VERTEX CONSULT*

*Name:* ${name}
*Phone:* ${phone}
*Email:* ${email}
*Project Type:* ${type}
*Budget Range:* ${budget || 'Not specified'}
*Preferred Date:* ${date || 'Not specified'}

*Message:*
${msg || 'No additional details provided.'}

— Submitted via vertexconsult.com`;

    window.open(`https://wa.me/2349033165974?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    toast('Redirecting you to WhatsApp...', 'success');
    bookingForm.reset();
    $$('.valid, .error', bookingForm).forEach(el => el.classList.remove('valid', 'error'));
  });

  /* ========== AI CHATBOT ========== */
  const chatPanel = $('#chatbotPanel'), chatToggle = $('#chatbotToggle'), chatClose = $('#chatbotClose');
  const chatMessages = $('#chatMessages'), chatForm = $('#chatForm'), chatInput = $('#chatInput');

  let openedOnce = false;

  const KB = [
    { keys: ['service', 'offer', 'what do you do', 'expertise', 'help'], a: "Vertex Consult offers 8 premium services: Architectural Design, Building Consultancy, Construction Planning, Interior Design, Exterior Design, Landscape Design, Project Supervision, and Renovation Planning." },
    { keys: ['price', 'cost', 'budget', 'how much', 'pricing', 'negotiable', 'rate'], a: "Our pricing is negotiable and tailored to each project's scope, size, and aspiration. Book via our Booking form to receive a personalized quote within 24 hours." },
    { keys: ['location', 'address', 'where', 'located', 'office', 'direction'], a: "We are headquartered at Nung Ikono Ufok, Uruan L.G.A., Akwa Ibom State, Uyo, Nigeria. We serve clients nationwide and across West Africa." },
    { keys: ['book', 'consultation', 'appointment', 'schedule', 'how do i book'], a: "Scroll to the Booking section, fill in your project details, and tap Submit — your message opens directly in WhatsApp for instant confirmation from our team." },
    { keys: ['contact', 'phone', 'whatsapp', 'email', 'reach', 'call'], a: "Reach us on WhatsApp via the floating green button, email info@vertexconsult.com, or use our contact form. Hours: Mon–Fri 8AM–6PM, Sat 9AM–2PM (WAT)." },
    { keys: ['ceo', 'founder', 'leader', 'architect', 'principal'], a: "Our founder is a Fellow of the Nigerian Institute of Architects (FNIA) with 20+ years of landmark experience. See the CEO section for the full profile and leadership message." },
    { keys: ['portfolio', 'project', 'work', 'gallery', 'previous'], a: "Explore our Portfolio for 16+ featured projects — residential villas, commercial towers, interiors, landscapes, and urban planning — all filterable by category." },
    { keys: ['hour', 'time', 'when', 'open', 'close'], a: "We're open Mon–Fri 8:00 AM – 6:00 PM and Sat 9:00 AM – 2:00 PM (WAT). WhatsApp is monitored 24/7 for urgent inquiries." },
    { keys: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'], a: "Hello! Welcome to Vertex Consult. I'm your AI assistant — ask me about our services, pricing, booking, or location. How may I help you today?" },
    { keys: ['thank', 'thanks', 'thank you', 'appreciate'], a: "You're most welcome! Is there anything else I can help you with regarding your architectural project?" },
    { keys: ['who are you', 'your name', 'what are you'], a: "I'm Vertex AI — the virtual assistant for Vertex Consult. I answer questions about our services, pricing, booking, and location 24/7." }
  ];

  const getReply = (q) => {
    const qu = q.toLowerCase();
    for (const e of KB) if (e.keys.some(k => qu.includes(k))) return e.a;
    return "That's a great question! For detailed information, please reach out via WhatsApp or our Booking form so our senior consultants can assist you personally.";
  };

  const addMsg = (text, sender = 'bot') => {
    const d = document.createElement('div');
    d.className = 'msg msg-' + sender;
    d.textContent = text;
    chatMessages.appendChild(d);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };
  const showTyping = () => {
    const d = document.createElement('div');
    d.className = 'msg msg-bot'; d.id = 'typing';
    d.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
    chatMessages.appendChild(d); chatMessages.scrollTop = chatMessages.scrollHeight;
  };
  const removeTyping = () => { const t = $('#typing'); if (t) t.remove(); };
  const handleMsg = (text) => {
    if (!text.trim()) return;
    addMsg(text, 'user');
    showTyping();
    setTimeout(() => { removeTyping(); addMsg(getReply(text), 'bot'); }, 700 + Math.random() * 500);
  };

  // Welcome sequence
  setTimeout(() => {
    addMsg("Hello! I'm Vertex AI — your personal architecture assistant.", 'bot');
    setTimeout(() => addMsg("I can help with services, pricing, booking, and more. Try the quick options below!", 'bot'), 700);
  }, 600);

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = chatInput.value.trim(); chatInput.value = '';
    handleMsg(v);
  });
  $('#chatQuick').addEventListener('click', (e) => { if (e.target.matches('button')) handleMsg(e.target.dataset.q); });
  chatToggle.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    if (!openedOnce) { $('.notif-dot', chatToggle).style.display = 'none'; openedOnce = true; }
  });
  chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

  /* ========== MISC ========== */
  $('#yr').textContent = new Date().getFullYear();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); chatPanel.classList.remove('open'); closeLightbox(); }
  });

  console.log('%c VERTEX CONSULT ', 'background:#c9a96e;color:#000;font-size:14px;font-weight:bold;padding:6px 10px;');
  console.log('%c Developed by Jalixon — https://jalixon.vercel.app/ ', 'color:#c9a96e;font-size:11px;');
})();
