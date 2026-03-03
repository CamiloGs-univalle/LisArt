// src/data/firebase/contentService.js
// ============================================================
// SERVICIO FIREBASE - TEXTOS EDITABLES DEL SITIO
// Maneja la colección "site_content" para textos dinámicos
// ============================================================

import { db } from './config'
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore'

const COLLECTION = 'site_content'

// ─────────────────────────────────────────────
// 📖 OBTENER UN TEXTO POR ID
// ─────────────────────────────────────────────
export const getContentById = async (id) => {
    try {
        const docRef = doc(db, COLLECTION, id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return docSnap.data().value
        }
        return null
    } catch (error) {
        console.error(`❌ Error obteniendo contenido "${id}":`, error)
        throw error
    }
}

// ─────────────────────────────────────────────
// 💾 GUARDAR O ACTUALIZAR UN TEXTO
// ─────────────────────────────────────────────
export const saveContent = async (id, value) => {
    try {
        const docRef = doc(db, COLLECTION, id)
        await setDoc(docRef, {
            value: String(value),
            updatedAt: new Date().toISOString()
        })
        return true
    } catch (error) {
        console.error(`❌ Error guardando contenido "${id}":`, error)
        throw error
    }
}

// ─────────────────────────────────────────────
// 📦 OBTENER TODOS LOS TEXTOS DEL SITIO
// Útil para pre-cargar todo el contenido de una vez
// ─────────────────────────────────────────────
export const getAllContent = async () => {
    try {
        const snapshot = await getDocs(collection(db, COLLECTION))
        const result = {}
        snapshot.docs.forEach(doc => {
            result[doc.id] = doc.data().value
        })
        return result
    } catch (error) {
        console.error('❌ Error obteniendo todo el contenido:', error)
        throw error
    }
}