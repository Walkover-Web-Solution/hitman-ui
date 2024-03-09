import '../../src/index.css'
import { ClientOnly } from './[[...slug]]'
 
export function generateStaticParams() {
  return [{ slug: [''] }]
}
 
export default function Page() {
  return <ClientOnly />
}