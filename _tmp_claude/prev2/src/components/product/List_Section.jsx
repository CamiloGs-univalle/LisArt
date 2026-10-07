// Lista horizontal (imagen + info) — reutiliza GridSection
import GridSection from './GridSection'

function ListSection({ products, sectionId, copy }) {
  return <GridSection products={products} sectionId={sectionId} copy={copy} variant="list" layout="list" />
}

export default ListSection
