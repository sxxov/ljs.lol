/* eslint-disable import/no-extraneous-dependencies */
import { createFilter } from 'rollup-pluginutils';
import path from 'path';
import marked from 'marked';
const STYLE = `
mdx {
	display: block;
	height: 100%;
	width: calc(100vw - 17px);
	padding: var(--padding);
	box-sizing: border-box;
}

mdx > *,
mdx > blockquote {
	padding-right: calc(var(--headerPadding) * 3);
}

mdx h1,
mdx h2 {
    border-bottom: 0px solid grey;
}

mdx h1::after,
mdx h2::after {
	content: "";
	display: block;
	
	padding-bottom: 16px;
    border-bottom: 1px solid #eaecef;
}

mdx h1,
mdx h2,
mdx h3,
mdx h4,
mdx h5,
mdx h6 {
	font-family: 'Space Mono', sans-serif, Apple Color Emoji, Segoe UI Emoji;
	font-weight: 800;
	letter-spacing: var(--titleLetterSpacing);
}

mdx h1 {
	font-size: var(--titleFontSize);
	line-height: var(--titleLineHeight);

	margin-bottom: 36px;
}

mdx p {
	font-family: 'Dank Mono', sans-serif, Apple Color Emoji, Segoe UI Emoji;
	font-style: italic;
	font-size: var(--descriptionFontSize);
	text-align: justify;
}

mdx li {
	font-family: 'Dank Mono', sans-serif, Apple Color Emoji, Segoe UI Emoji;
	font-style: italic;
	text-align: justify;
	font-size: var(--descriptionFontSize);

    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}

mdx li > p, * > li > ul * {
	font-size: unset !important;
}

mdx ol, 
mdx ul {
	padding-left: 1em;
}

mdx a {
	color: grey;

	display: block;

	transform: matrix(1, 0, 0, 1, 0, 0);
}

mdx a:hover {
	text-decoration: none;
}

mdx a::before {
	content: "← ";
}

mdx a::after {
	background: none repeat scroll 0 0 transparent;
	left: 0;
	bottom: -9px;
	content: "";
	display: block;
	height: 1px;
	position: absolute;
	background: grey;
	transition: width 0.3s var(--easeSlowSlow);
	width: 0;
}

mdx a:hover::after {
	width: 100%;
}

mdx x {
	display: inline-flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	/* min-height: 100%; */
}

/* firefox doesn't correctly set height %'s with columns */
@-moz-document url-prefix() {
	mdx x {
	  	height: calc(100vh - 48px - 48px - 48px - var(--headerPadding) * 3);
	}
}

/* mdx x.h-fixed {
	height: 100%;
} */

mdx x.hs-left * {
	align-self: flex-start;
	text-align: left;
}

mdx x.hs-centre * {
	align-self: center;
	text-align: center;
}

mdx x.hs-right * {
	align-self: flex-end;
	text-align: end;
}

mdx x > * {
	/* height: calc(100% - 16px); */
	width: max-content;
	max-width: 100%;
	max-height: calc(100% - 16px);
}

mdx x.long {
	display: inline-block;
}

mdx x.long p {
	height: unset;
}

/* firefox treats 100% as the absolute container size even with display: inline-flex, 
	instead of scaling them down like chrome,
	but, it doesn't have the image-slicing & disappearing bugs in chrome,
	so we can just make it so that it's in the correct position */
@-moz-document url-prefix() {
	mdx x > * {
		height: unset;

		margin-bottom: 0;
		padding-bottom: 16px;
	}
}

mdx img {
	max-height: 100%;

	object-fit: cover;
}

@media only screen and (max-width: 1024px), (max-height: 544px) {
	mdx img {
		padding-top: 48px;
		padding-bottom: 48px;

		max-height: 540px;

		box-sizing: border-box;
		
		background-color: transparent;
	}
}

mdx iframe {
	padding-bottom: 24px;
}

@media only screen and (max-width: 1024px), (max-height: 544px) {
	mdx x.hs-left *,
	mdx x.hs-centre *,
	mdx x.hs-right * {
		align-self: unset;
		text-align: unset;
	}

	mdx x.vs-left * {
		align-self: flex-start;
		text-align: left;
	}
	
	mdx x.vs-centre * {
		align-self: center;
		text-align: center;
	}
	
	mdx x.vs-right * {
		align-self: flex-end;
		text-align: end;
	}

	mdx x.vs-grid {
		width: fit-content;
		max-width: 100%;
	}
}

@media only screen and (max-width: 1024px), (max-height: 544px) {
	mdx bruh {
		height: 96px;
		display: block;
	}
}
`;
class MDX {
    static preprocess(md) {
        let processedMd = md;
        Object.keys(MDX.PREPROCESSORS).forEach((key) => {
            const preprocessor = MDX.PREPROCESSORS[key];
            processedMd = preprocessor(processedMd);
        });
        return processedMd;
    }
    static plugin(options = {}) {
        const filter = createFilter(options.include, options.exclude);
        return {
            name: 'rollup-plugin-markdown',
            transform(code, id) {
                if (!filter(id)) {
                    return null;
                }
                const extension = path.extname(id);
                if (extension !== '.mdx') {
                    return null;
                }
                const html = marked(MDX.preprocess(code));
                // const exportFromModule = JSON.stringify({
                // 	html,
                // 	filename: path.basename(id),
                // 	path: id,
                // });
                return {
                    code: `export default \`<mdx>${html.replace(/h1/g, 'heading')}</mdx><style>${STYLE.replace(/[\n\t]/g, '')}</style>\``,
                    map: { mappings: '' },
                };
            },
        };
    }
}
MDX.PREPROCESSORS = {
    x(md) {
        const parts = md
            .trim()
            .split('\n');
        const processedParts = parts.filter((part) => {
            if (part[0] !== '/') {
                return false;
            }
            return true;
        });
        const tag = 'x';
        if (processedParts.length === 1) {
            return md;
        }
        let parsed = '';
        parts.forEach((part, i) => {
            let processedTag = tag;
            let processedPart = part;
            if (processedPart[0] === '!'
                && processedPart[1] === '/') {
                parsed += `\n</${tag}>`;
                parsed += '\n';
                return;
            }
            if (processedPart[0] !== '/') {
                parsed += part;
                parsed += '\n';
                return;
            }
            if (processedPart[1] === '{') {
                const classes = processedPart
                    .split('}')[0]
                    .substr(2);
                processedTag += ` class="${classes}"`;
                processedPart = processedPart.substr(processedPart.indexOf('}') + 1);
            }
            switch (true) {
                case parsed === '': {
                    parsed += `<${processedTag}>\n`;
                    break;
                }
                case i === parts.length - 1: {
                    parsed += `\n</${tag}>`;
                    break;
                }
                default: {
                    parsed += `\n</${tag}>\n<${processedTag}>\n`;
                    break;
                }
            }
            parsed += '\n';
        });
        return parsed;
    },
    br(md) {
        const parts = md
            .trim()
            .split('\n');
        const processedParts = parts.filter((part) => {
            if (part[0] !== '_') {
                return false;
            }
            return true;
        });
        const tag = 'bruh';
        if (processedParts.length === 1) {
            return md;
        }
        let parsed = '';
        parts.forEach((part) => {
            const processedTag = tag;
            const processedPart = part;
            if (processedPart[0] !== '_') {
                parsed += part;
                parsed += '\n';
                return;
            }
            parsed += `<${processedTag}></${tag}>`;
            parsed += '\n';
        });
        return parsed;
    },
};
export default MDX.plugin;
//# sourceMappingURL=rollup-plugin-mdx.js.map