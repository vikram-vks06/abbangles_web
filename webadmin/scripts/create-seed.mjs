import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const catalog = JSON.parse(
  (await readFile(resolve(root, "lib/catalog-data.json"), "utf8")).replace(
    /^\uFEFF/,
    "",
  ),
);
const image = (path) => `/assets/images/${path}`;

const content = {
  schemaVersion: 1,
  company: {
    id: "A1B1",
    name: "Arbuda Bangles",
    legalName: "Arbuda Bangles",
    established: 1977,
    city: "Ahmedabad",
    country: "India",
    logo: image("company/ablogo.png"),
  },
  site: {
    title: "Arbuda Bangles | Ahmedabad",
    description:
      "Explore colourful bangle collections from Arbuda Bangles, Ahmedabad. Established 1977.",
    theme: {
      primary: "#145a3b",
      secondary: "#ef812f",
      dark: "#103d2d",
      cream: "#fffaf1",
      headingFont: "Cormorant Garamond",
      bodyFont: "Inter",
    },
  },
  header: {
    announcement: "Since 1977 · Ahmedabad, India",
    phoneLabel: "Call us",
    phones: ["+91 92655 98961", "+91 78638 67139"],
    enquiryButton: "Enquire Now",
    loginButton: "Sign in",
    loginUrl: "https://abedobiz.abbangles.com/login",
    socials: [
      {
        type: "whatsapp",
        label: "WhatsApp",
        url: "https://wa.me/919879003308",
      },
      {
        type: "facebook",
        label: "Facebook",
        url: "https://www.facebook.com/search/top?q=Arbuda%20Bangles%20Ahmedabad",
      },
      {
        type: "youtube",
        label: "YouTube",
        url: "https://www.youtube.com/watch?v=BCrZokqVrVw",
      },
      {
        type: "instagram",
        label: "Instagram",
        url: "https://www.instagram.com/explore/search/keyword/?q=Arbuda%20Bangles%20Ahmedabad",
      },
    ],
  },
  enquiryForm: {
    eyebrow: "LET’S BUILD A COLORFUL PARTNERSHIP",
    title: "Let’s talk business.",
    description:
      "Tell us a little about your business and our team will be in touch.",
    topicLabel: "Enquiry about",
    fields: [
      {
        name: "name",
        label: "Your name",
        placeholder: "How should we address you?",
        required: true,
      },
      {
        name: "email",
        label: "Email address",
        placeholder: "you@yourbusiness.com",
        required: true,
      },
      {
        name: "phone",
        label: "Contact / WhatsApp number",
        placeholder: "Include your country code",
        required: true,
      },
      {
        name: "businessType",
        label: "Your business type",
        required: true,
        options: ["Wholesaler", "Retailer", "Distributor"],
      },
      {
        name: "message",
        label: "Message",
        placeholder:
          "Tell us what styles, quantities, or catalogue details you’re looking for.",
        required: true,
      },
    ],
    submitButton: "Send enquiry",
    privacyNote:
      "Your details open in WhatsApp with your enquiry, ready to send.",
    closeLabel: "Close enquiry form",
  },
  navigation: [
    { label: "Home", href: "/", visible: true },
    { label: "About Us", href: "/about", visible: true },
    { label: "Products", href: "/products", visible: true },
    { label: "Catalogue", href: "/catalogue", visible: true },
    { label: "Gallery", href: "/gallery", visible: true },
    { label: "Contact", href: "/contact", visible: true },
  ],
  pages: {
    home: {
      title: "Home",
      sections: [
        {
          id: "hero",
          type: "heroCarousel",
          visible: true,
          eyebrow: "A celebration of colour",
          slides: [
            {
              title: "Arbuda Bangles\nAhmedabad",
              description:
                "Dealing in plastic, acrylic, metal, chuda and more — crafting colour and celebration for every occasion since 1977.",
              image: image("slider/slider1.png"),
              primaryButton: "Explore collection",
              primaryHref: "/products?category=14",
              secondaryButton: "View catalogue",
              secondaryHref: "/catalogue",
            },
            {
              title: "Every colour.\nEvery celebration.",
              description:
                "Explore vibrant plastic and acrylic bangles for everyday style and unforgettable occasions.",
              image: image("slider/slider5.png"),
              primaryButton: "Explore collection",
              primaryHref: "/products?category=14",
              secondaryButton: "View catalogue",
              secondaryHref: "/catalogue",
            },
            {
              title: "The beauty of\nbrass & metal.",
              description:
                "Beautifully detailed brass kadas, metal bangles and statement designs for your collection.",
              image: image("slider/slider2.avif"),
              primaryButton: "Explore collection",
              primaryHref: "/products?category=3",
              secondaryButton: "View catalogue",
              secondaryHref: "/catalogue",
            },
            {
              title: "A little tradition.\nA lot of love.",
              description:
                "Discover festive chuda sets and classic bangles that bring every celebration to life.",
              image: image("slider/slider3.webp"),
              primaryButton: "Explore collection",
              primaryHref: "/products?category=5",
              secondaryButton: "View catalogue",
              secondaryHref: "/catalogue",
            },
            {
              title: "Discover more.\nStock better.",
              description:
                "Browse an extensive range of colours, styles and finishes. Connect directly for wholesale enquiries.",
              image: image("slider/slider4.webp"),
              primaryButton: "Browse products",
              primaryHref: "/products",
              secondaryButton: "Enquire now",
              secondaryHref: "enquiryModal",
            },
          ],
        },
        {
          id: "trust-strip",
          type: "trustStrip",
          visible: true,
          items: [
            "Since 1977",
            "Wholesale & export",
            "Quality collections",
            "Worldwide delivery",
          ],
        },
        {
          id: "categories",
          type: "categoryGrid",
          visible: true,
          title: "Explore our collections",
          description: "Find a style for every occasion.",
        },
        {
          id: "story",
          type: "story",
          visible: true,
          eyebrow: "OUR STORY",
          title: "A legacy of colour since 1977",
          description:
            "Traditional elegance, timeless collections. Arbuda Bangles has served retailers and partners with quality bangles for generations.",
          image: image("slider/slider1.png"),
          stats: [
            { value: "1977", label: "Established" },
            { value: "45+", label: "Years of craft" },
            { value: "Worldwide", label: "Markets served" },
          ],
        },
        {
          id: "featured-products",
          type: "productGrid",
          visible: true,
          title: "Featured collections",
          description: "Popular styles and new favourites.",
          productIds: [25, 19, 10, 16, 17, 20, 6, 13],
          button: "Explore all products",
          buttonHref: "/products",
        },
        {
          id: "video",
          type: "video",
          visible: true,
          eyebrow: "STEP INSIDE OUR WORLD",
          title: "See the beauty in motion.",
          description:
            "Discover the colours, collections and craftsmanship behind Arbuda Bangles.",
          youtubeId: "BCrZokqVrVw",
          button: "Explore gallery",
          buttonHref: "/gallery",
        },
        {
          id: "gallery-preview",
          type: "galleryGrid",
          visible: true,
          title: "Our colourful world",
          categoryIndexes: [1, 8, 4, 13],
        },
        {
          id: "team",
          type: "teamCarousel",
          visible: true,
          title: "The people behind the craft",
          items: [
            {
              name: "Mr. Anil Prajapati",
              role: "Founder",
              image: image("team/anilbprajapati-card.webp"),
              description: "The vision behind Arbuda",
            },
            {
              name: "Mr. Pratik Prajapati",
              role: "Managing Director",
              image: image("team/pratikmd.png"),
              description: "Guiding the next chapter",
            },
            {
              name: "Sales desk",
              role: "Sales & Exports",
              image: image("team/team3.jpeg"),
              description: "Here to help you source",
            },
            {
              name: "Arbuda Bangles",
              role: "Our Team",
              image: image("team/team1.jpeg"),
              description: "A family built on craft",
            },
            {
              name: "Team",
              role: "Arbuda Family",
              image: image("team/team2.jpeg"),
              description: "A family built on craft",
            },
          ],
        },
        {
          id: "global-reach",
          type: "globalReach",
          visible: true,
          title: "A world of colour",
          description:
            "Connecting beautiful collections with business partners around the world.",
          markets: [
            "India",
            "Middle East",
            "North America",
            "Europe",
            "Africa",
            "Asia Pacific",
          ],
        },
        {
          id: "reviews",
          type: "reviewCarousel",
          visible: true,
          title: "Trusted by our partners",
          description: "Real experiences from the people we work with.",
          items: [
            {
              name: "Anmol",
              image: image("client-avatars/anmol.png"),
              rating: 5,
              quote:
                "It was great doing business with Pratik bhaiya. Loved the range, prices, easy billing and payment methods. No doubt, a great place to buy bangles.",
            },
            {
              name: "Bhavesh Dixit",
              image: image("client-avatars/bhaveshdixit.png"),
              rating: 5,
              quote:
                "Best variety of bangles available here with very standard rates. A great business policy and goods delivered to your doorstep by transport.",
            },
            {
              name: "Nappu",
              image: image("client-avatars/nappu.png"),
              rating: 5,
              quote:
                "A great experience with a lovely range of bangles and helpful service.",
            },
            {
              name: "Customer",
              image: image("client-avatars/mddanish.png"),
              rating: 5,
              quote:
                "The shop owner is very frank. Prices are good and the finishing of the bangles is also good.",
            },
            {
              name: "Harprit Singh",
              image: image("client-avatars/harpritsingh.png"),
              rating: 5,
              quote:
                "Very organised business system. I am impressed by the way they deal with customers. Variety and rates are good.",
            },
            {
              name: "Sachet Verma",
              image: image("client-avatars/sachetverma.png"),
              rating: 5,
              quote:
                "Best experience. Excellent quality and excellent staff work.",
            },
          ],
        },
        {
          id: "cta",
          type: "callToAction",
          visible: true,
          eyebrow: "WHOLESALE & TRADE ENQUIRIES",
          title: "Find your perfect collection.",
          description:
            "Get in touch for product availability, bulk orders and quotations.",
          button: "Enquire now",
          action: "enquiryModal",
        },
      ],
    },
    about: {
      title: "Our Story",
      description: "A legacy of jewellery and trust since 1977.",
      sections: [
        {
          id: "intro",
          type: "imageText",
          visible: true,
          eyebrow: "Welcome to Arbuda Bangles",
          title: "Inspired by tradition. Built on trust.",
          description:
            "Established in 1977, Arbuda Bangles brings together traditional craftsmanship, vibrant colour and dependable service. We are exporters, suppliers and traders of bangles and kadas.",
          image: image("slider/slider1.png"),
          button: "Explore products",
          buttonHref: "/products",
        },
        {
          id: "values",
          type: "stats",
          visible: true,
          items: [
            { value: "1977", label: "Established" },
            { value: "Worldwide", label: "Markets covered" },
            { value: "45+", label: "Years of experience" },
          ],
        },
      ],
    },
    products: {
      title: "Our Products",
      description:
        "Explore our jewellery range and enquire directly for availability and wholesale quotations.",
      searchPlaceholder: "Search products by name",
      emptyMessage: "No matching products found.",
      enquiryButton: "Enquire",
      productDetailButton: "View details",
      availabilityLabel: "Availability & pricing",
      availabilityValue: "On enquiry",
    },
    catalogue: {
      title: "Digital Catalogue",
      description:
        "Browse our collections by category. Contact us for the latest product sheets and availability.",
      ctaTitle: "Need the latest catalogue?",
      ctaDescription:
        "Request updated product images, specifications and wholesale information.",
      ctaButton: "Request catalogue",
    },
    gallery: {
      title: "Gallery",
      description: "A glimpse into our collections.",
    },
    contact: {
      title: "Contact Us",
      description:
        "We would love to hear from you. Send us an enquiry about our collections.",
      address:
        "1442, Rangati Bazar, Near Suthar Wadas Pole, Astodia, Ahmedabad, Gujarat 380001, India",
      departments: [
        {
          name: "Sales Department",
          phones: ["+91 92655 98961", "+91 78638 67139"],
        },
        {
          name: "Purchase Department",
          phones: ["+91 95747 71721", "+91 92652 56659"],
        },
        { name: "Transport Department", phones: ["+91 92653 47683"] },
        {
          name: "Administration",
          phones: ["+91 98790 03308", "+91 93270 90609"],
        },
      ],
      emails: ["pratikpraj@gmail.com", "info@abbangles.com"],
      gst: "24ABRPP5239L1Z1",
      form: {
        title: "Send an Enquiry",
        fields: ["name", "email", "phone", "businessType", "message"],
        businessTypes: ["Wholesaler", "Retailer", "Distributor"],
        submitButton: "Send via WhatsApp",
      },
    },
  },
  footer: {
    brandName: "Arbuda Bangles",
    description:
      "Traditional elegance, timeless collections. Exporter, supplier and trader of bangles and kadas since 1977.",
    exploreTitle: "Explore",
    links: [
      { label: "Our Products", href: "/products" },
      { label: "About Us", href: "/about" },
      { label: "Catalogue", href: "/catalogue" },
      { label: "Contact", href: "/contact" },
    ],
    contactTitle: "Get in touch",
    address:
      "1442, Rangati Bazar, Near Suthar Wadas Pole, Astodia, Ahmedabad, Gujarat 380001",
    phone: "+91 98790 03308",
    email: "pratikpraj@gmail.com",
    copyright: "All rights reserved.",
    gst: "24ABRPP5239L1Z1",
    floatingButton: "WhatsApp",
  },
  collections: { categories: catalog.categories, products: catalog.products },
};

const output = resolve(root, "webadmin/src/data/site-content.json");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(content, null, 2)}\n`, "utf8");
console.log(`Wrote ${output}`);
