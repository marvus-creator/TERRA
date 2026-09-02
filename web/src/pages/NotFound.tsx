import { Button } from '../components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="overline">404</div>
      <h1 className="font-display mt-2 text-4xl text-olive">This field is off the map.</h1>
      <p className="mt-3 text-muted">The page you asked for does not exist. The satellite did look.</p>
      <div className="mt-6 flex justify-center">
        <Button to="/" variant="primary">
          Back home
        </Button>
      </div>
    </div>
  )
}
