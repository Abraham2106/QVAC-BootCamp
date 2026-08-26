import { Link } from 'react-router-dom'
import CourseCard from './CourseCard'
import Reveal from './Reveal'

export default function ClassPreviewCard({ to, tag, title, body, badges, delay = 0, className }) {
  const card = (
    <CourseCard
      tag={tag}
      title={title}
      body={body}
      badges={badges}
      className={className}
      interactive
    />
  )

  return (
    <Reveal delay={delay} className="h-full">
      {to ? (
        <Link to={to} className="block h-full no-underline text-inherit">
          {card}
        </Link>
      ) : (
        card
      )}
    </Reveal>
  )
}
