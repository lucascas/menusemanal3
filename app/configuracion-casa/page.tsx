import MainLayout from "@/components/MainLayout"
import ConfiguracionCasa from "@/components/ConfiguracionCasa"

export default function ConfiguracionCasaPage() {
  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <ConfiguracionCasa />
      </div>
    </MainLayout>
  )
}

