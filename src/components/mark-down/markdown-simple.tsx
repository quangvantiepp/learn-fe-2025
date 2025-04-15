import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Image } from "lucide-react";

// Plugin system để dễ dàng mở rộng
const plugins = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeRaw],
};

// Emotion Styled Components
const MarkdownContainer = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const Heading1 = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 4.8px;
  border-bottom: 1px solid #eaecef;
`;

const Heading2 = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 12px;
  padding-bottom: 4.8px;
  border-bottom: 1px solid #eaecef;
`;

const Heading3 = styled.h3`
  font-size: 20px;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 16px 0;
`;

const Table = styled.table`
  min-width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
`;

const TableHead = styled.thead`
  background-color: #f6f8fa;
`;

const TableBody = styled.tbody`
  background-color: #fff;

  tr:nth-of-type(2n) {
    background-color: #f6f8fa;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f0f4f8;
  }
`;

const TableHeader = styled.th`
  padding: 8px 16px;
  border: 1px solid #dfe2e5;
  text-align: left;
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 8px 16px;
  border: 1px solid #dfe2e5;
`;

const BlockQuote = styled.blockquote`
  border-left: 4px solid #dfe2e5;
  padding-left: 16px;
  color: #6a737d;
  font-style: italic;
  margin: 16px 0;
`;

const Link = styled.a`
  color: #0366d6;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ImageContainer = styled.div`
  margin: 16px 0;
`;

const ImageWrapper = styled.div`
  position: relative;
`;

const StyledImage = styled.img`
  max-width: 100%;
  border-radius: 4px;
`;

const ImagePlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f6f8fa;
  border-radius: 4px;
  padding: 24px;
`;

const ImageCaption = styled.p`
  font-size: 14px;
  color: #6a737d;
  margin-top: 4px;
`;

const UnorderedList = styled.ul`
  list-style-type: disc;
  padding-left: 24px;
  margin: 16px 0;
`;

const OrderedList = styled.ol`
  list-style-type: decimal;
  padding-left: 24px;
  margin: 16px 0;
`;

const Paragraph = styled.p`
  margin: 12px 0;
`;

const CodeBlock = styled.div`
  margin: 16px 0;
`;

const Pre = styled.pre`
  background-color: #f6f8fa;
  border-radius: 4px;
  padding: 16px;
  overflow: auto;
`;

const InlineCode = styled.code`
  background-color: #f6f8fa;
  padding: 3.2px 6.4px;
  border-radius: 3px;
  font-size: 14px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
`;

const CodeBlockCode = styled.code`
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
`;

const CodeLanguage = styled.p`
  font-size: 12px;
  color: #6a737d;
  margin-top: 4px;
`;

const SmallText = styled.small`
  color: #6a737d;
  font-size: 14px;
`;

const EmptyContent = styled.div`
  color: #6a737d;
  padding: 16px;
`;

// Custom renderers để xử lý từng loại nội dung
const renderers = {
  // Xử lý tiêu đề
  h1: ({ node, ...props }) => <Heading1 {...props} />,
  h2: ({ node, ...props }) => <Heading2 {...props} />,
  h3: ({ node, ...props }) => <Heading3 {...props} />,

  // Xử lý bảng
  table: ({ node, ...props }) => (
    <TableContainer>
      <Table {...props} />
    </TableContainer>
  ),
  thead: ({ node, ...props }) => <TableHead {...props} />,
  tbody: ({ node, ...props }) => <TableBody {...props} />,
  tr: ({ node, ...props }) => <TableRow {...props} />,
  th: ({ node, ...props }) => <TableHeader {...props} />,
  td: ({ node, ...props }) => <TableCell {...props} />,

  // Xử lý blockquote
  blockquote: ({ node, ...props }) => <BlockQuote {...props} />,

  // Xử lý links
  a: ({ node, ...props }) => <Link {...props} />,

  // Xử lý ảnh
  img: ({ node, src, alt, ...props }) => {
    return (
      <ImageContainer>
        <ImageWrapper>
          {src ? (
            <StyledImage src={src} alt={alt || "Image"} {...props} />
          ) : (
            <ImagePlaceholder>
              <Image size={48} color="#6a737d" />
              <span style={{ marginLeft: "8px", color: "#6a737d" }}>
                Image not available
              </span>
            </ImagePlaceholder>
          )}
        </ImageWrapper>
        {alt && <ImageCaption>{alt}</ImageCaption>}
      </ImageContainer>
    );
  },

  // Xử lý danh sách
  ul: ({ node, ...props }) => <UnorderedList {...props} />,
  ol: ({ node, ...props }) => <OrderedList {...props} />,

  // Xử lý đoạn văn
  p: ({ node, ...props }) => <Paragraph {...props} />,

  // Xử lý inline code và code block
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <CodeBlock>
        <Pre>
          <CodeBlockCode
            className={match ? `language-${match[1]}` : ""}
            {...props}
          >
            {children}
          </CodeBlockCode>
        </Pre>
        {match && <CodeLanguage>Language: {match[1]}</CodeLanguage>}
      </CodeBlock>
    ) : (
      <InlineCode {...props}>{children}</InlineCode>
    );
  },

  // Xử lý small tag
  small: ({ node, ...props }) => <SmallText {...props} />,
};

// Extension system - Dễ dàng thêm renderers mới
const ExtensionContext = React.createContext({
  registerRenderer: () => {},
  getRenderers: () => ({}),
});

export const MarkdownExtensionProvider = ({ children }) => {
  const [customRenderers, setCustomRenderers] = useState({});

  const registerRenderer = (type, renderer) => {
    setCustomRenderers((prev) => ({
      ...prev,
      [type]: renderer,
    }));
  };

  const getRenderers = () => ({
    ...renderers,
    ...customRenderers,
  });

  return (
    <ExtensionContext.Provider value={{ registerRenderer, getRenderers }}>
      {children}
    </ExtensionContext.Provider>
  );
};

export const useMarkdownExtension = () => React.useContext(ExtensionContext);

// Main component
export default function MarkdownRenderer({ markdown, className }) {
  const [content, setContent] = useState(markdown || "");
  const { getRenderers } = useMarkdownExtension();

  useEffect(() => {
    if (markdown) {
      setContent(markdown);
    }
  }, [markdown]);

  // Xử lý trường hợp không có nội dung
  if (!content) {
    return <EmptyContent>No content to display</EmptyContent>;
  }

  return (
    <MarkdownContainer className={className}>
      <ReactMarkdown
        remarkPlugins={plugins.remarkPlugins}
        rehypePlugins={plugins.rehypePlugins}
        components={getRenderers()}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
}

// Example usage
function App() {
  const response =
    "# EfficienNet (2019)\n\n> [Rethinking Model](https://arxiv.org)\n\n## Benchmark Summary\n | Architecture | value | data | default *| \n| :------------:|:-----:|:-----:|:----:|\n| b0 | 93 | 19 | | \n | b1 | 87 | 33 | | \n| b2 | 82 | 41 | |\n| | \n\n <small> * infomation 256*256, Batch Size </small>\n\n ##<!-- [ALGORITHM] -->\n\n## Introduction \n\n";

  // Thêm image example
  const responseWithImage =
    response +
    "\n\n![EfficientNet Architecture](https://example.com/image.jpg)\n\n";

  return (
    <MarkdownExtensionProvider>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "16px" }}>
        <MarkdownRenderer markdown={responseWithImage} />
      </div>
    </MarkdownExtensionProvider>
  );
}

export default App;
