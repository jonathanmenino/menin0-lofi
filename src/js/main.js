// menin0 — small progressive enhancements. The page works without this file.
(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  // Mobile menu
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Header gets a border once the page scrolls
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    // Highlight the nav link of the section in view
    const links = [...document.querySelectorAll(".site-nav__link")];
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.toggle("is-active", l.hash === "#" + entry.target.id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((l) => {
      const target = document.querySelector(l.hash);
      if (target) spy.observe(target);
    });

    // Gentle reveal on scroll
    const revealables = document.querySelectorAll(
      ".section-head, .listen__grid, .panel, .about__inner, .support__inner"
    );
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            reveal.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealables.forEach((el) => {
      el.classList.add("reveal");
      reveal.observe(el);
    });
  }

  // Footer year
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Forms: inline validation. To actually deliver messages, set
  // data-endpoint="https://formspree.io/f/your-id" (or similar) on the <form>.
  document.querySelectorAll("[data-form]").forEach((form) => {
    const status = form.querySelector(".form__status");

    const showError = (field) => {
      const wrap = field.closest(".field");
      let msg = wrap.querySelector(".field__error");
      const invalid = !field.validity.valid;
      wrap.classList.toggle("is-invalid", invalid);
      field.setAttribute("aria-invalid", String(invalid));
      if (invalid) {
        if (!msg) {
          msg = document.createElement("span");
          msg.className = "field__error";
          msg.id = field.id + "-error";
          field.setAttribute("aria-describedby", msg.id);
          wrap.appendChild(msg);
        }
        msg.textContent = field.validity.valueMissing
          ? "This field is required."
          : "Please enter a valid e-mail.";
      } else if (msg) {
        msg.textContent = "";
      }
      return !invalid;
    };

    form.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.closest(".field").classList.contains("is-invalid")) showError(field);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll("input, textarea")];
      const ok = fields.map(showError).every(Boolean);
      status.className = "form__status";
      if (!ok) {
        fields.find((f) => !f.validity.valid).focus();
        return;
      }

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        status.classList.add("is-error");
        status.textContent = "This form isn't connected yet. Message me on Instagram @johnnymenin0 for now.";
        return;
      }

      const button = form.querySelector("button[type=submit]");
      button.disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.classList.add("is-success");
        status.textContent = "Thanks! Your message was sent.";
      } catch {
        status.classList.add("is-error");
        status.textContent = "Something went wrong. Please try again in a moment.";
      } finally {
        button.disabled = false;
      }
    });
  });
})();
