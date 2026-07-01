import React from "react";

const PLAY_STORE_BASE_URL = "https://go.fillorin.com/studyjapanese";

const playStoreUrl = (src) => `${PLAY_STORE_BASE_URL}?src=${src}`;

// Always-on sticky top bar, visible on every screen size
export const AppPromoHeader = () => (
    <a
        href={playStoreUrl("dictionary_header")}
        target="_blank"
        rel="noopener noreferrer"
        className="app-promo-topbar"
        aria-label="Get Study Japanese on Google Play"
    >
        <img
            src="/promo/studyjapanese-icon.svg"
            alt="Study Japanese app icon"
            className="app-promo-topbar-icon"
        />
        <div className="app-promo-topbar-text">
            <strong>Study Japanese</strong>
            <span>Kanji, kana &amp; vocabulary SRS training</span>
        </div>
        <img
            src="/promo/google-play-badge.png"
            alt="Get it on Google Play"
            className="app-promo-topbar-badge"
        />
    </a>
);

// Fixed skyscraper-style vertical banner pinned to a viewport edge, stays put while the page scrolls
export const AppPromoSideBanner = ({ side }) => (
    <a
        href={playStoreUrl(`dictionary_sidebar_${side}`)}
        target="_blank"
        rel="noopener noreferrer"
        className={`app-promo-side app-promo-side-${side}`}
        aria-label="Get Study Japanese on Google Play"
    >
        <img
            src="/promo/studyjapanese-icon.svg"
            alt="Study Japanese app icon"
            className="app-promo-side-icon"
        />
        <strong className="app-promo-side-title">Study Japanese</strong>
        <span className="app-promo-side-tagline">Kanji, kana &amp; vocabulary SRS training</span>
        <span className="app-promo-side-vertical-text">日本語を学ぼう</span>
        <img
            src="/promo/google-play-badge.png"
            alt="Get it on Google Play"
            className="app-promo-side-badge"
        />
    </a>
);
