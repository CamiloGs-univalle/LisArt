// Herramientas que solo usa el dueño del catálogo. Viven en un archivo aparte
// para que los clientes nunca las descarguen (el catálogo abre más rápido).
import EditorPanel from '@/features/editor/panel/EditorPanel'
import EditorBar from '@/features/editor/EditorBar'
import { PhotoManager, SectionsPicker } from '@/features/editor/AdminTools'

export default function OwnerTools({ panel, openPanel, closePanel }) {
  return (
    <>
      <EditorPanel open={!!panel} initialTab={typeof panel === 'string' ? panel : undefined} onClose={closePanel} />
      <PhotoManager />
      <SectionsPicker />
      <EditorBar onOpenPanel={openPanel} />
    </>
  )
}
