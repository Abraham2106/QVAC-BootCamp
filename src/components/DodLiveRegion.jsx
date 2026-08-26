export default function DodLiveRegion({ message }) {
  return (
    <p className="dod-feedback" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  )
}
