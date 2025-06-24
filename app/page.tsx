import HomeContent from "./components/HomeContent"

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return <HomeContent defaultTab={searchParams.tab as string} />
}
