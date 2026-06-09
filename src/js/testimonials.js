// Staggered Testimonials Slider Module

const testimonials = [
  {
    testimonial: "Very convenient. No need to buy pooja items separately every month.",
    by: "Priya Sharma, Bangalore, Karnataka",
    imgSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "The camphor quality is outstanding, and the Deepam Oil smells lovely. Highly recommended to all working professionals.",
    by: "Rajesh Nair, Chennai, Tamil Nadu",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "It arrived perfectly packed. The Shuddodaka holy water bottle is a beautiful addition. Keeps our daily rituals seamless.",
    by: "Lakshmi Iyer, Mumbai, Maharashtra",
    imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "The purity of the Bhimseni camphor is unmatched. Sourcing authentic daily pooja items is so easy now.",
    by: "Devendra Prasad, Varanasi, Uttar Pradesh",
    imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "As a senior citizen, going to the market every month is difficult. This kit is a blessing for my daily home temple prayers.",
    by: "Saraswati Ramachandran, Chennai, Tamil Nadu",
    imgSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "We work long hours and used to forget buying wicks or oil. Sacred Samskara keeps our home mandir fully equipped.",
    by: "Vikram Malhotra, New Delhi",
    imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "Excellent packaging and authentic fragrances. The agarbakthi and dhoop sticks create a divine atmosphere every evening.",
    by: "Anjali Joshi, Pune, Maharashtra",
    imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "The convenience of getting all pooja essentials in one box is unmatched. Saved me hours of traffic every month!",
    by: "Rajesh Patel, Ahmedabad, Gujarat",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    testimonial: "I love the custom kit builder option. I can choose exactly what I need and skip the rest. Very consumer friendly.",
    by: "Sunita Rao, Hyderabad, Telangana",
    imgSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  }
];

let testimonialsList = [...testimonials];
let cardSize = 365;

export function initTestimonials() {
  const viewport = document.getElementById('stagger-testimonials-viewport');
  const prevBtn = document.getElementById('stagger-prev-btn');
  const nextBtn = document.getElementById('stagger-next-btn');

  if (!viewport) return;

  // 1. Calculate responsive card size
  function updateCardSize() {
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    cardSize = isDesktop ? 365 : 290;
    renderCards();
  }

  // 2. Main Render function
  function renderCards() {
    viewport.innerHTML = '';
    const len = testimonialsList.length;
    const centerIndex = Math.floor(len / 2);

    testimonialsList.forEach((item, index) => {
      // Calculate relative position to the center element
      const position = index - centerIndex;
      const isCenter = position === 0;
      const absPos = Math.abs(position);

      // Only show elements within range for visual clarity & performance
      if (absPos > 2) {
        return;
      }

      // Create Card Container
      const cardEl = document.createElement('div');
      cardEl.className = `stagger-card ${isCenter ? 'center-active' : ''}`;
      
      // Calculate inline styles mirroring the React component properties
      const transX = (cardSize / 1.5) * position;
      const transY = isCenter ? -65 : (position % 2 !== 0 ? 15 : -15);
      const rotDeg = isCenter ? 0 : (position % 2 !== 0 ? 2.5 : -2.5);
      const zIndex = 10 - absPos;

      cardEl.style.width = `${cardSize}px`;
      cardEl.style.height = `${cardSize}px`;
      cardEl.style.zIndex = zIndex;
      cardEl.style.transform = `translate(-50%, -50%) translateX(${transX}px) translateY(${transY}px) rotate(${rotDeg}deg)`;

      if (isCenter) {
        cardEl.style.boxShadow = `0px 8px 0px 4px var(--gold-dim)`;
      } else {
        cardEl.style.boxShadow = `0px 0px 0px 0px transparent`;
      }

      // Extract Name and Location
      const parts = item.by.split(',');
      const name = parts[0].trim();
      const location = parts.slice(1).join(',').trim();

      // Diagonal cut line overlay
      const diagonalLine = document.createElement('span');
      diagonalLine.className = 'stagger-card-diagonal-line';
      diagonalLine.style.position = 'absolute';
      diagonalLine.style.display = 'block';
      diagonalLine.style.transformOrigin = 'top right';
      diagonalLine.style.transform = 'rotate(45deg)';
      diagonalLine.style.backgroundColor = 'var(--gold-dim)';
      diagonalLine.style.right = '-2px';
      diagonalLine.style.top = '48px';
      diagonalLine.style.width = '70.7px';
      diagonalLine.style.height = '2px';
      diagonalLine.style.opacity = '0.6';
      cardEl.appendChild(diagonalLine);

      // Star rating container
      const starWrapper = document.createElement('div');
      starWrapper.style.display = 'flex';
      starWrapper.style.justifyContent = 'center';
      starWrapper.style.alignItems = 'center';
      starWrapper.style.width = '100%';

      const starEl = document.createElement('div');
      starEl.style.color = 'var(--gold)';
      starEl.style.fontSize = '16px';
      starEl.style.letterSpacing = '2px';
      starEl.textContent = '★★★★★';
      starWrapper.appendChild(starEl);
      cardEl.appendChild(starWrapper);

      // Quote element
      const quoteEl = document.createElement('div');
      quoteEl.className = 'stagger-card-quote';
      quoteEl.textContent = `"${item.testimonial}"`;
      cardEl.appendChild(quoteEl);

      // Author details element
      const authorEl = document.createElement('div');
      authorEl.className = 'stagger-card-author';

      const strongEl = document.createElement('strong');
      strongEl.style.fontFamily = "'Cinzel', serif";
      strongEl.style.fontSize = '14px';
      strongEl.style.letterSpacing = '0.5px';
      strongEl.style.display = 'block';
      strongEl.style.marginBottom = '2px';
      strongEl.textContent = name;

      const spanEl = document.createElement('span');
      spanEl.style.fontSize = '11px';
      spanEl.style.opacity = '0.8';
      spanEl.style.textTransform = 'uppercase';
      spanEl.style.letterSpacing = '1px';
      spanEl.textContent = location;

      authorEl.appendChild(strongEl);
      authorEl.appendChild(spanEl);
      cardEl.appendChild(authorEl);

      // Bind Click handler to move clicked card to center
      cardEl.addEventListener('click', () => {
        if (!isCenter) {
          handleMove(position);
        }
      });

      viewport.appendChild(cardEl);
    });
  }

  // 3. Move logic (rotate array)
  function handleMove(steps) {
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = testimonialsList.shift();
        if (item) testimonialsList.push(item);
      }
    } else if (steps < 0) {
      for (let i = steps; i < 0; i++) {
        const item = testimonialsList.pop();
        if (item) testimonialsList.unshift(item);
      }
    }
    renderCards();
  }

  // 4. Bind Control buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => handleMove(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => handleMove(1));
  }

  // 5. Initialize resize and load events (Debounced to optimize reflow performance)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCardSize, 100);
  });
  updateCardSize();
}
