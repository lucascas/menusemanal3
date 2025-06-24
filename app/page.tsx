import { Suspense } from "react"
import HomeContent from "./components/HomeContent"

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeContent defaultTab={searchParams.tab as string} />
    </Suspense>
  )
}
