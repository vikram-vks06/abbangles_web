const C = window.CATALOG;
const $ = (s) => document.querySelector(s);
const page = document.body.dataset.page || 'home';
const params = new URLSearchParams(location.search);
const wa = '919879003308';
const YOUTUBE_VIDEO_ID = 'BCrZokqVrVw'; /* Replace with your public YouTube video ID */
const whatsapp = (msg) => `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
} [c]));

function nav() {
    const links = [
        ['Home', 'index.html'],
        ['About Us', 'about.html'],
        ['Products', 'products.html'],
        ['Catalogue', 'catalogue.html'],
        ['Gallery', 'gallery.html'],
        ['Blog', 'blog.html'],
        ['Contact', 'contact.html']
    ];
    const loginUrl = 'https://abedobiz.abbangles.com/login';
    return `<div class="bg-wine top-contactbar text-white text-xs py-2"><div class="max-w-7xl mx-auto px-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1"><span>Since 1977 &middot; Ahmedabad, India</span><div class="top-contact-list" aria-label="Call Arbuda Bangles"><span class="top-contact-label">Call us</span><a href="tel:+919265598961">+91 92655 98961</a><i aria-hidden="true"></i><a href="tel:+917863867139">+91 78638 67139</a></div></div></div><header class="bg-white/95 sticky top-0 z-40 border-b border-stone-100"><div class="max-w-7xl mx-auto px-5 h-20 flex justify-between items-center gap-5"><a href="index.html" class="shrink-0"><img src="assets/images/company/ablogo.png" class="brandLogo tracking-wide" alt="AB Bangles"/></a><nav class="hidden lg:flex items-center gap-6">${links.map(([n,u])=>`<a class="nav-link text-xs font-semibold uppercase tracking-wider ${location.pathname.endsWith(u)?'active':''}" href="${u}">${n}</a>`).join('')}</nav><div class="header-actions flex items-center gap-3"><a class="hidden md:inline-flex btn btn-primary !py-3" href="${whatsapp('Hello Arbuda Bangles, I would like to enquire about your products.')}" target="_blank" rel="noopener">Enquire Now &#8599;</a><a class="login-link" href="${loginUrl}" aria-label="Sign in to Arbuda Bangles"><span class="login-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5"/><path d="M4.8 20c.7-3.7 3.1-5.6 7.2-5.6s6.5 1.9 7.2 5.6"/></svg></span><span class="login-label">Sign in</span><span class="login-arrow" aria-hidden="true">&#8599;</span></a><button id="menuBtn" aria-label="Open menu" aria-expanded="false" class="lg:hidden text-2xl">&#9776;</button></div></div><nav id="mobileMenu" hidden class="lg:hidden px-5 pb-5 border-t">${links.map(([n,u])=>`<a class="block py-3 border-b text-sm" href="${u}">${n}</a>`).join('')}<a class="block py-3 border-b text-sm font-semibold" href="${loginUrl}">Sign in to Arbuda Bangles &#8599;</a></nav></header>`
}

function footer() {
    return `<footer class="bg-[#251b1d] text-white mt-20"><div class="max-w-7xl mx-auto px-5 py-16 grid md:grid-cols-4 gap-10"><div class="md:col-span-2"><h2 class="serif text-4xl">Arbuda Bangles</h2><p class="text-stone-300 mt-4 max-w-sm leading-7">Traditional elegance, timeless collections. Exporter, supplier and trader of bangles and kadas since 1977.</p></div><div><h3 class="uppercase text-xs tracking-widest text-[#d4b184] mb-5">Explore</h3><a class="block mb-3" href="products.html">Our Products</a><a class="block mb-3" href="about.html">About Us</a><a class="block mb-3" href="catalogue.html">Catalogue</a><a href="contact.html">Contact</a></div><div><h3 class="uppercase text-xs tracking-widest text-[#d4b184] mb-5">Get in touch</h3><p class="text-stone-300 text-sm leading-7">1442, Rangati Bazar, Near Suthar Wadas Pole, Astodia, Ahmedabad, Gujarat 380001</p><a class="block mt-3" href="tel:+919879003308">+91 98790 03308</a><a class="block mt-2 break-all" href="mailto:pratikpraj@gmail.com">pratikpraj@gmail.com</a></div></div><div class="border-t border-white/15 text-center text-xs text-stone-400 py-5">© ${new Date().getFullYear()} Arbuda Bangles. All rights reserved. · GST: 24ABRPP5239L1Z1</div></footer><a href="${whatsapp('Hello Arbuda Bangles, I would like to know more about your catalogue.')}" target="_blank" rel="noopener" aria-label="WhatsApp enquiry" class="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white rounded-full px-5 py-4 shadow-xl font-bold text-sm">WhatsApp ↗</a>`
}

function heading(k, t, d = '') {
    return `<section class="text-center max-w-3xl mx-auto mb-12"><p class="uppercase tracking-[.3em] text-xs gold font-bold mb-3">${k}</p><h2 class="serif text-4xl md:text-6xl text-[#531c2a]">${t}</h2>${d?`<p class="text-stone-500 mt-5 leading-7">${d}</p>`:''}</section>`
}

function banner(t, sub) {
    return `<section class="bg-[#f5ede4] py-16 md:py-20"><div class="max-w-7xl mx-auto px-5"><p class="text-xs uppercase tracking-[.3em] gold mb-3">Arbuda Bangles / ${esc(t)}</p><h1 class="serif text-5xl md:text-7xl text-[#531c2a]">${esc(t)}</h1><p class="text-stone-600 mt-4 max-w-2xl">${sub}</p></div></section>`
}

function productCard(p) {
    return `<article class="group bg-white border border-[#eee6df] overflow-hidden"><a href="product.html?id=${p.id}" class="block aspect-[4/5] overflow-hidden bg-stone-100"><img loading="lazy" class="card-img" src="${p.image}" alt="${esc(p.name)}" /></a><div class="p-5"><p class="text-[11px] uppercase tracking-widest gold">${esc(C.categories[p.categoryId-1].name)}</p><h3 class="serif text-2xl mt-2 mb-4 min-h-[3rem]">${esc(p.name)}</h3><div class="flex justify-between items-center gap-2"><a class="text-xs uppercase font-bold border-b border-[#531c2a] pb-1" href="product.html?id=${p.id}">View Details</a><a class="text-xs text-[#531c2a] font-bold" target="_blank" rel="noopener" href="${whatsapp('Hello, I want to enquire about '+p.name)}">Enquire ↗</a></div></div></article>`
}

function catCard(c) {
    return `<a href="products.html?category=${c.id}" class="group relative block aspect-[4/5] overflow-hidden bg-stone-200"><img loading="lazy" class="card-img" src="${c.image}" alt="${esc(c.name)}"><div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div><div class="absolute bottom-6 left-6 right-6 text-white"><h3 class="serif text-3xl">${esc(c.name)}</h3><span class="text-xs uppercase tracking-widest">Explore collection →</span></div></a>`
}

// Plain data structures keep these sections straightforward to move into React/Next.
const teamMembers = [
    { role: 'Founder', name: 'Mr. Anil Prajapati', image: 'assets/images/team/anilbprajapati-card.webp', note: 'The vision behind Arbuda' },
    { role: 'Managing Director', name: 'Mr. Pratik Prajapati', image: 'assets/images/team/pratikmd.png', note: 'Guiding the next chapter' },
    { role: 'Sales & Exports', name: 'Sales desk', image: 'assets/images/team/team3.jpeg', note: 'Here to help you source' },
    { role: 'Our Team', name: 'Arbuda Bangles', image: 'assets/images/team/team1.jpeg', note: 'A family built on craft' },
    { role: 'Arbuda Family', name: 'Team', image: 'assets/images/team/team2.jpeg', note: 'A family built on craft' }
];
const clientReviews = [
    { initials: '01', image: 'assets/images/client-avatars/anmol.png', name: 'Anmol', location: 'Business / location', quote: 'It was great doing business with pratik bhiya loved the way he greats the customer Impressed by the range and the prices they offer also loved the system and all the ease of billing and easy payment methods, No doubt the best place of buying bangles is ARBUDA BANGLES', rating: 5 },
    { initials: '02', image: 'assets/images/client-avatars/bhaveshdixit.png', name: 'bhaveshdixit', location: 'Business / location', quote: 'Best variety of bangles available here with very standard rate. A great business policy here.you can get goods of bangles at your doorstep by transport.', rating: 4.5 },
    { initials: '03', image: 'assets/images/client-avatars/nappu.png', name: 'Nappu', location: 'Business / location', quote: 'Use this space for a real customer story, with their permission and the correct attribution.', rating: 5 },
    { initials: '04', image: 'assets/images/client-avatars/mddanish.png', name: 'Client name', location: 'Business / location', quote: 'Shop owner is very frank to ask any think,price is too good, finishing of bangles is also good. All of you should buy from here, this is a good wholesale shop.', rating: 5 },
    { initials: '05', image: 'assets/images/client-avatars/harpritsingh.png', name: 'Harprit Sing', location: 'Business / location', quote: 'Very organised buisness system.very impressed with the way they deal with coustomer. Variety is good and rates are also comparative.', rating: 5 },
    { initials: '06', image: 'assets/images/client-avatars/sachetverma.png', name: 'Sachet Verma', location: 'Business / location', quote: ' Best expernce.   Super qualty Exellnt staff work 😄', rating: 5 }

   

    
];

function teamSection() {
    return `<section class="team-section" aria-labelledby="teamTitle"><div class="max-w-7xl mx-auto px-5 py-14 md:py-16"><div class="team-heading"><div><p class="section-kicker"><span class="team-kicker-dot"></span> PEOPLE BEHIND THE CRAFT</p><h2 id="teamTitle" class="display-heading">Meet the people<br><em>behind every detail.</em></h2></div></div><div class="team-stage" id="teamStage">${teamMembers.map((m,i)=>`<article class="team-card ${i===0?'is-focused':''}" data-team="${i}" tabindex="0" role="button" aria-pressed="${i===0}" aria-label="${m.role}: ${m.name}"><div class="team-photo-wrap"><img class="team-photo" src="${m.image}" alt="${m.name}, ${m.role} at Arbuda Bangles" loading="lazy"><span class="team-index">0${i+1}</span></div><div class="team-copy"><span class="team-role">${m.role}</span><h3>${m.name}</h3><p>${m.note}</p></div></article>`).join('')}</div><div class="team-footer"><div class="team-controls" aria-label="Team carousel controls"><button type="button" data-team-step="-1" aria-label="Previous team member">&#8592;</button><span><b id="teamCurrent">01</b><i>/ 05</i></span><button type="button" data-team-step="1" aria-label="Next team member">&#8594;</button></div><p class="team-footer-copy">A closer look at the<br><strong>people behind Arbuda</strong></p></div></div></section>`;
}

function globalSection() {
    const points = [
        ['USA','22.8%','28.9%'], ['UK','49.2%','19.4%'], ['UAE','65%','36.7%'],
        ['INDIA','71.7%','37.8%'], ['SOUTH AFRICA','56.9%','66.1%'], ['AUSTRALIA','87.2%','63.9%']
    ];
    return `<section class="global-section" aria-labelledby="globalTitle"><div class="global-pattern" aria-hidden="true"></div><div class="global-layout max-w-7xl mx-auto px-5 py-20 md:py-28"><div class="global-copy"><p class="section-kicker global-kicker"><span class="global-kicker-dot"></span> FROM AHMEDABAD TO EVERYWHERE</p><h2 id="globalTitle" class="display-heading">Rooted at home.<br><em>Connected worldwide.</em></h2><p class="global-description">For generations, Arbuda Bangles has carried colour, craft and thoughtful service from Ahmedabad to partners around the world.</p><div class="global-origin"><span class="global-origin-mark">A</span><span><b>Ahmedabad, India</b><small>Our home since 1977</small></span></div><div class="global-market-note"><span></span> A world of colour, shared</div></div><div class="global-showcase"><div class="world-orbit"></div><div class="world-visual" id="worldVisual" aria-label="World map with highlighted international markets"><img class="world-map" src="assets/images/world-map.svg" alt="Simplified world map with connections from India to the United States, United Kingdom, United Arab Emirates, South Africa and Australia" loading="lazy">${points.map(([name,x,y],i)=>`<div class="map-point map-point-${i+1}" style="--x:${x};--y:${y};--delay:${i*.3}s"><span class="map-pulse"></span><span class="map-label">${name}</span></div>`).join('')}<div class="map-origin" aria-label="Arbuda Bangles origin: Ahmedabad, India"><span>AB</span></div><div class="map-caption">AHMEDABAD <i>?</i> WORLDWIDE</div></div><div class="global-floating-tag"><span>?</span> Craft in every connection</div></div></div></section>`;
}
function reviewsSection() {
        return `<section class="reviews-section" aria-labelledby="reviewsTitle"><div class="max-w-7xl mx-auto px-5 py-20 md:py-28"><div class="reviews-intro"><p class="section-kicker">RELATIONSHIPS THAT LAST</p><h2 id="reviewsTitle" class="display-heading">Good work travels<br><em>by word of mouth.</em></h2><p>Real experiences from the people we work with.</p></div><div class="review-orbit" id="reviewOrbit"><div class="orbit-ring"></div><div class="review-bubbles">${clientReviews.map((r,i)=>`<button type="button" class="review-bubble review-bubble-${i+1} ${i===0?'is-current':''}" data-review="${i}" aria-label="Show review ${i+1}: ${r.name}"><img src="${r.image}" alt="" loading="lazy"></button>`).join('')}</div><article class="review-card" aria-live="polite"><div class="review-stars" id="reviewStars" aria-label="5 out of 5 stars">★★★★★</div><blockquote id="reviewQuote"></blockquote><div class="review-person"><img class="review-main-avatar" id="reviewInitials" src="assets/images/client-avatars/client-01.svg" alt="" loading="lazy"><div><strong id="reviewName"></strong><small id="reviewLocation"></small></div></div><div class="review-progress"><span id="reviewProgress"></span></div></article><button class="review-arrow review-prev" type="button" data-review-step="-1" aria-label="Previous review">←</button><button class="review-arrow review-next" type="button" data-review-step="1" aria-label="Next review">→</button></div><p class="review-edit-note">Review are picked from google Reviews, client names, photos and approved feedback.</p></div></section>`;
}

function home() {
    const slides = [{
    eyebrow: 'Welcome · स्वागत है · સ્વાગત છે · স্বাগতম · स्वागत बा · வரவேற்கிறோம் · స్వాగతం',
    title: 'Arbuda Bangles \n Amhedabad',
    copy: 'Dealing in plastic, acrylic, metal, chuda and more — crafting colour and celebration for every occasion since 1977.',
    image: 'assets/images/slider/slider1.png',
    tag: 'SINCE 1977',
    link: 'products.html?category=14'
},{
        eyebrow: 'A celebration of colour',
        title: 'Every colour.\nEvery celebration.',
        copy: 'Explore vibrant plastic and acrylic bangles for everyday style and unforgettable occasions.',
        image: 'assets/images/slider/slider5.png',
        tag: 'PLASTIC & ACRYLIC',
        link: 'products.html?category=14'
    }, {
        eyebrow: 'Tradition in every detail',
        title: 'The beauty of\nbrass & metal.',
        copy: 'Beautifully detailed brass kadas, metal bangles and statement designs for your collection.',
        image: 'assets/images/slider/slider2.avif',
        tag: 'BRASS & METAL',
        link: 'products.html?category=3'
    }, {
        eyebrow: 'Made for special moments',
        title: 'A little tradition.\nA lot of love.',
        copy: 'Discover festive chuda sets and classic bangles that bring every celebration to life.',
        image: 'assets/images/slider/slider3.webp',
        tag: 'CHUDA COLLECTION',
        link: 'products.html?category=5'
    }, {
        eyebrow: 'Your wholesale bangle destination',
        title: 'Discover more.\nStock better.',
        copy: 'Browse an extensive range of colours, styles and finishes. Connect directly for wholesale enquiries.',
        image: 'assets/images/slider/slider4.webp',
        tag: 'WHOLESALE COLLECTION',
        link: 'products.html'
    }];
    return `<section class="hero-slider" aria-label="Featured bangle collections"><div class="hero-pattern"></div>${slides.map((x,i)=>`<article class="hero-slide ${i===0?'is-active':''}" data-slide="${i}" aria-hidden="${i!==0}"><div class="hero-wrap"><div class="hero-copy"><p class="hero-eyebrow"><span class="mini-line"></span>${x.eyebrow}</p><h1>${x.title.replace('\n','<br>')}</h1><p class="hero-description">${x.copy}</p><div class="hero-actions"><a href="${x.link}" class="btn btn-primary">Explore Collection <span>↗</span></a><a href="catalogue.html" class="hero-secondary">View catalogue <span>→</span></a></div><div class="hero-foot"><span class="hero-index">0${i+1} <em>/ 04</em></span><span class="hero-rule"></span><span>${x.tag}</span></div></div><div class="hero-visual"><div class="hero-orbit"></div><img src="${x.image}" alt="${x.tag} bangles" ${i===0?'fetchpriority="high"':'loading="lazy"'}><div class="hero-float"><span class="spark">✦</span><span>Colours that<br><strong>tell a story.</strong></span></div></div></div></article>`).join('')}<div class="hero-controls"><button type="button" id="slidePrev" aria-label="Previous slide">←</button><button type="button" id="slideNext" aria-label="Next slide">→</button></div><div class="hero-dots">${slides.map((_,i)=>`<button type="button" class="hero-dot ${i===0?'active':''}" data-go="${i}" aria-label="Go to slide ${i+1}" aria-current="${i===0}"></button>`).join('')}</div><div class="hero-progress"><span id="slideProgress"></span></div></section><div class="trust-strip"><div>✦ <strong>Wide product range</strong><span>Styles for every occasion</span></div><div>✦ <strong>Wholesale enquiries</strong><span>Talk to our team directly</span></div><div>✦ <strong>Colourful collections</strong><span>Plastic · Acrylic · Brass · Chuda</span></div></div><section class="max-w-7xl mx-auto px-5 py-20 md:py-28">${heading('Find your favourite','Explore by collection','From vibrant everyday bangles to statement bridal chuda, discover a world of colour and craftsmanship.')}<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">${[13,7,2,4,0,5,1,3].map(i=>catCard(C.categories[i])).join('')}</div><div class="text-center mt-10"><a class="btn btn-outline" href="products.html">Explore all collections →</a></div></section><section class="story-section"><div class="max-w-7xl mx-auto px-5 py-20 md:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"><div class="story-photo"><img loading="lazy" src="assets/images/company/headoffice.png" alt="Colourful traditional bangle collection"><div class="story-stamp">A WORLD<br>OF COLOUR <span>✳</span></div></div><div><p class="section-kicker">THE ARBUDA STORY</p><h2 class="display-heading">Rooted in tradition.<br><em>Inspired by colour.</em></h2><p class="mt-7 leading-8 text-stone-600">At Arbuda Bangles, we bring together classic Indian bangle traditions and contemporary style. Explore plastic, acrylic, metal, brass, glass and chuda collections for retailers, wholesalers and jewellery lovers.</p><div class="story-stats"><div><strong>6+</strong><span>Core bangle styles</span></div><div><strong>100%</strong><span>Colour & celebration</span></div><div><strong>India</strong><span>Inspired collections</span></div></div><a class="btn btn-primary mt-8" href="about.html">Discover our story ↗</a></div></div></section><section class="max-w-7xl mx-auto px-5 py-20 md:py-28">${heading('Handpicked for you','Featured designs','Explore popular styles and request a quote for your favourite pieces.')}<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">${[25,19,10,16,17,20,6,13].map(i=>productCard(C.products[i])).join('')}</div></section><section class="video-section"><div class="max-w-7xl mx-auto px-5 py-20 md:py-28 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center"><div><p class="section-kicker">STEP INSIDE OUR WORLD</p><h2 class="display-heading">See the beauty<br><em>in motion.</em></h2><p class="mt-6 text-stone-600 leading-8">Discover the colours, collections and craftsmanship behind Arbuda Bangles. Watch our featured video, presented right on our digital showcase.</p><div class="mt-8 flex flex-wrap gap-3"><a class="btn btn-primary" href="gallery.html">Explore gallery ↗</a><a class="btn btn-outline" href="contact.html">Get in touch</a></div><p class="video-note">Set your YouTube video ID in <code>assets/js/app.js</code> to enable playback.</p></div><div class="laptop-scene"><div class="laptop-lid"><div class="laptop-screen"><div id="videoScreen" class="video-poster"><img src="assets/images/bangles-08.svg" alt="Bangles video preview"><div class="video-screen-overlay"></div><button id="videoPlay" type="button" class="video-play" aria-label="Play Arbuda Bangles video">▶</button><span class="video-caption">DISCOVER ARBUDA BANGLES</span></div></div></div><div class="laptop-base"><div class="laptop-notch"></div></div><div class="laptop-shadow"></div></div></div></section><section class="max-w-7xl mx-auto px-5 py-20">${heading('More to discover','Our colourful world')}<div class="gallery-preview">${[1,8,4,13].map(i=>`<a href="gallery.html"><img loading="lazy" src="${C.categories[i].image}" alt="${esc(C.categories[i].name)}"><span>${esc(C.categories[i].name)} ↗</span></a>`).join('')}</div></section>${teamSection()}${globalSection()}${reviewsSection()}${cta()}`
}

function cta() {
    return `<section class="bg-wine text-white py-20 text-center px-5"><p class="text-xs tracking-[.3em] uppercase text-[#dfc49e]">Wholesale & trade enquiries</p><h2 class="serif text-5xl md:text-6xl mt-4">Find your perfect collection.</h2><p class="mt-5 text-white/80">Get in touch for product availability, bulk orders and quotations.</p><a href="${whatsapp('Hello Arbuda Bangles, please share your latest product catalogue and wholesale details.')}" target="_blank" rel="noopener" class="btn bg-white text-[#531c2a] mt-8">Enquire on WhatsApp ↗</a></section>`
}

function products() {
    return banner('Our Products', 'Explore our jewellery range and enquire directly for availability and wholesale quotations.') + `<section class="max-w-7xl mx-auto px-5 py-14"><div class="flex flex-col md:flex-row gap-4 mb-9"><input id="search" class="input md:flex-1" placeholder="Search products by name..." aria-label="Search products"><select id="category" class="input md:w-80" aria-label="Filter by category"><option value="">All Categories</option>${C.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div><p id="count" class="text-sm text-stone-500 mb-6"></p><div id="productGrid" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"></div><p id="empty" hidden class="py-16 text-center text-stone-500">No matching products found.</p></section>`
}

function detail() {
    let p = C.products.find(x => x.id === Number(params.get('id')));
    if (!p) return banner('Product Not Found', 'Please browse our product catalogue.') + '<div class="text-center py-16"><a class="btn btn-primary" href="products.html">Browse products</a></div>';
    return banner(p.name, 'Explore product details and request a quotation.') + `<section class="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-12"><div class="bg-[#f5ede4] aspect-square"><img src="${p.image}" class="w-full h-full object-cover" alt="${esc(p.name)}"></div><div><p class="gold uppercase tracking-widest text-xs">${esc(C.categories[p.categoryId-1].name)}</p><h2 class="serif text-5xl text-[#531c2a] mt-4">${esc(p.name)}</h2><p class="leading-8 text-stone-600 mt-6">${esc(p.description)}</p><div class="border-y my-8 py-6 space-y-3 text-sm"><p><b>Product:</b> ${esc(p.name)}</p><p><b>Category:</b> ${esc(C.categories[p.categoryId-1].name)}</p><p><b>Availability & pricing:</b> On enquiry</p></div><a class="btn btn-primary" target="_blank" rel="noopener" href="${whatsapp('Hello Arbuda Bangles, I would like a quotation for '+p.name+' (Product ID: '+p.id+').')}">Request Quotation ↗</a><a href="products.html?category=${p.categoryId}" class="block mt-6 text-sm underline">← Back to collection</a></div></section>`
}

function about() {
    return banner('Our Story', 'A legacy of jewellery and trust since 1977.') + `<section class="max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-14 items-center"><img class="w-full aspect-[4/5] object-cover" src="assets/images/slider/slider1.webp" alt="Bangles and jewellery"><div><p class="gold text-xs uppercase tracking-widest">Welcome to Arbuda Bangles</p><h2 class="serif text-5xl text-[#531c2a] mt-4">Inspired by tradition. Built on trust.</h2><p class="mt-6 leading-8 text-stone-600">Established in 1977, Arbuda Bangles is based in Ahmedabad, Gujarat. We are engaged in the export, supply and trade of glass bangles, glass kadas, brass kadas, brass bracelets and glass chura sets, alongside a diverse range of jewellery products.</p><p class="mt-5 leading-8 text-stone-600">Our collections serve customers looking for traditional designs and contemporary styles. We value quality, lasting relationships and reliable service.</p><div class="grid grid-cols-2 gap-6 mt-9 border-t pt-8"><div><b class="serif text-4xl text-[#531c2a]">1977</b><p class="text-sm text-stone-500">Established</p></div><div><b class="serif text-4xl text-[#531c2a]">Worldwide</b><p class="text-sm text-stone-500">Markets served</p></div><div><b class="text-lg">Mr. Pratik</b><p class="text-sm text-stone-500">Founder</p></div><div><b class="text-lg">Ahmedabad</b><p class="text-sm text-stone-500">Headquarters</p></div></div></div></section>${cta()}`
}

function catalogue() {
    return banner('Digital Catalogue', 'Browse our collections by category. Contact us for the latest product sheets and availability.') + `<section class="max-w-7xl mx-auto px-5 py-16"><div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">${C.categories.map(catCard).join('')}</div><div class="bg-[#f5ede4] mt-14 p-10 text-center"><h2 class="serif text-4xl text-[#531c2a]">Need the latest catalogue?</h2><p class="mt-3 text-stone-600">Request updated product images, specifications and wholesale information.</p><a class="btn btn-primary mt-6" target="_blank" rel="noopener" href="${whatsapp('Hello Arbuda Bangles, please send me your latest digital catalogue.')}">Request Catalogue ↗</a></div></section>`
}

function gallery() {
    return banner('Gallery', 'A glimpse into our collections.') + `<section class="max-w-7xl mx-auto px-5 py-16 grid grid-cols-2 md:grid-cols-3 gap-4">${C.products.slice(0,18).map(p=>`<a class="group overflow-hidden aspect-square" href="product.html?id=${p.id}" title="${esc(p.name)}"><img loading="lazy" class="card-img" src="${p.image}" alt="${esc(p.name)}"></a>`).join('')}</section>`
}

function blog() {
    const posts = [
        ['Fancy Bangles Exporters: Taking Indian Craft Global', 'Indian bangles connect timeless craftsmanship with customers around the world. Discover styles, materials and sourcing considerations.'],
        ['Glass Bangles Suppliers in India: Trends and Tradition', 'Glass bangles remain a vibrant part of Indian jewellery culture, from festive colours to contemporary patterns.']
    ];
    return banner('Journal', 'Stories, inspiration and insights from the world of bangles.') + `<section class="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-8">${posts.map((a,i)=>`<article class="border bg-white"><img src="${C.categories[i].image}" alt="${esc(a[0])}" class="w-full aspect-[5/3] object-cover"><div class="p-8"><p class="gold text-xs uppercase tracking-widest">Journal</p><h2 class="serif text-3xl mt-3">${esc(a[0])}</h2><p class="text-stone-600 leading-7 mt-4">${esc(a[1])}</p><a class="text-sm underline mt-5 inline-block" href="contact.html">Ask us more →</a></div></article>`).join('')}</section>`
}

function contact() {
    return banner('Contact Us', 'We would love to hear from you. Send us an enquiry about our collections.') + `<section class="max-w-7xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-14"><div><h2 class="serif text-4xl text-[#531c2a] mb-6">Get in touch</h2><div class="space-y-6 leading-7"><div><p class="gold uppercase text-xs tracking-widest font-bold">Address</p><p>1442, Rangati Bazar, Near Suthar Wadas Pole, Astodia, Ahmedabad, Gujarat 380001, India</p></div><div><p class="gold uppercase text-xs tracking-widest font-bold">Sales Department</p><a href="tel:+919265598961">&#128222; +91 9265598961</a> , <a href="tel:+917863867139">&#128222; +91 7863867139</a></div><div><p class="gold uppercase text-xs tracking-widest font-bold">Purchase Department</p><a href="tel:+919574771721">&#128222; +91 9574771721</a> , <a href="tel:+919265256659">&#128222; +91 9265256659</a></div><div><p class="gold uppercase text-xs tracking-widest font-bold">Transport Department</p><a href="tel:+919265347683">&#128222;  +91 9265347683</a></div><div><p class="gold uppercase text-xs tracking-widest font-bold">Email</p><a href="mailto:pratikpraj@gmail.com">pratikpraj@gmail.com</a> , <a href="mailto:info@abbangles.com">info@abbangles.com</a></div><div><p class="gold uppercase text-xs tracking-widest font-bold">GST</p><p>24ABRPP5239L1Z1</p></div><div class=""><p class="gold uppercase text-xs tracking-widest font-bold">Administration </p><a href="tel:+919879003308">&#128222; +91 9879003308</a> , <a href="tel:+919327090609">&#128222; +91 9327090609</a></div></div><a class="btn btn-outline mt-9" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=Arbuda+Bangles+Astodia+Ahmedabad">View on Maps ↗</a></div><form id="enquiry" class="bg-[#f5ede4] p-6 md:p-10 space-y-4"><h2 class="serif text-4xl text-[#531c2a] mb-5">Send an Enquiry</h2><label class="block text-sm">Your name *<input class="input mt-2" name="name" required maxlength="100"></label><label class="block text-sm">Phone number *<input class="input mt-2" name="phone" required type="tel" pattern="[0-9+() -]{8,20}"></label><label class="block text-sm">Email<input class="input mt-2" name="email" type="email"></label><label class="block text-sm">Interested in<select class="input mt-2" name="category"><option value="General enquiry">General enquiry</option>${C.categories.map(c=>`<option>${esc(c.name)}</option>`).join('')}</select></label><label class="block text-sm">Your message *<textarea class="input mt-2" rows="4" name="message" required maxlength="1500"></textarea></label><button type="submit" class="btn btn-primary w-full">Send via WhatsApp ↗</button><p class="text-xs text-stone-500">Submitting opens WhatsApp with your enquiry. No information is stored by this website.</p></form></section>`
}
const pages = {
    home,
    products,
    product: detail,
    about,
    catalogue,
    gallery,
    blog,
    contact
};
$('#app').innerHTML = nav() + (pages[page] || home)() + footer();
$('#menuBtn').addEventListener('click', () => {
    const el = $('#mobileMenu');
    el.hidden = !el.hidden;
    $('#menuBtn').setAttribute('aria-expanded', String(!el.hidden))
});
if (page === 'products') {
    const sel = $('#category'),
        search = $('#search');
    sel.value = params.get('category') || '';

    function render() {
        const q = search.value.trim().toLowerCase(),
            cat = sel.value;
        const arr = C.products.filter(p => (!cat || String(p.categoryId) === cat) && p.name.toLowerCase().includes(q));
        $('#productGrid').innerHTML = arr.map(productCard).join('');
        $('#count').textContent = `Showing ${arr.length} products`;
        $('#empty').hidden = arr.length !== 0;
    }
    search.addEventListener('input', render);
    sel.addEventListener('change', render);
    render()
}
if (page === 'contact') $('#enquiry').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msg = `Hello Arbuda Bangles,%0A` + `Name: ${f.get('name')}\nPhone: ${f.get('phone')}\nEmail: ${f.get('email')}\nCategory: ${f.get('category')}\nMessage: ${f.get('message')}`;
    window.open(whatsapp(msg), '_blank', 'noopener,noreferrer')
});
(function() {
    if (page !== 'home') return;
    const teamCards = [...document.querySelectorAll('.team-card')];
    const teamCurrent = document.querySelector('#teamCurrent');
    let teamActive = 0, teamTimer;
    const focusTeam = (index) => {
        teamActive = (index + teamCards.length) % teamCards.length;
        teamCards.forEach((card, i) => {
            const focused = i === teamActive;
            card.classList.toggle('is-focused', focused);
            card.setAttribute('aria-pressed', String(focused));
        });
        if (teamCurrent) teamCurrent.textContent = String(teamActive + 1).padStart(2, '0');
    };
    const stopTeam = () => clearInterval(teamTimer);
    const startTeam = () => {
        stopTeam();
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) teamTimer = setInterval(() => focusTeam(teamActive + 1), 4200);
    };
    teamCards.forEach((card, i) => {
        card.addEventListener('click', () => { focusTeam(i); startTeam(); });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); focusTeam(i); startTeam(); }
        });
    });
    document.querySelectorAll('[data-team-step]').forEach((button) => button.addEventListener('click', () => {
        focusTeam(teamActive + Number(button.dataset.teamStep)); startTeam();
    }));
    document.querySelector('#teamStage')?.addEventListener('mouseenter', stopTeam);
    document.querySelector('#teamStage')?.addEventListener('mouseleave', startTeam);
    document.querySelector('#teamStage')?.addEventListener('focusin', stopTeam);
    document.querySelector('#teamStage')?.addEventListener('focusout', startTeam);
    startTeam();

    let reviewActive = 0, reviewTimer;
    const reviewCards = [...document.querySelectorAll('.review-bubble')];
    const reviewProgress = document.querySelector('#reviewProgress');
    const paintReview = (index) => {
        reviewActive = (index + clientReviews.length) % clientReviews.length;
        const review = clientReviews[reviewActive];
        document.querySelector('#reviewQuote').textContent = `“${review.quote}”`;
        document.querySelector('#reviewName').textContent = review.name;
        document.querySelector('#reviewLocation').textContent = review.location;
        document.querySelector('#reviewInitials').src = review.image;
        document.querySelector('#reviewStars').textContent = review.rating ? '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating) : '☆☆☆☆☆';
        document.querySelector('#reviewStars').setAttribute('aria-label', review.rating ? `${review.rating} out of 5 stars` : 'Rating to be added');
        reviewCards.forEach((button, i) => button.classList.toggle('is-current', i === reviewActive));
        const card = document.querySelector('.review-card');
        card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
        if (reviewProgress) {
            reviewProgress.style.animation = 'none'; void reviewProgress.offsetWidth;
            reviewProgress.style.animation = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'reviewTimer 4.8s linear forwards';
        }
    };
    const stopReviews = () => clearInterval(reviewTimer);
    const startReviews = () => { stopReviews(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) reviewTimer = setInterval(() => paintReview(reviewActive + 1), 4800); };
    reviewCards.forEach((button, i) => button.addEventListener('click', () => { paintReview(i); startReviews(); }));
    document.querySelectorAll('[data-review-step]').forEach((button) => button.addEventListener('click', () => {
        paintReview(reviewActive + Number(button.dataset.reviewStep)); startReviews();
    }));
    document.querySelector('#reviewOrbit')?.addEventListener('mouseenter', stopReviews);
    document.querySelector('#reviewOrbit')?.addEventListener('mouseleave', startReviews);
    paintReview(0); startReviews();

    const worldVisual = document.querySelector('#worldVisual');
    worldVisual?.addEventListener('pointermove', (event) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const box = worldVisual.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width - .5) * -9;
        const y = ((event.clientY - box.top) / box.height - .5) * -7;
        worldVisual.style.setProperty('--map-x', `${x}px`);
        worldVisual.style.setProperty('--map-y', `${y}px`);
    });
    worldVisual?.addEventListener('pointerleave', () => {
        worldVisual.style.setProperty('--map-x', '0px'); worldVisual.style.setProperty('--map-y', '0px');
    });

    let active = 0,
        timer;
    const slides = [...document.querySelectorAll('.hero-slide')],
        dots = [...document.querySelectorAll('.hero-dot')];

    function go(n) {
        active = (n + slides.length) % slides.length;
        slides.forEach((s, i) => {
            s.classList.toggle('is-active', i === active);
            s.setAttribute('aria-hidden', String(i !== active))
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === active);
            d.setAttribute('aria-current', String(i === active))
        });
        const p = document.querySelector('#slideProgress');
        if (p) {
            p.style.animation = 'none';
            void p.offsetWidth;
            p.style.animation = 'slideTimer 6s linear forwards'
        }
    }

    function auto() {
        clearInterval(timer);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(active + 1), 6000)
    }
    document.querySelector('#slidePrev')?.addEventListener('click', () => {
        go(active - 1);
        auto()
    });
    document.querySelector('#slideNext')?.addEventListener('click', () => {
        go(active + 1);
        auto()
    });
    dots.forEach((d, i) => d.addEventListener('click', () => {
        go(i);
        auto()
    }));
    document.querySelector('.hero-slider')?.addEventListener('mouseenter', () => clearInterval(timer));
    document.querySelector('.hero-slider')?.addEventListener('mouseleave', auto);
    document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : auto());
    go(0);
    auto();
    const videoSection = document.querySelector('.video-section');
    const videoBox = document.querySelector('#videoScreen');
    let videoFrame;
    const sendVideoCommand = (func) => {
        if (!videoFrame?.contentWindow) return;
        videoFrame.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com');
    };
    const startVideo = () => {
        if (!YOUTUBE_VIDEO_ID || !videoBox) return;
        if (!videoFrame) {
            const origin = encodeURIComponent(location.origin);
            videoBox.innerHTML = `<iframe id="youtubePlayer" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(YOUTUBE_VIDEO_ID)}?autoplay=1&mute=1&playsinline=1&enablejsapi=1&origin=${origin}&rel=0" title="Arbuda Bangles video" allow="autoplay; encrypted-media; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
            videoFrame = videoBox.querySelector('iframe');
        } else {
            sendVideoCommand('playVideo');
        }
    };
    if (!YOUTUBE_VIDEO_ID && videoBox) {
        videoBox.innerHTML = '<div class="video-unavailable"><strong>Video coming soon</strong><span>Add your YouTube video ID in assets/js/app.js to play it here.</span></div>';
    } else if (videoBox && !/^https?:$/.test(location.protocol)) {
        videoBox.innerHTML = '<div class="video-unavailable"><strong>Open this site from a web server</strong><span>YouTube embeds need an HTTP or HTTPS page referrer. Run this site at localhost or open its hosted URL.</span></div>';
    } else if (videoSection && 'IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) startVideo();
                else sendVideoCommand('pauseVideo');
            });
        }, { threshold: 0.5 });
        videoObserver.observe(videoBox || videoSection);
    } else if (videoSection) {
        startVideo();
    }
})();
