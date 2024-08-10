// assets/js/syntax-highlight.js
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

document.addEventListener('DOMContentLoaded', function() {
  var codeBlocks = document.querySelectorAll('details > pre > code');
  codeBlocks.forEach(function(codeBlock) {
    var theme = getCurrentTheme();
    var highlightTheme = theme === 'dark' ? 'hljs-dark' : 'hljs';
    hljs.configure({ classPrefix: '' }); // Don't prefix CSS classes
    hljs.highlightElement(codeBlock);
    
    // Assuming you want to add both the highlight theme and language class
    codeBlock.classList.add(highlightTheme, 'python');
  });
});