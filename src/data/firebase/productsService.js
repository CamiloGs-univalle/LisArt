// src/data/firebase/productsService.js
// ============================================================
// SERVICIO FIREBASE - CRUD COMPLETO DE PRODUCTOS
// Maneja todas las operaciones con la colección "products"
// ============================================================

import { db } from './config'
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore'

const COLLECTION = 'products'

// ─────────────────────────────────────────────
// 📦 OBTENER TODOS LOS PRODUCTOS
// ─────────────────────────────────────────────
export const getAllProducts = async () => {
    try {
        const snapshot = await getDocs(collection(db, COLLECTION))
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error('❌ Error obteniendo productos:', error)
        throw error
    }
}

// ─────────────────────────────────────────────
// 🔍 OBTENER PRODUCTOS POR SECCIÓN
// Ejemplo: section = "carousel_cajas" | "grid_arreglos"
// ─────────────────────────────────────────────
export const getProductsBySection = async (section) => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('section', '==', section)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error(`❌ Error obteniendo productos de sección "${section}":`, error)
        throw error
    }
}

// ─────────────────────────────────────────────
// ⭐ OBTENER PRODUCTO DESTACADO
// ─────────────────────────────────────────────
export const getFeaturedProduct = async () => {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('featured', '==', true)
        )
        const snapshot = await getDocs(q)
        if (snapshot.empty) return null
        const docSnap = snapshot.docs[0]
        return { id: docSnap.id, ...docSnap.data() }
    } catch (error) {
        console.error('❌ Error obteniendo producto destacado:', error)
        throw error
    }
}

// ─────────────────────────────────────────────
// ➕ CREAR PRODUCTO NUEVO
// ─────────────────────────────────────────────
export const createProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION), {
            ...productData,
            createdAt: new Date().toISOString()
        })
        return { id: docRef.id, ...productData }
    } catch (error) {
        console.error('❌ Error creando producto:', error)
        throw error
    }
}

// ─────────────────────────────────────────────
// ✏️ ACTUALIZAR CAMPO ESPECÍFICO DE UN PRODUCTO
// Ejemplo: updateProductField("abc123", "name", "Nuevo nombre")
// ─────────────────────────────────────────────
export const updateProductField = async (productId, field, value) => {
    try {
        const docRef = doc(db, COLLECTION, productId)
        await updateDoc(docRef, {
            [field]: value,
            updatedAt: new Date().toISOString()
        })
        return true
    } catch (error) {
        console.error(`❌ Error actualizando campo "${field}" del producto "${productId}":`, error)
        throw error
    }
}

// ─────────────────────────────────────────────
// 🖼 ACTUALIZAR IMAGEN DE UN PRODUCTO
// Recibe la URL segura de Cloudinary
// ─────────────────────────────────────────────
export const updateProductImage = async (productId, imageUrl) => {
    return updateProductField(productId, 'image', imageUrl)
}

// ─────────────────────────────────────────────
// 🗑 ELIMINAR PRODUCTO
// ─────────────────────────────────────────────
export const deleteProduct = async (productId) => {
    try {
        await deleteDoc(doc(db, COLLECTION, productId))
        return true
    } catch (error) {
        console.error(`❌ Error eliminando producto "${productId}":`, error)
        throw error
    }
}

// ─────────────────────────────────────────────
// 🔄 REEMPLAZAR TODO UN PRODUCTO
// ─────────────────────────────────────────────
export const setProduct = async (productId, productData) => {
    try {
        await setDoc(doc(db, COLLECTION, productId), {
            ...productData,
            updatedAt: new Date().toISOString()
        })
        return true
    } catch (error) {
        console.error(`❌ Error guardando producto "${productId}":`, error)
        throw error
    }
}