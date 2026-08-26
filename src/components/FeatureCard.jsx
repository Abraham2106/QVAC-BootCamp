import CourseCard from './CourseCard'

export default function FeatureCard({ tag, title, body, className, children }) {
  return (
    <CourseCard
      tag={tag}
      title={title}
      body={body}
      className={className}
      interactive
    >
      {children}
    </CourseCard>
  )
}
