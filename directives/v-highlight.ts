import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

export default {
    mounted(el) {
        const codeBlocks = el.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            hljs.highlightElement(codeBlock);
        });
    },
    updated(el) {
        const codeBlocks = el.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            hljs.highlightElement(codeBlock);
        });
    }
}