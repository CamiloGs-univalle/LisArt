// src/hooks/useProducts.js
import { useEffect, useState, useCallback, useRef } from 'react'
import { db } from '../data/firebase/config'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'
import { uploadToCloudinary } from '../data/cloudinary/uploadToCloudinary'
import { productSections } from '../data/catalog'

const COL = 'products'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Solo en desarrollo: datos de prueba inyectados para revisar el diseño sin Firebase
      if (import.meta.env.DEV && window.__LISART_DEMO__) {
        setProducts(window.__LISART_DEMO__)
        return
      }
      const snap = await getDocs(collection(db, COL))
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ➕ CREAR — actualiza estado local inmediatamente
  const createProduct = useCallback(async (sectionId) => {
    const data = {
      name:      'Nuevo Producto',
      category:  '',
      description: '',
      personalizacion: '',
      pricePrefix: '',
      price:     0,
      image:     'https://placehold.co/400x400?text=Imagen',
      badge:     '',
      rating:    '',
      section:   sectionId,
      sections:  [sectionId],
      featured:  sectionId === 'featured',
      createdAt: new Date().toISOString()
    }
    const ref     = await addDoc(collection(db, COL), data)
    const created = { id: ref.id, ...data }
    setProducts(prev => [...prev, created])
    return created
  }, [])

  // ✏️ EDITAR CAMPO — actualiza estado local inmediatamente
  const updateField = useCallback(async (productId, field, value) => {
    await updateDoc(doc(db, COL, productId), { [field]: value })
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, [field]: value } : p)
    )
  }, [])

  // 🖼 CAMBIAR IMAGEN — Cloudinary → Firebase → estado local
  const updateImage = useCallback(async (productId, file) => {
    const url = await uploadToCloudinary(file)
    await updateDoc(doc(db, COL, productId), { image: url })
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, image: url } : p)
    )
    return url
  }, [])

  // 🖼🖼 VARIAS FOTOS — campo "images" (fotos extra además de la portada)
  const productsRef = useRef(products)
  productsRef.current = products
  const findProduct = (id) => productsRef.current.find(p => p.id === id)

  const patchProduct = useCallback(async (productId, patch) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...patch } : p)))
    if (import.meta.env.DEV && window.__LISART_DEMO__) return
    await updateDoc(doc(db, COL, productId), patch)
  }, [])

  const addImages = useCallback(async (productId, files) => {
    const list = Array.from(files || []).filter(f => f.type?.startsWith('image/'))
    if (!list.length) return []
    const urls = []
    for (const f of list) urls.push(await uploadToCloudinary(f))
    const current = findProduct(productId)
    await patchProduct(productId, { images: [...(current?.images || []), ...urls] })
    return urls
  }, [patchProduct])

  const removeImage = useCallback(async (productId, url) => {
    const current = findProduct(productId)
    await patchProduct(productId, { images: (current?.images || []).filter(u => u !== url) })
  }, [patchProduct])

  const setCover = useCallback(async (productId, url) => {
    const current = findProduct(productId)
    if (!current) return
    const rest = (current.images || []).filter(u => u !== url)
    await patchProduct(productId, { image: url, images: current.image ? [current.image, ...rest] : rest })
  }, [patchProduct])

  // 🗂 SECCIONES — en qué secciones del catálogo aparece el producto
  const setSections = useCallback(async (productId, sections) => {
    await patchProduct(productId, { sections, section: sections[0] || '' })
  }, [patchProduct])

  // 🗑 ELIMINAR
  const deleteProduct = useCallback(async (productId) => {
    await deleteDoc(doc(db, COL, productId))
    setProducts(prev => prev.filter(p => p.id !== productId))
  }, [])

  // Un producto puede estar en varias secciones (campo "sections")
  const getBySection = useCallback((s) => products.filter(p => productSections(p).includes(s)), [products])
  const getFeatured  = useCallback(()   => products.find(p => p.featured) || null, [products])

  return { products, loading, error, refetch: fetchProducts, createProduct, updateField, updateImage, addImages, removeImage, setCover, setSections, deleteProduct, getBySection, getFeatured }
}