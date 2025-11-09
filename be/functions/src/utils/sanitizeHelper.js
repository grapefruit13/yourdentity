const sanitizeHtml = require("sanitize-html");

/**
 * HTML content sanitize (XSS 방지)
 * @param {string} dirty - 정화 전 HTML
 * @return {string} 정화된 HTML
 */
function sanitizeContent(dirty) {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p",
      "b",
      "i",
      "u",
      "strong",
      "em",
      "blockquote",
      "br",
      "ul",
      "ol",
      "li",
      "span",
      "img",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "div",
    ],
    allowedAttributes: {
      "*": ["style", "class", "data-heading"],
      img: [
        "src",
        "width",
        "height",
        "alt",
        "data-blurhash",
        "data-mimetype",
        "data-client-id",
      ],
      a: ["href", "target", "data-file-id"],
    },
    allowedStyles: {
      "*": {
        color: [/^.*$/],
        "background-color": [/^.*$/],
        "text-align": [/^left|right|center|justify$/],
        "font-size": [/^\d+(px|em|rem|%)$/],
      },
    },
    allowedSchemes: ["http", "https", "data"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          attribs.rel = "noopener noreferrer";
        }
        return {
          tagName: tagName,
          attribs: attribs,
        };
      },
    },
  });
}

module.exports = {
  sanitizeContent,
};
