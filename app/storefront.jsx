"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const wa = (message, phone) =>
  `https://wa.me/${String(phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
const contactApiUrl = "/api/contactus";
const imageUrl = (image) => {
  const value = String(image || "").trim();
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return `/${value.replace(/^\/+/, "")}`;
};

function validateInquiryForm(form) {
  const name = form.elements.namedItem("name");
  const email = form.elements.namedItem("email");
  const phone = form.elements.namedItem("phone");
  const message = form.elements.namedItem("message");
  const businessType = form.elements.namedItem("businessType");
  const nameValue = name.value.trim();
  const emailValue = email.value.trim();
  const phoneValue = phone.value.trim();
  const messageValue = message.value.trim();

  name.setCustomValidity(
    !nameValue
      ? "Please enter your name"
      : nameValue.length < 2
        ? "Name must be at least 2 characters"
        : "",
  );
  email.setCustomValidity(
    !emailValue
      ? "Please enter your email"
      : email.validity.typeMismatch
        ? "Please enter a valid email address"
        : "",
  );
  phone.setCustomValidity(
    !phoneValue
      ? "Please enter your phone number"
      : !/^\d+$/.test(phoneValue)
        ? "Please enter only digits"
        : phoneValue.length < 10
          ? "Phone number must be at least 10 digits"
          : "",
  );
  message.setCustomValidity(
    !messageValue
      ? "Please enter your message"
      : messageValue.length < 10
        ? "Message must be at least 10 characters"
        : "",
  );
  if (businessType) {
    businessType.setCustomValidity(
      businessType.value ? "" : "Please select your business type",
    );
  }

  return form.reportValidity();
}

async function sendContactInquiry(
  form,
  context = [],
  companyName = "our team",
) {
  const values = new FormData(form);
  const message = [
    String(values.get("message") || "").trim(),
    ...context.filter(Boolean),
  ].join("\n\n");
  const body = new URLSearchParams({
    name: String(values.get("name") || "").trim(),
    email: String(values.get("email") || "").trim(),
    phone: String(values.get("phone") || "").trim(),
    message,
  });
  const response = await fetch(contactApiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const message =
      typeof result?.message === "string" &&
      !/<\/?[a-z][^>]*>/i.test(result.message)
        ? result.message
        : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return `Thank you for contacting ${companyName}. We have successfully received your enquiry and our team will contact you shortly.`;
}

function InterestSelector({ categories }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const id = useId();
  const selectorRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event) => {
      if (!selectorRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="interest-selector" ref={selectorRef}>
      {selected.map((name) => (
        <input key={name} type="hidden" name="interestedIn" value={name} />
      ))}
      <button
        id={`${id}-toggle`}
        className="interest-selector-toggle"
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        disabled={!categories.length}
        onClick={() => setOpen((value) => !value)}
      >
        {selected.length
          ? `${selected.length} collection${selected.length === 1 ? "" : "s"} selected`
          : categories.length
            ? "Select collections"
            : "No collections available"}
        <span aria-hidden="true">{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div
          className="interest-selector-options"
          id={`${id}-options`}
          role="group"
          aria-labelledby={`${id}-toggle`}
        >
          {categories.map((category, index) => {
            const inputId = `${id}-option-${index}`;
            return (
              <label
                className="interest-option"
                htmlFor={inputId}
                key={category.id}
              >
                <input
                  id={inputId}
                  type="checkbox"
                  value={category.name}
                  checked={selected.includes(category.name)}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, category.name]
                        : current.filter((name) => name !== category.name),
                    )
                  }
                />
                <span>{category.name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SocialLinks({ items = [] }) {
  const paths = {
    whatsapp:
      "M20.5 3.5A10.9 10.9 0 0 0 3.3 16.6L2 22l5.5-1.4A10.9 10.9 0 1 0 20.5 3.5ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.5-.7-1.8-.8s-.4-.1-.6.1-.7.8-.9.9-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.3.2-.3.6-1.1.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.2 1 2.5 1.1 2.7a10 10 0 0 0 3.9 3.4c1.5.6 2.1.7 2.9.6.4-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.4-.3Z",
    facebook:
      "M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.6V13h2.7v8h3.2Z",
    youtube:
      "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z",
    instagram:
      "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.2-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z",
  };
  return (
    <nav className="social-links" aria-label="Social media">
      {items
        .filter((item) => item?.url)
        .map(({ label, type, url }) => (
          <a
            key={type || label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
          >
            {paths[type] ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={paths[type]} />
              </svg>
            ) : (
              label
            )}
          </a>
        ))}
    </nav>
  );
}
function Header({ content, company, navigation, onEnquire }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const phones = Array.isArray(content.phones) ? content.phones : [];
  return (
    <>
      <div className="bg-wine top-contactbar text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span>{content.announcement}</span>
          <div className="top-contact-list" aria-label={`Call ${company.name}`}>
            <span className="top-contact-label">{content.phoneLabel}</span>
            {phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                {phone}
              </a>
            ))}
            <SocialLinks items={content.socials} />
          </div>
        </div>
      </div>
      <header className="bg-white/95 sticky top-0 z-40 border-b border-stone-100">
        <div className="site-nav-inner max-w-7xl mx-auto px-5 flex justify-between items-center gap-5">
          <Link href="/" className="shrink-0">
            <img
              src={imageUrl(company.logo)}
              className="brandLogo tracking-wide"
              alt={company.name}
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {navigation
              .filter((item) => item.visible !== false)
              .map(({ label, href }) => (
                <Link
                  key={href}
                  className={`nav-link text-xs font-semibold uppercase tracking-wider ${pathname === href ? "active" : ""}`}
                  href={href}
                >
                  {label}
                </Link>
              ))}
          </nav>
          <div className="header-actions flex items-center gap-3">
            <button
              className="hidden md:inline-flex btn btn-primary !py-3 enquiry-trigger"
              type="button"
              onClick={() => onEnquire()}
            >
              {content.enquiryButton} &#8599;
            </button>
            <a
              className="login-link"
              href={content.loginUrl}
              aria-label={`${content.loginButton} to ${company.name}`}
            >
              <span className="login-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.8 20c.7-3.7 3.1-5.6 7.2-5.6s6.5 1.9 7.2 5.6" />
                </svg>
              </span>
              <span className="login-label">{content.loginButton}</span>
              <span className="login-arrow" aria-hidden="true">
                &#8599;
              </span>
            </a>
            <button
              className="lg:hidden text-2xl"
              id="menuBtn"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              &#9776;
            </button>
          </div>
        </div>
        {open && (
          <nav className="lg:hidden px-5 pb-5 border-t mobile-nav">
            {navigation
              .filter((item) => item.visible !== false)
              .map(({ label, href }) => (
                <Link onClick={() => setOpen(false)} key={href} href={href}>
                  {label}
                </Link>
              ))}
            <a href={content.loginUrl}>
              {content.loginButton} to {company.name} &#8599;
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
function Footer({ content, company, whatsappUrl }) {
  return (
    <>
      <footer className="bg-[#103d2d] text-white mt-20">
        <div className="max-w-7xl mx-auto px-5 py-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h2 className="serif text-4xl">
              {content.brandName || company.name}
            </h2>
            <p className="text-stone-300 mt-4 max-w-sm leading-7">
              {content.description}
            </p>
          </div>
          <div>
            <h3 className="uppercase text-xs tracking-widest text-[#f4b36d] mb-5">
              {content.exploreTitle}
            </h3>
            {(content.links || []).map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <h3 className="uppercase text-xs tracking-widest text-[#f4b36d] mb-5">
              {content.contactTitle}
            </h3>
            <p className="text-stone-300 text-sm leading-7">
              {content.address}
            </p>
            <a href={`tel:${(content.phone || "").replace(/[^\d+]/g, "")}`}>
              {content.phone}
            </a>
            <a className="break-all" href={`mailto:${content.email}`}>
              {content.email}
            </a>
          </div>
        </div>
      </footer>
      <div className="border-t border-white/15 text-center text-xs text-stone-400 py-5 bg-[#103d2d]">
        © {new Date().getFullYear()} {content.brandName || company.name}.{" "}
        {content.copyright}
        {content.gst ? ` · GST: ${content.gst}` : ""}
      </div>
      <a
        className="whatsapp"
        href={
          whatsappUrl ||
          (content.phone
            ? wa(
                `Hello ${company.name}, I would like to know more about your catalogue.`,
                content.phone,
              )
            : "#")
        }
        target="_blank"
      >
        {content.floatingButton} &#8599;
      </a>
    </>
  );
}
function Heading({ k, title, copy }) {
  return (
    <div className="section-heading">
      <span>{k}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}
function Card({ item, category = false, categoryName, onEnquire }) {
  const imageSrc = (image) => {
    const value = String(image || "").trim();
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    return `/${value.replace(/^\/+/, "")}`;
  };
  if (category) {
    return (
      <Link
        className="group relative block landscape-media-frame overflow-hidden bg-stone-200 category-card"
        href={`/products?category=${item.id}`}
      >
        <img
          className="card-img"
          src={imageSrc(item.image)}
          alt={item.name}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h3 className="serif text-3xl">{item.name}</h3>
          <span className="text-xs uppercase tracking-widest">
            Explore collection &#8594;
          </span>
        </div>
      </Link>
    );
  }
  return (
    <article className="group bg-white border border-[#eee6df] overflow-hidden product-card">
      <Link
        href={`/product?id=${item.id}`}
        className="block landscape-media-frame overflow-hidden bg-stone-100"
      >
        <img
          className="card-img"
          src={imageSrc(item.image)}
          alt={item.name}
          loading="lazy"
        />
      </Link>
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-widest gold">
          {categoryName || "Collection"}
        </p>
        <h3 className="serif text-2xl mt-2 mb-4 min-h-[3rem]">{item.name}</h3>
        <div className="flex justify-between items-center gap-2">
          <Link
            className="text-xs uppercase font-bold border-b border-[#145a3b] pb-1"
            href={`/product?id=${item.id}`}
          >
            View details
          </Link>
          <button
            className="text-xs text-[#145a3b] font-bold enquiry-trigger"
            type="button"
            onClick={() => onEnquire(item.name)}
          >
            Enquire &#8599;
          </button>
        </div>
      </div>
    </article>
  );
}

function EnquiryModal({ topic, categories, content, companyName, onClose }) {
  const field = (name) =>
    content.fields?.find((item) => item.name === name) || {};
  const businessTypeField = field("businessType");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const submitLock = useRef(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  async function submitEnquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (submitLock.current || !validateInquiryForm(form)) return;
    submitLock.current = true;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const values = new FormData(form);
      const interests = values.getAll("interestedIn").filter(Boolean);
      const responseMessage = await sendContactInquiry(
        form,
        [
          topic && `Enquiry about: ${topic}`,
          values.get("businessType") &&
            `Business type: ${values.get("businessType")}`,
          interests.length && `Interested in: ${interests.join(", ")}`,
        ],
        companyName,
      );
      setSuccessMessage(responseMessage);
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="enquiry-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="enquiry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiryTitle"
      >
        <button
          className="enquiry-close"
          type="button"
          onClick={onClose}
          aria-label={content.closeLabel}
        >
          ×
        </button>
        <div className="enquiry-intro">
          <span className="enquiry-spark" aria-hidden="true">
            ✦
          </span>
          <p className="section-kicker">{content.eyebrow}</p>
          <h2 id="enquiryTitle">{content.title}</h2>
          <p>{content.description}</p>
          {topic && <span className="enquiry-topic">{topic}</span>}
        </div>
        {successMessage && (
          <div className="enquiry-success" role="status">
            <span aria-hidden="true">✓</span>
            <p>{successMessage}</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              {content.closeLabel}
            </button>
          </div>
        )}
        <form
          className="enquiry-form"
          onSubmit={submitEnquiry}
          noValidate
          hidden={Boolean(successMessage)}
        >
          <label>
            {field("name").label} {field("name").required && <span>*</span>}
            <input
              autoFocus
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              placeholder={field("name").placeholder}
            />
          </label>
          <label>
            {field("email").label} {field("email").required && <span>*</span>}
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={150}
              placeholder={field("email").placeholder}
            />
          </label>
          <label>
            {field("phone").label} {field("phone").required && <span>*</span>}
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[0-9]{10,}"
              minLength={10}
              required
              placeholder={field("phone").placeholder}
            />
          </label>
          <label>
            {businessTypeField.label}{" "}
            {businessTypeField.required && <span>*</span>}
            <select name="businessType" defaultValue="" required>
              <option value="" disabled>
                {businessTypeField.placeholder || "Select your business type"}
              </option>
              {(businessTypeField.options || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <div className="interest-field">
            <span className="interest-label">
              {content.interestLabel || "Interested in"}
            </span>
            <InterestSelector categories={categories} />
          </div>
          <label className="enquiry-message">
            {field("message").label}{" "}
            {field("message").required && <span>*</span>}
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={1500}
              rows={3}
              placeholder={field("message").placeholder}
            />
          </label>
          {errorMessage && (
            <p className="enquiry-error" role="alert">
              {errorMessage}
            </p>
          )}
          <button
            className="enquiry-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : content.submitButton}{" "}
            {!isSubmitting && <span aria-hidden="true">↗</span>}
          </button>
          <p className="enquiry-privacy">{content.privacyNote}</p>
        </form>
      </section>
    </div>
  );
}

export default function Storefront({ initialContent }) {
  const pathname = usePathname();
  const router = useRouter();
  const query = useSearchParams();
  const catalog = useMemo(
    () => ({
      categories: (initialContent?.collections?.categories || []).filter(
        (category) => category.visible !== false,
      ),
      products: (initialContent?.collections?.products || []).filter(
        (product) => product.visible !== false,
      ),
    }),
    [initialContent],
  );
  const [search, setSearch] = useState("");
  const [slide, setSlide] = useState(0);
  const [teamActive, setTeamActive] = useState(0);
  const [reviewActive, setReviewActive] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [enquiry, setEnquiry] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");
  const contactSubmitLock = useRef(false);
  const cmsSections = initialContent?.pages?.home?.sections || [];
  const section = (id) => cmsSections.find((item) => item.id === id);
  const teamSection = section("team");
  const reviewSection = section("reviews");
  const videoSection = section("video");
  const teamMembers = (teamSection?.items || []).filter(
    (item) => item.visible !== false,
  );
  const clientReviews = (reviewSection?.items || []).filter(
    (item) => item.visible !== false,
  );
  const company = initialContent?.company || {};
  const headerContent = initialContent?.header || {};
  const footerContent = initialContent?.footer || {};
  const navigation = initialContent?.navigation || [];
  const enquiryFormContent = initialContent?.enquiryForm || {};
  const enquiryField = (name) =>
    enquiryFormContent.fields?.find((field) => field.name === name) || {};
  const openEnquiry = (topic = "") => setEnquiry({ topic });
  async function submitContactPage(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (contactSubmitLock.current || !validateInquiryForm(form)) return;
    contactSubmitLock.current = true;
    setContactSubmitting(true);
    setContactError("");
    try {
      const values = new FormData(form);
      const interests = values.getAll("interestedIn").filter(Boolean);
      const responseMessage = await sendContactInquiry(
        form,
        [
          values.get("businessType") &&
            `Business type: ${values.get("businessType")}`,
          interests.length && `Interested in: ${interests.join(", ")}`,
        ],
        company.name,
      );
      setContactSuccess(responseMessage);
    } catch (error) {
      setContactError(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      contactSubmitLock.current = false;
      setContactSubmitting(false);
    }
  }
  const key = pathname === "/" ? "home" : pathname.split("/")[1];
  const pageContent =
    initialContent?.pages?.[key === "product" ? "products" : key] || {};
  const homeSlides = (section("hero")?.slides || [])
    .filter((item) => item.visible !== false)
    .map((item) => ({
      eyebrow: section("hero")?.eyebrow || "",
      title: item.title || "",
      copy: item.description || item.copy || "",
      image: item.image || "",
      tag: item.tag || item.title || "",
      href: item.primaryHref || item.href || "/products",
      primaryButton: item.primaryButton || "",
      secondaryButton: item.secondaryButton || "",
      secondaryHref: item.secondaryHref || "/catalogue",
    }));
  const activeSlide = homeSlides.length ? slide % homeSlides.length : 0;
  const activeTeam = teamMembers.length ? teamActive % teamMembers.length : 0;
  const activeReview = clientReviews.length
    ? reviewActive % clientReviews.length
    : 0;
  useEffect(() => {
    if (pathname !== "/" || !homeSlides.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSlide((current) => current % homeSlides.length);
    const id = setInterval(
      () => setSlide((current) => (current + 1) % homeSlides.length),
      6500,
    );
    return () => clearInterval(id);
  }, [pathname, homeSlides.length]);
  useEffect(() => {
    if (pathname !== "/" || !teamMembers.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setTeamActive((i) => (i + 1) % teamMembers.length),
      4200,
    );
    return () => clearInterval(id);
  }, [pathname, teamMembers.length]);
  useEffect(() => {
    if (pathname !== "/" || !clientReviews.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setReviewActive((i) => (i + 1) % clientReviews.length),
      4800,
    );
    return () => clearInterval(id);
  }, [pathname, clientReviews.length]);
  const selected = query.get("id") || "";
  const category = query.get("category") || "";
  const filtered = useMemo(
    () =>
      catalog.products.filter(
        (p) =>
          (!category || String(p.categoryId) === String(category)) &&
          p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [catalog, category, search],
  );
  const product = catalog.products.find(
    (p) => String(p.id) === String(selected),
  );
  const catName = (id) =>
    catalog.categories.find((c) => String(c.id) === String(id))?.name ||
    "Collection";
  const banner = (title, desc) => (
    <section className="banner">
      <span>
        {company.name} / {title.toUpperCase()}
      </span>
      <h1>{title}</h1>
      {desc && <p>{desc}</p>}
    </section>
  );
  const ctaSection = section("cta");
  const categorySection = section("categories");
  const storySection = section("story");
  const featuredSection = section("featured-products");
  const gallerySection = section("gallery-preview");
  const globalSection = section("global-reach");
  const featuredProducts = (featuredSection?.productIds || [])
    .map((id) =>
      catalog.products.find((item) => String(item.id) === String(id)),
    )
    .filter(Boolean);
  const galleryCategories = (gallerySection?.categoryIndexes || [])
    .map((index) => catalog.categories[index])
    .filter(Boolean);
  const primarySocial = (headerContent.socials || []).find(
    (item) => item.type === "whatsapp",
  );
  const whatsappUrl = primarySocial?.url;
  const cta = ctaSection?.visible !== false && (
    <section className="cta">
      <span>{ctaSection?.eyebrow}</span>
      <h2>{ctaSection?.title}</h2>
      <p>{ctaSection?.description}</p>
      <button
        className="button enquiry-trigger"
        type="button"
        onClick={() => openEnquiry(ctaSection?.title)}
      >
        {ctaSection?.button} ↗
      </button>
    </section>
  );
  let content;
  if (key === "products")
    content = (
      <>
        {banner(pageContent.title, pageContent.description)}
        <main className="wrap">
          <div className="filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={pageContent.searchPlaceholder}
            />
            <select
              value={category || ""}
              onChange={(e) =>
                router.push(
                  e.target.value
                    ? `/products?category=${e.target.value}`
                    : "/products",
                )
              }
            >
              <option value="">
                {pageContent.allCategoriesLabel || "All categories"}
              </option>
              {catalog.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <p>
            {filtered.length} {pageContent.resultsLabel || "designs"}
          </p>
          <div className="grid products">
            {filtered.length ? (
              filtered.map((p) => (
                <Card
                  key={p.id}
                  item={p}
                  categoryName={catName(p.categoryId)}
                  onEnquire={openEnquiry}
                />
              ))
            ) : (
              <p>{pageContent.emptyMessage}</p>
            )}
          </div>
        </main>
      </>
    );
  else if (key === "product")
    content = product ? (
      <>
        {banner(product.name, pageContent.productDescription || "")}
        <main className="wrap detail">
          <img
            className="product-detail-image"
            src={imageUrl(product.image)}
            alt={product.name}
          />
          <div>
            <small>{catName(product.categoryId)}</small>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="border-y my-8 py-6 space-y-3 text-sm">
              <p>
                <b>Product:</b> {product.name}
              </p>
              <p>
                <b>Category:</b> {catName(product.categoryId)}
              </p>
              <p>
                <b>{pageContent.availabilityLabel}:</b>{" "}
                {pageContent.availabilityValue}
              </p>
            </div>
            <button
              className="button primary enquiry-trigger"
              type="button"
              onClick={() =>
                openEnquiry(`${product.name} (Product ID: ${product.id})`)
              }
            >
              {pageContent.requestButton || pageContent.enquiryButton} ↗
            </button>
            <p>
              <Link href={`/products?category=${product.categoryId}`}>
                ← Back to collection
              </Link>
            </p>
          </div>
        </main>
      </>
    ) : (
      banner("Product not found", "Please browse our product catalogue.")
    );
  else if (key === "about") {
    const aboutIntro = pageContent.sections?.find(
      (item) => item.id === "intro",
    );
    const aboutStats = pageContent.sections?.find(
      (item) => item.id === "values",
    );
    content = (
      <>
        {banner(pageContent.title, pageContent.description)}
        {aboutIntro?.visible !== false && aboutIntro && (
          <section className="max-w-7xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-14 items-center about-layout">
            <img
              className="w-full aspect-[4/5] object-cover"
              src={imageUrl(aboutIntro.image)}
              alt={aboutIntro.imageAlt || aboutIntro.title}
            />
            <div>
              <p className="gold text-xs uppercase tracking-widest">
                {aboutIntro.eyebrow}
              </p>
              <h2 className="serif text-5xl text-[#145a3b] mt-4">
                {aboutIntro.title}
              </h2>
              <p className="mt-6 leading-8 text-stone-600">
                {aboutIntro.description}
              </p>
              {aboutStats?.visible !== false &&
                aboutStats?.items?.length > 0 && (
                  <div className="grid grid-cols-2 gap-6 mt-9 border-t pt-8">
                    {aboutStats.items.map((item) => (
                      <div key={`${item.value}-${item.label}`}>
                        <b className="serif text-4xl text-[#145a3b]">
                          {item.value}
                        </b>
                        <p className="text-sm text-stone-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              {aboutIntro.button && (
                <Link
                  className="btn btn-primary mt-8"
                  href={aboutIntro.buttonHref || "/products"}
                >
                  {aboutIntro.button} ↗
                </Link>
              )}
            </div>
          </section>
        )}
        {cta}
      </>
    );
  } else if (key === "contact")
    content = (
      <>
        {banner(pageContent.title, pageContent.description)}
        <main className="wrap contact">
          <div>
            <h2 className="serif text-4xl text-[#145a3b] mb-6">
              {footerContent.contactTitle}
            </h2>
            <div className="space-y-6 leading-7">
              <div>
                <p className="gold uppercase text-xs tracking-widest font-bold">
                  Address
                </p>
                <p>{pageContent.address}</p>
              </div>
              {(pageContent.departments || []).map((department) => (
                <div key={department.name}>
                  <p className="gold uppercase text-xs tracking-widest font-bold">
                    {department.name}
                  </p>
                  {(department.phones || []).map((phone, index) => (
                    <span key={phone}>
                      {index > 0 && ", "}
                      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                        ☎ {phone}
                      </a>
                    </span>
                  ))}
                </div>
              ))}
              {(pageContent.emails || []).length > 0 && (
                <div>
                  <p className="gold uppercase text-xs tracking-widest font-bold">
                    Email
                  </p>
                  {pageContent.emails.map((email, index) => (
                    <span key={email}>
                      {index > 0 && ", "}
                      <a href={`mailto:${email}`}>{email}</a>
                    </span>
                  ))}
                </div>
              )}
              {pageContent.gst && (
                <div>
                  <p className="gold uppercase text-xs tracking-widest font-bold">
                    GST
                  </p>
                  <p>{pageContent.gst}</p>
                </div>
              )}
            </div>
            <a
              className="btn btn-outline mt-9"
              target="_blank"
              rel="noopener"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pageContent.address || "")}`}
            >
              {pageContent.mapButton || "View on Maps"} ↗
            </a>
          </div>
          <form
            onSubmit={submitContactPage}
            noValidate
            hidden={Boolean(contactSuccess)}
          >
            <h2 className="serif text-4xl text-[#145a3b] mb-5">
              {pageContent.form?.title}
            </h2>
            <label className="block text-sm">
              {enquiryField("name").label} *
              <input
                className="input mt-2"
                name="name"
                required
                minLength={2}
                maxLength={100}
              />
            </label>
            <label className="block text-sm">
              {enquiryField("phone").label} *
              <input
                className="input mt-2"
                name="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10,}"
                minLength={10}
                required
              />
            </label>
            <label className="block text-sm">
              {enquiryField("email").label}
              <input
                className="input mt-2"
                name="email"
                type="email"
                required
              />
            </label>
            <label className="block text-sm">
              {enquiryField("businessType").label} *
              <select
                className="input mt-2"
                name="businessType"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  {enquiryField("businessType").placeholder ||
                    "Select your business type"}
                </option>
                {(pageContent.form?.businessTypes || []).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <div className="interest-field">
              <span className="interest-label">Interested in</span>
              <InterestSelector categories={catalog.categories} />
            </div>
            <label className="block text-sm">
              {enquiryField("message").label} *
              <textarea
                className="input mt-2"
                name="message"
                rows={4}
                required
                minLength={10}
                maxLength={1500}
              />
            </label>
            {contactError && (
              <p className="contact-error" role="alert">
                {contactError}
              </p>
            )}
            <button
              className="btn btn-primary w-full"
              type="submit"
              disabled={contactSubmitting}
            >
              {contactSubmitting
                ? "Sending..."
                : pageContent.form?.submitButton ||
                  enquiryFormContent.submitButton}
            </button>
            <p className="text-xs text-stone-500">
              {enquiryFormContent.privacyNote}
            </p>
          </form>
          {contactSuccess && (
            <div className="contact-success" role="status">
              <span aria-hidden="true">✓</span>
              <h2>Thank you</h2>
              <p>{contactSuccess}</p>
            </div>
          )}
        </main>
      </>
    );
  else if (key === "catalogue")
    content = (
      <>
        {banner(pageContent.title, pageContent.description)}
        <section className="max-w-7xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalog.categories.map((item) => (
              <Card
                key={item.id}
                item={item}
                category
                onEnquire={openEnquiry}
              />
            ))}
          </div>
          <div className="bg-[#fffaf1] mt-14 p-10 text-center catalogue-callout">
            <h2 className="serif text-4xl text-[#145a3b]">
              {pageContent.ctaTitle}
            </h2>
            <p className="mt-3 text-stone-600">{pageContent.ctaDescription}</p>
            <button
              className="btn btn-primary mt-6 enquiry-trigger"
              type="button"
              onClick={() => openEnquiry(pageContent.ctaTitle)}
            >
              {pageContent.ctaButton} ↗
            </button>
          </div>
        </section>
      </>
    );
  else if (key === "gallery")
    content = (
      <>
        {banner(pageContent.title, pageContent.description)}
        <section className="max-w-7xl mx-auto px-5 py-16 grid grid-cols-2 md:grid-cols-3 gap-4 gallery-grid">
          {catalog.products.slice(0, 18).map((item) => (
            <Link
              key={item.id}
              className="group landscape-media-frame overflow-hidden"
              href={`/product?id=${item.id}`}
              title={item.name}
            >
              <img
                className="card-img"
                src={imageUrl(item.image)}
                alt={item.name}
                loading="lazy"
              />
            </Link>
          ))}
        </section>
      </>
    );
  else if (key === "blog")
    content = (
      <>
        {banner(
          "Journal",
          "Stories, inspiration and insights from the world of bangles.",
        )}
        <main className="wrap">
          <div className="grid categories">
            {[
              [
                "Fancy Bangles Exporters: Taking Indian Craft Global",
                "Indian bangles connect timeless craftsmanship with customers around the world. Discover styles, materials and sourcing considerations.",
              ],
              [
                "Glass Bangles Suppliers in India: Trends and Tradition",
                "Glass bangles remain a vibrant part of Indian jewellery culture, from festive colours to contemporary patterns.",
              ],
            ].map(([title, copy], i) => (
              <article className="journal" key={title}>
                <img src={"/" + catalog.categories[i]?.image} alt="Bangles" />
                <div>
                  <p className="gold text-xs uppercase tracking-widest">
                    Journal
                  </p>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                  <Link
                    className="text-sm underline mt-5 inline-block"
                    href="/contact"
                  >
                    Ask us more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </main>
        {cta}
      </>
    );
  else
    content = (
      <>
        {homeSlides.length > 0 && section("hero")?.visible !== false && (
          <section
            className="hero-slider"
            aria-label={section("hero")?.ariaLabel || "Featured collections"}
          >
            <div className="hero-pattern" />
            <div className="hero-wrap">
              <div className="hero-copy" key={`copy-${activeSlide}`}>
                <p className="hero-eyebrow">
                  <span className="mini-line" />
                  {homeSlides[activeSlide].eyebrow}
                </p>
                <h1>
                  {homeSlides[activeSlide].title
                    .split("\n")
                    .map((line, i, lines) => (
                      <span key={i}>
                        {line}
                        {i < lines.length - 1 && <br />}
                      </span>
                    ))}
                </h1>
                <p className="hero-description">
                  {homeSlides[activeSlide].copy}
                </p>
                <div className="hero-actions">
                  <Link
                    className="btn btn-primary"
                    href={homeSlides[activeSlide].href}
                  >
                    {homeSlides[activeSlide].primaryButton} ↗
                  </Link>
                  {homeSlides[activeSlide].secondaryHref === "enquiryModal" ? (
                    <button
                      className="hero-secondary"
                      type="button"
                      onClick={() => openEnquiry()}
                    >
                      {homeSlides[activeSlide].secondaryButton} →
                    </button>
                  ) : (
                    <Link
                      className="hero-secondary"
                      href={homeSlides[activeSlide].secondaryHref}
                    >
                      {homeSlides[activeSlide].secondaryButton} →
                    </Link>
                  )}
                </div>
                <div className="hero-foot">
                  <span className="hero-index">
                    {String(activeSlide + 1).padStart(2, "0")}{" "}
                    <em>/ {String(homeSlides.length).padStart(2, "0")}</em>
                  </span>
                  <span className="hero-rule" />
                  <span>{homeSlides[activeSlide].tag}</span>
                </div>
              </div>
              <div className="hero-visual" key={`visual-${activeSlide}`}>
                <div className="hero-orbit" />
                <img
                  src={imageUrl(homeSlides[activeSlide].image)}
                  alt={homeSlides[activeSlide].tag + " bangle collection"}
                />
                <div className="hero-float">
                  <span className="spark">✦</span>
                  <strong>{homeSlides[activeSlide].tag}</strong>
                </div>
              </div>
            </div>
            <div className="hero-controls">
              <button
                type="button"
                onClick={() =>
                  setSlide((slide + homeSlides.length - 1) % homeSlides.length)
                }
                aria-label="Previous slide"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setSlide((slide + 1) % homeSlides.length)}
                aria-label="Next slide"
              >
                →
              </button>
            </div>
            <div className="hero-dots">
              {homeSlides.map((item, i) => (
                <button
                  key={item.tag}
                  className={`hero-dot ${slide === i ? "active" : ""}`}
                  onClick={() => setSlide(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={slide === i}
                />
              ))}
            </div>
            <div className="hero-progress">
              <span
                key={`progress-${slide}`}
                style={{ animation: "slideTimer 6.5s linear forwards" }}
              />
            </div>
          </section>
        )}
        {section("trust-strip")?.visible !== false &&
          section("trust-strip")?.items?.length > 0 && (
            <div className="trust-strip">
              {section("trust-strip").items.map((item) => (
                <div key={typeof item === "string" ? item : item.title}>
                  ✦{" "}
                  <strong>
                    {typeof item === "string" ? item : item.title}
                  </strong>
                  {typeof item !== "string" && item.description && (
                    <span>{item.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        {categorySection?.visible !== false && (
          <main className="wrap">
            <Heading
              k={categorySection?.eyebrow}
              title={categorySection?.title}
              copy={categorySection?.description}
            />
            <div className="grid categories">
              {catalog.categories
                .slice(0, categorySection?.limit || 8)
                .map((item) => (
                  <Card
                    key={item.id}
                    item={item}
                    category
                    onEnquire={openEnquiry}
                  />
                ))}
            </div>
            <div className="center">
              {categorySection?.button && (
                <Link
                  className="button outline"
                  href={categorySection.buttonHref || "/catalogue"}
                >
                  {categorySection.button} →
                </Link>
              )}
            </div>
          </main>
        )}
        {storySection?.visible !== false && (
          <section className="story-section">
            <div className="max-w-7xl mx-auto px-5 py-20 md:py-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="story-photo">
                <img
                  loading="lazy"
                  src={imageUrl(storySection?.image)}
                  alt={storySection?.imageAlt || storySection?.title}
                />
                <div className="story-stamp">
                  {storySection?.stamp || company.name}
                  <span>✳</span>
                </div>
              </div>
              <div>
                <p className="section-kicker">{storySection?.eyebrow}</p>
                <h2 className="display-heading">{storySection?.title}</h2>
                <p className="mt-7 leading-8 text-stone-600">
                  {storySection?.description}
                </p>
                <div className="story-stats">
                  {(storySection?.stats || []).map((item) => (
                    <div key={`${item.value}-${item.label}`}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <Link
                  className="btn btn-primary mt-8"
                  href={storySection?.buttonHref || "/about"}
                >
                  {storySection?.button || "About us"} ↗
                </Link>
              </div>
            </div>
          </section>
        )}
        {featuredSection?.visible !== false && (
          <main className="wrap">
            <Heading
              k={featuredSection?.eyebrow}
              title={featuredSection?.title}
              copy={featuredSection?.description}
            />
            <div className="grid products">
              {featuredProducts.map((item) => (
                <Card
                  key={item.id}
                  item={item}
                  categoryName={catName(item.categoryId)}
                  onEnquire={openEnquiry}
                />
              ))}
            </div>
            {featuredSection?.button && (
              <div className="center">
                <Link
                  className="button outline"
                  href={featuredSection.buttonHref || "/products"}
                >
                  {featuredSection.button} →
                </Link>
              </div>
            )}
          </main>
        )}
        {videoSection?.visible !== false && videoSection && (
          <section className="video-section">
            <div className="max-w-7xl mx-auto px-5 py-20 md:py-28 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <div>
                <p className="section-kicker">{videoSection.eyebrow}</p>
                <h2 className="display-heading">{videoSection.title}</h2>
                <p className="mt-6 text-stone-600 leading-8">
                  {videoSection.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    className="btn btn-primary"
                    href={videoSection.buttonHref || "/gallery"}
                  >
                    {videoSection.button} ↗
                  </Link>
                  {videoSection.secondaryButton && (
                    <Link
                      className="btn btn-outline"
                      href={videoSection.secondaryHref || "/contact"}
                    >
                      {videoSection.secondaryButton}
                    </Link>
                  )}
                </div>
              </div>
              <div className="laptop-scene">
                <div className="laptop-lid">
                  <div className="laptop-screen">
                    <div className="video-poster">
                      {videoPlaying ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoSection.youtubeId || "")}?autoplay=1&mute=1&playsinline=1&rel=0`}
                          title={videoSection.title}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <img
                            src={imageUrl(
                              videoSection.previewImage ||
                                "/assets/images/bangles-08.svg",
                            )}
                            alt={videoSection.imageAlt || videoSection.title}
                          />
                          <div className="video-screen-overlay" />
                          <button
                            onClick={() => setVideoPlaying(true)}
                            type="button"
                            className="video-play"
                            aria-label={`Play ${videoSection.title}`}
                          >
                            ▶
                          </button>
                          <span className="video-caption">
                            {videoSection.playLabel || videoSection.eyebrow}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="laptop-base">
                  <div className="laptop-notch" />
                </div>
                <div className="laptop-shadow" />
              </div>
            </div>
          </section>
        )}
        {gallerySection?.visible !== false && (
          <main className="wrap">
            <Heading
              k={gallerySection?.eyebrow}
              title={gallerySection?.title}
              copy={gallerySection?.description}
            />
            <div className="gallery-preview">
              {galleryCategories.map((item) => (
                <Link key={item.id} href="/gallery">
                  <img
                    loading="lazy"
                    src={imageUrl(item.image)}
                    alt={item.name}
                  />
                  <span>{item.name} ↗</span>
                </Link>
              ))}
            </div>
          </main>
        )}
        {teamSection?.visible !== false && teamMembers.length > 0 && (
          <section className="team-section" aria-labelledby="teamTitle">
            <div className="max-w-7xl mx-auto px-5 py-14 md:py-16">
              <div className="team-heading">
                <div>
                  {teamSection.eyebrow && (
                    <p className="section-kicker">
                      <span className="team-kicker-dot" /> {teamSection.eyebrow}
                    </p>
                  )}
                  <h2 id="teamTitle" className="display-heading">
                    {teamSection.title}
                  </h2>
                </div>
              </div>
              <div className="team-stage" id="teamStage">
                {teamMembers.map((member, i) => (
                  <article
                    key={member.name}
                    className={`team-card ${activeTeam === i ? "is-focused" : ""}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={activeTeam === i}
                    aria-label={`${member.role}: ${member.name}`}
                    onClick={() => setTeamActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setTeamActive(i);
                    }}
                  >
                    <div className="team-photo-wrap">
                      <img
                        className="team-photo"
                        src={imageUrl(member.image)}
                        alt={`${member.name}, ${member.role} at ${company.name}`}
                        loading="lazy"
                      />
                      <span className="team-index">0{i + 1}</span>
                    </div>
                    <div className="team-copy">
                      <span className="team-role">{member.role}</span>
                      <h3>{member.name}</h3>
                      <p>{member.description || member.note}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="team-footer">
                <div
                  className="team-controls"
                  aria-label="Team carousel controls"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setTeamActive(
                        (teamActive + teamMembers.length - 1) %
                          teamMembers.length,
                      )
                    }
                    aria-label="Previous team member"
                  >
                    ←
                  </button>
                  <span>
                    <b>{String(activeTeam + 1).padStart(2, "0")}</b>
                    <i>/ {String(teamMembers.length).padStart(2, "0")}</i>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTeamActive((teamActive + 1) % teamMembers.length)
                    }
                    aria-label="Next team member"
                  >
                    →
                  </button>
                </div>
                {teamSection.footerCopy && (
                  <p className="team-footer-copy">{teamSection.footerCopy}</p>
                )}
              </div>
            </div>
          </section>
        )}
        {globalSection?.visible !== false && globalSection && (
          <section className="global-section" aria-labelledby="globalTitle">
            <div className="global-pattern" />
            <div className="global-layout max-w-7xl mx-auto px-5 py-20 md:py-28">
              <div className="global-copy">
                {globalSection.eyebrow && (
                  <p className="section-kicker global-kicker">
                    <span className="global-kicker-dot" />{" "}
                    {globalSection.eyebrow}
                  </p>
                )}
                <h2 id="globalTitle" className="display-heading">
                  {globalSection.title}
                </h2>
                <p className="global-description">
                  {globalSection.description}
                </p>
                <div className="global-origin">
                  <span className="global-origin-mark">A</span>
                  <span>
                    <b>
                      {[company.city, company.country]
                        .filter(Boolean)
                        .join(", ")}
                    </b>
                    {globalSection.originNote && (
                      <small>{globalSection.originNote}</small>
                    )}
                  </span>
                </div>
                {globalSection.marketNote && (
                  <div className="global-market-note">
                    <span /> {globalSection.marketNote}
                  </div>
                )}
              </div>
              <div className="global-showcase">
                <div className="world-orbit" />
                <div
                  className="world-visual"
                  aria-label="World map with highlighted international markets"
                  onPointerMove={(event) => {
                    if (
                      window.matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                    )
                      return;
                    const box = event.currentTarget.getBoundingClientRect();
                    event.currentTarget.style.setProperty(
                      "--map-x",
                      `${((event.clientX - box.left) / box.width - 0.5) * -9}px`,
                    );
                    event.currentTarget.style.setProperty(
                      "--map-y",
                      `${((event.clientY - box.top) / box.height - 0.5) * -7}px`,
                    );
                  }}
                  onPointerLeave={(event) => {
                    event.currentTarget.style.setProperty("--map-x", "0px");
                    event.currentTarget.style.setProperty("--map-y", "0px");
                  }}
                >
                  <img
                    className="world-map"
                    src="/assets/images/world-map.svg"
                    alt={`Connections from ${company.city}, ${company.country} to international markets`}
                    loading="lazy"
                  />
                  {(globalSection.markets || []).map((name, i) => {
                    const positions = [
                      ["22.8%", "28.9%"],
                      ["49.2%", "19.4%"],
                      ["65%", "36.7%"],
                      ["71.7%", "37.8%"],
                      ["56.9%", "66.1%"],
                      ["87.2%", "63.9%"],
                    ];
                    const [x, y] = positions[i % positions.length];
                    return (
                      <div
                        key={name}
                        className={`map-point map-point-${i + 1}`}
                        style={{ "--x": x, "--y": y, "--delay": `${i * 0.3}s` }}
                      >
                        <span className="map-pulse" />
                        <span className="map-label">{name}</span>
                      </div>
                    );
                  })}
                  <div className="map-origin">
                    <span>
                      {company.name
                        .split(/\s+/)
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="map-caption">
                    {company.city?.toUpperCase()} <i>·</i>{" "}
                    {globalSection.mapCaption || company.country?.toUpperCase()}
                  </div>
                </div>
                {globalSection.floatingNote && (
                  <div className="global-floating-tag">
                    <span>✦</span> {globalSection.floatingNote}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        {reviewSection?.visible !== false && clientReviews.length > 0 && (
          <section className="reviews-section" aria-labelledby="reviewsTitle">
            <div className="max-w-7xl mx-auto px-5 py-20 md:py-28">
              <div className="reviews-intro">
                {reviewSection.eyebrow && (
                  <p className="section-kicker">{reviewSection.eyebrow}</p>
                )}
                <h2 id="reviewsTitle" className="display-heading">
                  {reviewSection.title}
                </h2>
                <p>{reviewSection.description}</p>
              </div>
              <div className="review-orbit">
                <div className="orbit-ring" />
                <div className="review-bubbles">
                  {clientReviews.map((review, i) => (
                    <button
                      key={review.image}
                      type="button"
                      className={`review-bubble review-bubble-${i + 1} ${activeReview === i ? "is-current" : ""}`}
                      onClick={() => setReviewActive(i)}
                      aria-label={`Show review ${i + 1}: ${review.name}`}
                    >
                      <img src={imageUrl(review.image)} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
                <article className="review-card" aria-live="polite">
                  <div
                    className="review-stars"
                    aria-label={`${clientReviews[activeReview].rating || 5} out of 5 stars`}
                  >
                    {"★".repeat(clientReviews[activeReview].rating || 5)}
                  </div>
                  <blockquote>{clientReviews[activeReview].quote}</blockquote>
                  <div className="review-person">
                    <img
                      className="review-main-avatar"
                      src={imageUrl(clientReviews[activeReview].image)}
                      alt=""
                      loading="lazy"
                    />
                    <div>
                      <strong>{clientReviews[activeReview].name}</strong>
                      {clientReviews[activeReview].location && (
                        <small>{clientReviews[activeReview].location}</small>
                      )}
                    </div>
                  </div>
                  <div className="review-progress">
                    <span
                      style={{
                        width: `${((activeReview + 1) / clientReviews.length) * 100}%`,
                      }}
                    />
                  </div>
                </article>
                <button
                  className="review-arrow review-prev"
                  type="button"
                  onClick={() =>
                    setReviewActive(
                      (reviewActive + clientReviews.length - 1) %
                        clientReviews.length,
                    )
                  }
                  aria-label="Previous review"
                >
                  ←
                </button>
                <button
                  className="review-arrow review-next"
                  type="button"
                  onClick={() =>
                    setReviewActive((reviewActive + 1) % clientReviews.length)
                  }
                  aria-label="Next review"
                >
                  →
                </button>
              </div>
              {reviewSection.footerNote && (
                <p className="review-edit-note">{reviewSection.footerNote}</p>
              )}
            </div>
          </section>
        )}
        {cta}
      </>
    );
  return (
    <>
      <Header
        content={headerContent}
        company={company}
        navigation={navigation}
        onEnquire={openEnquiry}
      />
      {content}
      <Footer
        content={footerContent}
        company={company}
        whatsappUrl={whatsappUrl}
      />
      {enquiry && (
        <EnquiryModal
          topic={enquiry.topic}
          categories={catalog.categories}
          content={enquiryFormContent}
          companyName={company.name}
          onClose={() => setEnquiry(null)}
        />
      )}
    </>
  );
}
