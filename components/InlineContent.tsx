import React from 'react';

// This is a robust inline content renderer. It uses a tokenizer approach instead of splitting strings,
// which prevents formatting conflicts (e.g., bold markdown inside a math expression).
const InlineContent: React.FC<{ text: string }> = ({ text }) => {
  const tokens: { type: 'math' | 'bold' | 'text'; content: string }[] = [];
  const regex = /(\$\$[^\$]+\$\$|\$[^\$]+\$|\*\*.*?\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add any plain text that came before this match
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    const matchedText = match[0];
    if (matchedText.startsWith('$')) {
      tokens.push({ type: 'math', content: matchedText });
    } else if (matchedText.startsWith('**')) {
      // It's a bold token; remove the asterisks for rendering.
      tokens.push({ type: 'bold', content: matchedText.slice(2, -2) });
    }
    lastIndex = regex.lastIndex;
  }

  // Add any remaining plain text after the last match
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // Render the tokens into React elements
  return (
    <>
      {tokens.map((token, index) => {
        switch (token.type) {
          case 'math':
            // MathJax will find and render this based on the surrounding '$' or '$$'
            return <span key={index}>{token.content}</span>;
          case 'bold':
            return <strong key={index}>{token.content}</strong>;
          case 'text':
          default:
            return token.content;
        }
      })}
    </>
  );
};

export default InlineContent;
