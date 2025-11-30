
import React from 'react';
import { useEffect, useRef } from 'react';
import TableComponent from './TableComponent';
import ChartComponent from './ChartComponent';
import FigureComponent from './FigureComponent';
import InlineContent from './InlineContent';

// This is the main component that structures the lesson content into blocks.
const LessonContent: React.FC<{ content: string }> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // This useEffect hook is responsible for running the MathJax rendering logic.
  useEffect(() => {
    const renderMath = () => {
      if (contentRef.current && typeof (window as any).MathJax?.typesetPromise === 'function') {
        (window as any).MathJax.typesetPromise([contentRef.current]).catch((err: any) => console.error('MathJax typeset error:', err));
      }
    };
    
    // Use a timeout to slightly debounce MathJax rendering after content updates.
    const timer = setTimeout(renderMath, 100);

    return () => clearTimeout(timer);
  }, [content]);

  // This function parses the entire raw string from the AI into structured React components.
  const renderContentBlocks = () => {
    if (!content) return null;

    // This helper function cleans and parses a JSON string that might have common LLM errors.
    const cleanAndParseJson = (rawJson: string, context: string) => {
      try {
        let jsonString = rawJson.trim();
        
        // Remove markdown code blocks if the AI added them (e.g. ```json ... ```)
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

        // This handles trailing commas which are invalid in JSON but common in LLM output.
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');
        
        // NOTE: We do NOT globally replace backslashes (replace(/\\/g, '\\\\')) anymore.
        // That broke valid JSON escapes like \" (escaped quote) by turning them into \\" (literal backslash then quote),
        // which caused syntax errors when the string contained quotes.
        
        return JSON.parse(jsonString);
      } catch (error) {
        console.error(`Failed to parse ${context} JSON:`, error, "Original string:", rawJson);
        return null;
      }
    };

    // The tokenizer regex. It finds any valid tag, captures the tag name (group 1)
    // and the content (group 2). The backreference \1 ensures closing tag matches opening tag.
    // 'g' for global search. '[\s\S]' matches any character including newlines.
    const tagTokenizerRegex = /\[(TABLE_DATA|CHART_DATA|SEARCH_PROMPT)\]([\s\S]*?)\[\/\1\]/g;

    return content.split(/\n\s*\n/).filter(Boolean).map((block, index) => {
      const trimmedBlock = block.trim();
      
      // --- Fast path for simple blocks without any special tags ---
      if (!/\[(TABLE_DATA|CHART_DATA|SEARCH_PROMPT)\]/.test(trimmedBlock)) {
        if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**')) {
          return (
            <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-blue-600 dark:text-blue-400 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
              <InlineContent text={trimmedBlock.slice(2, -2)} />
            </h2>
          );
        }
        if (trimmedBlock.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
              <InlineContent text={trimmedBlock.substring(4)} />
            </h3>
          );
        }
        const lines = trimmedBlock.split('\n');
        if (lines.every(line => line.trim().startsWith('* '))) {
          return (
            <ul key={index} className="list-disc pl-8 space-y-2 my-4">
              {lines.map((item, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">
                  <InlineContent text={item.trim().substring(2)} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="my-4 text-gray-800 dark:text-gray-200 whitespace-pre-line">
            <InlineContent text={trimmedBlock} />
          </p>
        );
      }

      // --- Robust tokenizer for complex blocks with one or more tags ---
      const tokens = [];
      let lastIndex = 0;
      let match;

      while ((match = tagTokenizerRegex.exec(trimmedBlock)) !== null) {
        // Push the plain text found before the current tag match
        if (match.index > lastIndex) {
          tokens.push({ type: 'text', content: trimmedBlock.slice(lastIndex, match.index) });
        }
        
        // Push the component tag itself
        tokens.push({ type: match[1], content: match[2] }); // match[1] is tag name, match[2] is content
        
        lastIndex = tagTokenizerRegex.lastIndex;
      }

      // Push any remaining plain text after the last tag
      if (lastIndex < trimmedBlock.length) {
        tokens.push({ type: 'text', content: trimmedBlock.slice(lastIndex) });
      }

      // Render the sequence of tokens
      return (
        <div key={index} className="my-4 text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {tokens.map((token, tokenIndex) => {
            const key = `token-${index}-${tokenIndex}`;
            switch (token.type) {
                case 'TABLE_DATA':
                    const tableData = cleanAndParseJson(token.content, 'table');
                    if (tableData) return <TableComponent key={key} data={tableData} />;
                    return <p key={key} className="my-4 text-red-500">Error al mostrar la tabla.</p>;
                case 'CHART_DATA':
                    const chartData = cleanAndParseJson(token.content, 'chart');
                    if (chartData) return <ChartComponent key={key} data={chartData} />;
                    return <p key={key} className="my-4 text-red-500">Error al mostrar el gráfico.</p>;
                case 'SEARCH_PROMPT':
                    const searchRequest = cleanAndParseJson(token.content, 'search prompt');
                    if (searchRequest && searchRequest.query) {
                        return <FigureComponent key={key} description={searchRequest.query} />;
                    }
                    return <p key={key} className="my-4 text-red-500">Error al procesar la sugerencia de búsqueda.</p>;
                case 'text':
                    // Render the text part, which might be a prefix like "A." or some other text between components.
                    return <InlineContent key={key} text={token.content} />;
                default:
                    return null;
            }
          })}
        </div>
      );
    });
  };

  return (
    <div ref={contentRef} className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
      {renderContentBlocks()}
    </div>
  );
};

export default LessonContent;
