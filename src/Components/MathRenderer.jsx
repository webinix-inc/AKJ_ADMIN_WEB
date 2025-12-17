import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { getOptimizedQuizImage } from '../utils/imageUtils';

/**
 * 🔧 MathRenderer Component
 * Renders LaTeX mathematical expressions using KaTeX
 * Supports both inline and display modes
 */

const MathPart = ({ latex, display = false }) => {
  try {
    const html = katex.renderToString(latex, { 
      throwOnError: false, 
      displayMode: display,
      strict: false,
      trust: true
    });
    
    return (
      <span
        className={display ? "math-display" : "math-inline"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    console.error('KaTeX rendering error:', error);
    // Fallback to plain text with styling
    return (
      <span 
        className="math-fallback"
        style={{ 
          fontFamily: 'Times New Roman, serif',
          fontStyle: 'italic',
          color: '#e74c3c'
        }}
      >
        {latex}
      </span>
    );
  }
};

/**
 * Renders question parts with mixed text and math content
 */
const QuestionPartsRenderer = ({ parts, className = "" }) => {
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    return <span className="text-gray-500 italic">No content available</span>;
  }

  return (
    <div className={`question-content ${className}`}>
      {parts.map((part, index) => {
        if (part.kind === 'math') {
          // Determine if it's display math (contains newlines or is long)
          const isDisplay = part.content.includes('\n') || part.content.length > 50;
          return (
            <MathPart 
              key={index} 
              latex={part.content} 
              display={isDisplay}
            />
          );
        } else if (part.kind === 'text') {
          return (
            <span key={index} className="text-content">
              {part.content}
            </span>
          );
        }
        return null;
      })}
    </div>
  );
};

/**
 * Fallback renderer for legacy questions without parts
 */
const LegacyQuestionRenderer = ({ questionText, tables, className = "" }) => {
  // Use the same logic as before for backward compatibility
  let content = "";
  
  if (tables && tables.length > 0 && tables[0]) {
    const tableContent = tables[0];
    if (tableContent.length < 50 && !tableContent.includes('<') && questionText) {
      content = questionText;
    } else {
      content = tableContent;
    }
  } else {
    content = questionText || "Question content not available";
  }

  // Process HTML content with enhanced mathematical expression support
  const processedContent = content
    .replace(
      /<table/g,
      '<table class="table-auto border-collapse border w-1/2 text-left text-white"'
    )
    .replace(
      /<th/g,
      '<th class="border border-gray-700 px-4 py-2"'
    )
    .replace(
      /<td/g,
      '<td class="border border-gray-700 px-4 py-2"'
    )
    .replace(/<tr/g, '<tr class=""')
    .replace(
      /<img([^>]*?)src="([^"]*?)"([^>]*?)>/g,
      '<img$1src="$2"$3 crossorigin="anonymous" style="max-width: 100%; height: auto; border-radius: 4px;" onerror="console.log(\'Admin image failed to load:\', this.src);">'
    )
    .replace(/\n/g, '<br/>')
    .replace(/\b(\d+x²|\dx²|x²)\b/g, '<span style="font-family: \'Times New Roman\', serif; color: #fff;">$1</span>')
    .replace(/\b(√\w+|∫\w+|∑\w+)\b/g, '<span style="font-family: \'Times New Roman\', serif; font-size: 1.1em; color: #fff;">$1</span>');

  return (
    <div 
      className={`legacy-question-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

/**
 * Renders question images (for math equations stored as images)
 */
const QuestionImageRenderer = ({ questionImage, className = "" }) => {
  if (!questionImage || !Array.isArray(questionImage) || questionImage.length === 0) {
    return null;
  }

  return (
    <div className={`question-images ${className}`}>
      {questionImage.map((imageUrl, index) => {
        if (!imageUrl) return null;
        
        // Check if it's a presigned URL
        const isPresignedUrl = imageUrl && (
          imageUrl.includes('X-Amz-Signature') || 
          imageUrl.includes('X-Amz-Algorithm') ||
          imageUrl.includes('?X-Amz-')
        );
        
        // Use optimized image URL if not presigned
        const finalUrl = isPresignedUrl ? imageUrl : (getOptimizedQuizImage(imageUrl) || imageUrl);
        
        return (
          <div key={index} className="mb-2 mt-2">
            <img
              src={finalUrl}
              alt={`Math equation ${index + 1}`}
              className="max-w-full h-auto rounded-md shadow-md border border-gray-700"
              style={{ maxHeight: '300px', display: 'block' }}
              crossOrigin="anonymous"
              onError={(e) => { 
                console.error('❌ Question math image failed to load:', imageUrl);
                e.target.style.display = 'none'; 
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Main component that automatically chooses between parts or legacy rendering
 */
const QuestionRenderer = ({ question, className = "" }) => {
  const hasParts = question.parts && Array.isArray(question.parts) && question.parts.length > 0;
  const hasImages = question.questionImage && Array.isArray(question.questionImage) && question.questionImage.length > 0;
  
  return (
    <div className={`question-renderer ${className}`}>
      {/* Render math expressions from parts array */}
      {hasParts && (
        <QuestionPartsRenderer parts={question.parts} className={className} />
      )}
      
      {/* Render images (math equations stored as images) */}
      {hasImages && (
        <QuestionImageRenderer questionImage={question.questionImage} className={className} />
      )}
      
      {/* If no parts or images, fallback to legacy rendering */}
      {!hasParts && !hasImages && (
        <LegacyQuestionRenderer 
          questionText={question.questionText}
          tables={question.tables}
          className={className}
        />
      )}
    </div>
  );
};

export default QuestionRenderer;
export { MathPart, QuestionPartsRenderer, LegacyQuestionRenderer };
