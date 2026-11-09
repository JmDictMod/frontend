import React from "react";

// Both go through go.fillorin.com, which counts the click and redirects.
const PLAY_STORE_BASE_URL = "https://go.fillorin.com/studyjapanese";
const APP_STORE_BASE_URL = "https://go.fillorin.com/learnjapanese-ios";
const PRODUCT_URL = "https://learnjapanese.fillorin.com";

const playStoreUrl = (src) => `${PLAY_STORE_BASE_URL}?src=${src}`;
const appStoreUrl = (src) => `${APP_STORE_BASE_URL}?src=${src}`;

// Both stores, each its own link: a single link around the whole promo could
// only ever lead to one of them.
const StoreBadges = ({ src, className }) => (
    <div className={className}>
        <a
            href={appStoreUrl(src)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Learn Japanese on the App Store"
            className="app-promo-store"
        >
            <img
                src="/promo/app-store-badge.svg"
                alt="Download on the App Store"
                className="app-promo-badge-apple"
            />
        </a>
        <a
            href={playStoreUrl(src)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get Learn Japanese on Google Play"
            className="app-promo-store"
        >
            <img
                src="/promo/google-play-badge.png"
                alt="Get it on Google Play"
                className="app-promo-badge-play"
            />
        </a>
    </div>
);

// Always-on sticky top bar, visible on every screen size
export const AppPromoHeader = () => (
    <div className="app-promo-topbar">
        <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-promo-topbar-info"
            aria-label="Learn Japanese: kanji, kana and vocabulary SRS training"
        >
            <img
                src="/promo/studyjapanese-icon.svg"
                alt="Learn Japanese app icon"
                className="app-promo-topbar-icon"
            />
            <div className="app-promo-topbar-text">
                <strong>Learn Japanese</strong>
                <span>Kanji, kana &amp; vocabulary SRS training</span>
            </div>
        </a>
        <StoreBadges src="dictionary_header" className="app-promo-topbar-badges" />
    </div>
);

// Fixed skyscraper-style vertical banner pinned to a viewport edge, stays put while the page scrolls
export const AppPromoSideBanner = ({ side }) => (
    <div className={`app-promo-side app-promo-side-${side}`}>
        <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="app-promo-side-info"
            aria-label="Learn Japanese: kanji, kana and vocabulary SRS training"
        >
            <img
                src="/promo/studyjapanese-icon.svg"
                alt="Learn Japanese app icon"
                className="app-promo-side-icon"
            />
            <strong className="app-promo-side-title">Learn Japanese</strong>
            <span className="app-promo-side-tagline">Kanji, kana &amp; vocabulary SRS training</span>
            <span className="app-promo-side-vertical-text">日本語を学ぼう</span>
        </a>
        <StoreBadges src={`dictionary_sidebar_${side}`} className="app-promo-side-badges" />
    </div>
);
