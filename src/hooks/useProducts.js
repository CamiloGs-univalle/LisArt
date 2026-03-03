// src/hooks/useProducts.js
import { useEffect, useState, useCallback } from 'react'
import { db } from '../data/firebase/config'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore'
import { uploadToCloudinary } from '../data/cloudinary/uploadToCloudinary'

const COL = 'products'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
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
      category:  'Categoría',
      price:     0,
      image:     'https://placehold.co/400x400?text=Imagen',
      badge:     '',
      rating:    '',
      section:   sectionId,
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

  // 🗑 ELIMINAR
  const deleteProduct = useCallback(async (productId) => {
    await deleteDoc(doc(db, COL, productId))
    setProducts(prev => prev.filter(p => p.id !== productId))
  }, [])

  const getBySection = useCallback((s) => products.filter(p => p.section === s), [products])
  const getFeatured  = useCallback(()   => products.find(p => p.featured) || null, [products])

  return { products, loading, error, refetch: fetchProducts, createProduct, updateField, updateImage, deleteProduct, getBySection, getFeatured }
}