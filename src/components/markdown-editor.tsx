interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  id,
  className = '',
}: MarkdownEditorProps) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`markdown-editor w-full min-h-[400px] p-3 border border-input bg-background text-foreground rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${className}`}
    />
  );
}
