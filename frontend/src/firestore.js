import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore'

// Applications
export const createApplication = async (userId, data) => {
  const docRef = await addDoc(collection(db, `users/${userId}/applications`), {
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  })
  return { id: docRef.id, ...data }
}

export const getApplications = async (userId) => {
  const q = query(
    collection(db, `users/${userId}/applications`),
    orderBy('order_position', 'asc'),
    orderBy('date_submitted', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))
}

export const updateApplication = async (userId, appId, data) => {
  const ref = doc(db, `users/${userId}/applications/${appId}`)
  await updateDoc(ref, {
    ...data,
    updated_at: new Date(),
  })
}

export const deleteApplication = async (userId, appId) => {
  await deleteDoc(doc(db, `users/${userId}/applications/${appId}`))
}

export const reorderApplications = async (userId, updates) => {
  const batch = writeBatch(db)
  updates.forEach(({ id, order_position }) => {
    const ref = doc(db, `users/${userId}/applications/${id}`)
    batch.update(ref, { order_position })
  })
  await batch.commit()
}

// Interview Prep
export const getInterviewPrep = async (userId, appId) => {
  try {
    const ref = doc(db, `users/${userId}/interviewPrep/${appId}`)
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (err) {
    return null
  }
}

export const saveInterviewPrep = async (userId, appId, data) => {
  const ref = doc(db, `users/${userId}/interviewPrep/${appId}`)
  await updateDoc(ref, {
    ...data,
    updated_at: new Date(),
  }).catch(async () => {
    // Create if doesn't exist
    await addDoc(collection(db, `users/${userId}/interviewPrep`), {
      application_id: appId,
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    })
  })
}

export const deleteInterviewPrep = async (userId, appId) => {
  const ref = doc(db, `users/${userId}/interviewPrep/${appId}`)
  await deleteDoc(ref)
}

export const getInterviewPrepHistory = async (userId) => {
  const q = query(
    collection(db, `users/${userId}/interviewPrep`),
    orderBy('updated_at', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    application_id: doc.id,
    ...doc.data(),
  }))
}
