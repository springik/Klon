import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

export default {
    mounted(el) {
        const content = el.innerHTML;

        const transformedContent = content.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = codeContent;
            hljs.highlightElement(code);
            pre.appendChild(code);
            return pre.outerHTML;
        })

        el.innerHTML = transformedContent;
        /*
        const codeBlocks = el.innerHTML.match(/```([\s\S]*?)```/g);
        if(codeBlocks) {
            el.innerHTML = ''
            codeBlocks.forEach((codeBlock) => {
                const codeContent = codeBlock.replace(/```/g, '')
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = codeContent;
                hljs.highlightElement(code);
                pre.appendChild(code);
                el.appendChild(pre);
            })
        }*/
        /*
        const codeBlocks = el.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            hljs.highlightElement(codeBlock);
        });
        */
    },
    updated(el) {
        const content = el.innerHTML;

        const transformedContent = content.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = codeContent;
            hljs.highlightElement(code);
            pre.appendChild(code);
            return pre.outerHTML;
        })

        el.innerHTML = transformedContent;
        /*
        const codeBlocks = el.innerHTML.match(/```([\s\S]*?)```/g);
        if(codeBlocks) {
            el.innerHTML = ''
            codeBlocks.forEach((codeBlock) => {
                const codeContent = codeBlock.replace(/```/g, '')
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = codeContent;
                hljs.highlightElement(code);
                pre.appendChild(code);
                el.appendChild(pre);
            })
        }*/
        /*
        const codeBlocks = el.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            hljs.highlightElement(codeBlock);
        });
        */
    }
}