(() => {
  'use strict';
  const root = document.documentElement;
  const nav = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileQuery = window.matchMedia('(max-width: 600px)');

  function closeMenu(restoreFocus = false) {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    if (restoreFocus) menuButton.focus();
  }
  if (nav && menuButton) {
    root.classList.add('nav-enhanced');
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !isOpen);
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
    });
    mobileQuery.addEventListener('change', () => closeMenu());
  }

  const tabList = document.querySelector('.feature-tabs');
  const tabs = Array.from(document.querySelectorAll('.feature-tab'));
  function selectTab(index, focus = false) {
    tabs.forEach((tab, tabIndex) => {
      const selected = index === tabIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.dataset.panel).hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }
  if (tabList && tabs.length) {
    root.classList.add('tabs-enhanced');
    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      const panel = document.getElementById(tab.dataset.panel);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tab.addEventListener('click', () => selectTab(index));
      tab.addEventListener('keydown', event => {
        let target = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(target, true);
      });
    });
    const tabOrientation = window.matchMedia('(min-width: 601px) and (max-width: 800px)');
    const updateOrientation = () => tabList.setAttribute('aria-orientation', tabOrientation.matches ? 'horizontal' : 'vertical');
    tabOrientation.addEventListener('change', updateOrientation);
    updateOrientation();
    selectTab(0);
  }

  const track = document.querySelector('.gallery-track');
  const galleryControls = document.querySelector('.gallery-controls');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (track && galleryControls && galleryItems.length) {
    galleryControls.hidden = false;
    const previous = galleryControls.querySelector('[data-gallery-direction="-1"]');
    const next = galleryControls.querySelector('[data-gallery-direction="1"]');
    const updateGalleryControls = () => {
      previous.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    };
    galleryControls.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const distance = galleryItems[0].getBoundingClientRect().width + gap;
        track.scrollBy({left: distance * Number(button.dataset.galleryDirection), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
      });
    });
    track.addEventListener('scroll', updateGalleryControls, {passive: true});
    window.addEventListener('resize', updateGalleryControls, {passive: true});
    updateGalleryControls();
  }

  const lightbox = document.querySelector('.lightbox');
  let activeImage = 0;
  let lightboxOpener = null;
  if (lightbox && typeof lightbox.showModal === 'function') {
    const image = lightbox.querySelector('.lightbox-image');
    const title = lightbox.querySelector('#lightbox-title');
    const counter = lightbox.querySelector('.lightbox-counter');
    function displayImage(index) {
      activeImage = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[activeImage];
      image.src = item.getAttribute('href');
      image.alt = item.querySelector('img').alt;
      title.textContent = item.dataset.caption;
      counter.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
    }
    galleryItems.forEach((item, index) => {
      item.setAttribute('aria-haspopup', 'dialog');
      item.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        lightboxOpener = item;
        displayImage(index);
        lightbox.showModal();
        document.body.classList.add('modal-open');
      });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
    lightbox.querySelectorAll('[data-lightbox-direction]').forEach(button => {
      button.addEventListener('click', () => displayImage(activeImage + Number(button.dataset.lightboxDirection)));
    });
    lightbox.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        displayImage(activeImage + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    lightbox.addEventListener('click', event => {
      if (event.target !== lightbox) return;
      const bounds = lightbox.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
    });
    lightbox.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      lightboxOpener?.focus({preventScroll: true});
    });
  }
  const year = document.getElementById('copyright-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
