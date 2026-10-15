# 脑袋加一：英文阅读内容包

Downloaded 2026-10-09. Six sourced readings; four original English books/translations. Main integration file: `readings.json`. Six matching `.txt` files contain the exact selected prose, with line wrapping normalized and plain-text underscore emphasis markers removed. Complete source downloads are retained separately for verification.

## Source and rights evidence

- Lewis Carroll, *Alice’s Adventures in Wonderland* (1865), Chapter I. Author lived 1832–1898. https://www.gutenberg.org/ebooks/11
- L. Frank Baum, *The Wonderful Wizard of Oz* (1900), Chapter IV. Author lived 1856–1919. https://www.gutenberg.org/ebooks/55
- Frances Hodgson Burnett, *The Secret Garden* (1911), Chapter IX. Author lived 1849–1924. https://www.gutenberg.org/ebooks/113
- Aesop, *Three Hundred Aesop’s Fables*, English translation by George Fyler Townsend (1814–1900). Three complete fables; no modern retelling copied. https://www.gutenberg.org/ebooks/21

Each catalog identifies the text as “Public domain in the USA.” Catalog HTML is archived under `provenance/`; source downloads retain their original headers and license. `provenance/downloads.json` records exact download URLs, file sizes and SHA-256 digests. The source-download URL redirects to the provider's current plain-text edition, so catalog metadata timestamps may not exactly match the file header.

Rights guidance: https://www.gutenberg.org/policy/license.html (archived as `provenance/license.html`). Its public-domain-text and trademark sections distinguish the unrestricted underlying text from the provider's trademark/license wrapper. The excerpts omit that wrapper and provider branding. Keep source links in a separate credits/reference area, not as provider branding for a new edition or product. Do not imply endorsement. The authors/translators died more than 100 years ago; nonetheless, the provider explicitly makes no copyright-status representation outside the USA. Check the applicable jurisdiction before commercial or worldwide distribution. This package does not claim a worldwide license.

## Editorial additions

Chinese titles, short summaries, vocabulary explanations, comprehension questions, answer explanations and sentence analyses were newly prepared for this learning app. They are not scraped translations or a copied publisher's teaching materials. CEFR B1/B2 labels are editorial estimates rather than formal assessment. Preserve the label “original text / 原著原文” and avoid describing these passages as simplified or contemporary English. The fables retain older vocabulary and syntax, intentionally explained in the vocabulary notes.

## JSON schema

Each reading includes id, title, titleZh, book, author, sourceUrl, downloadUrl, license, paragraphs, text, vocabulary (word, meaning, meaningZh, noteZh), questions (prompt, options, zero-based answer, Chinese explanation), sentenceAnalysis (sentence, translation, analysis), source chapter, estimated level, wordCount, readingMinutes, contentType and editorialNote. All six analyzed sentences were checked for exact presence in the selected text. All 12 answer indexes were validated. Reading time assumes roughly 120 English words per minute and is only a UI estimate.
