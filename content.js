let currentIndex = -1;
const searchResults = [];

function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-highlight {
      outline: 2px solid #4285f4 !important;
      box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.3) !important;
      background-color: rgba(66, 133, 244, 0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

function removeUnwantedSections() {
  const sectionsToRemove = [
    // Images section
    '#imagebox_bigimages',
    // Videos section
    '#videobox',
    // People also ask section (including the header)
    'div.related-question-pair',
    'g-accordion-expander',
    // People also search for section
    'div[jscontroller="HYSCof"]',
    // Any other sections with headers (like "Top stories", etc.)
    'g-section-with-header'
  ];

  sectionsToRemove.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      const parentG = el.closest('.g');
      if (parentG) {
        parentG.remove();
      } else {
        el.remove();
      }
    });
  });

  // Remove any remaining "People also ask" text
  document.querySelectorAll('div').forEach(el => {
    if (el.textContent.trim() === 'People also ask') {
      el.remove();
    }
  });
}

function initializeSearchResults() {
  removeUnwantedSections();
  searchResults.length = 0;
  document.querySelectorAll('.g:not(.g-blk)').forEach((result) => {
    // Only add if it's a main search result (has a cite element)
    if (result.querySelector('cite')) {
      searchResults.push(result);
    }
  });
  console.log(`Found ${searchResults.length} valid search results`);
}

function highlightResult(index) {
  console.log(`Highlighting result at index ${index}`);
  if (currentIndex >= 0 && currentIndex < searchResults.length) {
    searchResults[currentIndex].classList.remove('keyboard-highlight');
  }
  if (index >= 0 && index < searchResults.length) {
    searchResults[index].classList.add('keyboard-highlight');
    searchResults[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  currentIndex = index;
}

function handleKeyPress(e) {
  console.log(`Key pressed: ${e.key}`);
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }

  switch (e.key) {
    case 'j':
      highlightResult(Math.min(currentIndex + 1, searchResults.length - 1));
      break;
    case 'k':
      highlightResult(Math.max(currentIndex - 1, 0));
      break;
    case 'o':
      if (currentIndex >= 0 && currentIndex < searchResults.length) {
        const link = searchResults[currentIndex].querySelector('a');
        if (link) {
          window.location.href = link.href;
        }
      }
      break;
  }
}

function init() {
  console.log("Extension initialized");
  injectCSS();
  initializeSearchResults();
  document.addEventListener('keydown', handleKeyPress);
}

// Run the init function when the page loads and when the URL changes
init();
window.addEventListener('popstate', init);

// Re-initialize results when new results are loaded dynamically
const observer = new MutationObserver(() => {
  removeUnwantedSections();
  initializeSearchResults();
});
observer.observe(document.body, { childList: true, subtree: true });
