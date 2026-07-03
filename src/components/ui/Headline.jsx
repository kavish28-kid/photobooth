export default function Headline({ as: Tag = "h2", children, className = "" }) {
  return <Tag className={className}>{children}</Tag>;
}
